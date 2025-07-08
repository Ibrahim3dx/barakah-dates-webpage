<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Category::query();

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

        $categories = $query->withCount('products')->latest()->paginate(10);

        return response()->json($categories);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean'
        ]);

        // Generate slug from name
        $validated['slug'] = Str::slug($validated['name']);

        // Ensure slug is unique
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Category::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        // Set default active state
        if (!isset($validated['is_active'])) {
            $validated['is_active'] = true;
        }

        $category = Category::create($validated);

        return response()->json($category, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        return response()->json($category->load('products'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('categories', 'name')->ignore($category->id)],
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean'
        ]);

        // Update slug if name changed
        if (isset($validated['name']) && $validated['name'] !== $category->name) {
            $baseSlug = Str::slug($validated['name']);
            $validated['slug'] = $baseSlug;

            // Ensure slug is unique
            $counter = 1;
            while (Category::where('slug', $validated['slug'])->where('id', '!=', $category->id)->exists()) {
                $validated['slug'] = $baseSlug . '-' . $counter;
                $counter++;
            }
        }

        $category->update($validated);

        return response()->json($category);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Check if category has products
        if ($category->products()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete category that has products. Please move or delete products first.'
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully'
        ]);
    }
}
