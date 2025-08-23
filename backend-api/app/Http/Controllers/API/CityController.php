<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class CityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = City::query();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        // Get per_page from request, default to 10, max 100
        $perPage = $request->get('per_page', 10);
        $perPage = min(max($perPage, 1), 100); // Ensure it's between 1 and 100

        $cities = $query->latest()->paginate($perPage);

        return response()->json($cities);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:cities,name',
            'delivery_price' => 'required|numeric|min:0',
            'is_active' => 'sometimes|in:true,false,1,0,on'
        ]);

        // Convert is_active to boolean
        if (isset($validated['is_active'])) {
            $validated['is_active'] = filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN);
        } else {
            $validated['is_active'] = true;
        }

        $city = City::create($validated);

        return response()->json($city, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(City $city)
    {
        return response()->json($city);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, City $city)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('cities')->ignore($city->id)],
            'delivery_price' => 'required|numeric|min:0',
            'is_active' => 'sometimes|in:true,false,1,0,on'
        ]);

        // Convert is_active to boolean
        if (isset($validated['is_active'])) {
            $validated['is_active'] = filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN);
        }

        $city->update($validated);

        return response()->json($city);
    }

    /**
     * Update the status of the specified resource.
     */
    public function updateStatus(Request $request, City $city)
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean'
        ]);

        $city->update($validated);

        return response()->json($city);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(City $city)
    {
        $city->delete();

        return response()->json(['message' => 'City deleted successfully']);
    }

    /**
     * Import cities from CSV file
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt'
        ]);

        try {
            $file = $request->file('file');
            $content = file_get_contents($file->getPathname());
            $lines = array_map('str_getcsv', explode("\n", trim($content)));

            if (empty($lines)) {
                return response()->json(['message' => 'Empty file'], 400);
            }

            $header = array_map('trim', $lines[0]);
            $requiredColumns = ['name', 'delivery_price'];
            $optionalColumns = ['is_active'];
            $allColumns = array_merge($requiredColumns, $optionalColumns);

            // Validate headers
            $missingColumns = array_diff($requiredColumns, $header);
            if (!empty($missingColumns)) {
                return response()->json([
                    'message' => 'Missing required columns in CSV file',
                    'missing_columns' => $missingColumns,
                    'found_columns' => $header,
                    'required_columns' => $requiredColumns,
                    'help' => 'Please ensure your CSV file has these required columns: ' . implode(', ', $requiredColumns)
                ], 400);
            }

            $data = array_slice($lines, 1); // Skip header
            $created = 0;
            $updated = 0;
            $errors = [];

            DB::beginTransaction();

            foreach ($data as $index => $row) {
                if (empty($row) || (count($row) === 1 && empty($row[0]))) {
                    continue; // Skip empty rows
                }

                try {
                    $cityData = [];

                    // Map CSV columns to database columns
                    foreach ($header as $colIndex => $column) {
                        if (in_array($column, $allColumns) && isset($row[$colIndex])) {
                            $value = trim($row[$colIndex]);

                            switch ($column) {
                                case 'name':
                                    $cityData['name'] = $value;
                                    break;
                                case 'delivery_price':
                                    $cityData['delivery_price'] = (float) $value;
                                    break;
                                case 'is_active':
                                    $cityData['is_active'] = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? true;
                                    break;
                            }
                        }
                    }

                    if (empty($cityData['name'])) {
                        $errors[] = ['row' => $index + 2, 'error' => 'Missing city name'];
                        continue;
                    }

                    if (!isset($cityData['delivery_price'])) {
                        $errors[] = ['row' => $index + 2, 'error' => 'Missing delivery price'];
                        continue;
                    }

                    // Check if city exists
                    $existingCity = City::where('name', $cityData['name'])->first();

                    if ($existingCity) {
                        $existingCity->update($cityData);
                        $updated++;
                    } else {
                        City::create($cityData);
                        $created++;
                    }

                } catch (\Exception $e) {
                    $errors[] = ['row' => $index + 2, 'error' => $e->getMessage()];
                }
            }

            DB::commit();

            $summary = [
                'created' => $created,
                'updated' => $updated,
                'errors' => $errors
            ];

            if (!empty($errors)) {
                return response()->json([
                    'message' => 'Import completed with errors',
                    'summary' => $summary
                ], 207); // 207 Multi-Status
            }

            return response()->json([
                'message' => 'Import completed successfully',
                'summary' => $summary
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Import failed: ' . $e->getMessage()], 500);
        }
    }
}
