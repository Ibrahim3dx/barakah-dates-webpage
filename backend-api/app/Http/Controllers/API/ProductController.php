<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::with('category');

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->get('category_id'));
        }

        // Get per_page from request, default to 10, max 100
        $perPage = $request->get('per_page', 10);
        $perPage = min(max($perPage, 1), 100); // Ensure it's between 1 and 100

        $products = $query->latest()->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'wholesale_price' => 'nullable|numeric|min:0',
            'retail_buying_price' => 'nullable|numeric|min:0',
            'wholesale_buying_price' => 'nullable|numeric|min:0',
            'wholesale_threshold' => 'nullable|integer|min:1',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'sometimes|in:true,false,1,0,on'
        ]);

        // Convert is_active to boolean
        if (isset($validated['is_active'])) {
            $validated['is_active'] = filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN);
        } else {
            // If is_active is not provided, set to true by default for new products
            $validated['is_active'] = true;
        }

        // Convert price to retail_price for database storage
        if (isset($validated['price'])) {
            $validated['retail_price'] = $validated['price'];
            unset($validated['price']);
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = $path;
        }

        $product = Product::create($validated);

        return response()->json($product, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return response()->json($product->load('category'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'wholesale_price' => 'nullable|numeric|min:0',
            'retail_buying_price' => 'nullable|numeric|min:0',
            'wholesale_buying_price' => 'nullable|numeric|min:0',
            'wholesale_threshold' => 'nullable|integer|min:1',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'sometimes|in:true,false,1,0,on'
        ]);

        // Convert is_active to boolean
        if (isset($validated['is_active'])) {
            $validated['is_active'] = filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN);
        }

        // Convert price to retail_price for database storage
        if (isset($validated['price'])) {
            $validated['retail_price'] = $validated['price'];
            unset($validated['price']);
        }

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = $path;
        }

        $product->update($validated);

        return response()->json($product);
    }

    public function updateStock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'stock' => 'required|integer|min:0'
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Stock updated successfully',
            'product' => $product
        ]);
    }

    public function updateStatus(Request $request, Product $product)
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean'
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Status updated successfully',
            'product' => $product
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }

    /**
     * Import products from a CSV file.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048'
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        if (!$handle) {
            return response()->json(['message' => 'Unable to open uploaded file'], 422);
        }

        $requiredHeaders = [
            'name', 'description', 'price', 'wholesale_price', 'wholesale_threshold', 'stock', 'is_active', 'category_id'
        ];

        $header = fgetcsv($handle);
        if (!$header) {
            return response()->json(['message' => 'Empty CSV file'], 422);
        }
        $normalizedHeader = array_map(fn($h) => strtolower(trim($h)), $header);

        $missingHeaders = [];
        foreach ($requiredHeaders as $req) {
            if (!in_array($req, $normalizedHeader, true)) {
                $missingHeaders[] = $req;
            }
        }

        if (!empty($missingHeaders)) {
            return response()->json([
                'message' => 'Missing required columns in CSV file',
                'missing_columns' => $missingHeaders,
                'required_columns' => $requiredHeaders,
                'found_columns' => $normalizedHeader,
                'help' => 'Please download the sample CSV file to see the correct format'
            ], 422);
        }

        $indexes = array_flip($normalizedHeader);
        $created = 0; $updated = 0; $rows = 0; $errors = [];

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($handle)) !== false) {
                $rows++;
                if (count(array_filter($row)) === 0) { // skip empty line
                    continue;
                }
                try {
                    $data = [];
                    foreach ($requiredHeaders as $col) {
                        $data[$col] = $row[$indexes[$col]] ?? null;
                    }

                    // Basic sanitation & casting
                    $payload = [
                        'name' => trim($data['name'] ?? ''),
                        'description' => $data['description'] ?? null,
                        'retail_price' => is_numeric($data['price']) ? (float)$data['price'] : null,
                        'wholesale_price' => is_numeric($data['wholesale_price']) ? (float)$data['wholesale_price'] : null,
                        'wholesale_threshold' => is_numeric($data['wholesale_threshold']) ? (int)$data['wholesale_threshold'] : null,
                        'stock' => is_numeric($data['stock']) ? (int)$data['stock'] : 0,
                        'is_active' => isset($data['is_active']) ? (filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? 0) : 1,
                        'category_id' => is_numeric($data['category_id']) ? (int)$data['category_id'] : null
                    ];

                    if ($payload['name'] === '' || $payload['retail_price'] === null) {
                        throw new \Exception('Missing required name or price');
                    }

                    if ($payload['category_id'] === null) {
                        throw new \Exception('Missing or invalid category_id');
                    }

                    // Check if category exists
                    if (!\App\Models\Category::where('id', $payload['category_id'])->exists()) {
                        throw new \Exception('Category with ID ' . $payload['category_id'] . ' does not exist');
                    }

                    $product = Product::where('name', $payload['name'])->first();
                    if ($product) {
                        // Update existing product
                        $product->update(array_filter($payload, function($value) {
                            return $value !== null;
                        }));
                        $updated++;
                    } else {
                        // Create new product
                        Product::create($payload);
                        $created++;
                    }
                } catch (\Throwable $e) {
                    $errors[] = [
                        'row' => $rows + 1, // account for header
                        'error' => $e->getMessage()
                    ];
                }
            }
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Import failed',
                'error' => $e->getMessage()
            ], 500);
        } finally {
            fclose($handle);
        }

        return response()->json([
            'message' => 'Import completed',
            'summary' => [
                'total_rows_processed' => $rows,
                'created' => $created,
                'updated' => $updated,
                'errors' => $errors
            ]
        ]);
    }
}
