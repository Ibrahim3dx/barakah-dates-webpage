<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

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

        $products = $query->latest()->paginate(10);

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
}
