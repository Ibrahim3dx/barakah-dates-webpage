<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'category_id',
        'retail_price',
        'wholesale_price',
        'retail_buying_price',
        'wholesale_buying_price',
        'wholesale_threshold',
        'stock',
        'image',
        'is_active',
        'is_always_in_stock'
    ];

    protected $casts = [
        'category_id' => 'integer',
        'retail_price' => 'decimal:2',
        'wholesale_price' => 'decimal:2',
        'retail_buying_price' => 'decimal:2',
        'wholesale_buying_price' => 'decimal:2',
        'wholesale_threshold' => 'integer',
        'stock' => 'integer',
        'is_active' => 'boolean',
        'is_always_in_stock' => 'boolean'
    ];

    // Add price and image_url to appends so they're included in JSON responses
    protected $appends = ['price', 'image_url'];

    /**
     * Boot method to auto-generate slug
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = $product->generateUniqueSlug($product->name);
            }
        });

        static::updating(function ($product) {
            if ($product->isDirty('name') && empty($product->slug)) {
                $product->slug = $product->generateUniqueSlug($product->name);
            }
        });
    }

    /**
     * Generate a unique slug for the product
     */
    public function generateUniqueSlug($name)
    {
        $slug = Str::slug($name);
        $count = static::where('slug', $slug)->count();

        if ($count > 0) {
            $slug = $slug . '-' . ($count + 1);
        }

        return $slug;
    }

    // Accessor for price - returns retail_price
    public function getPriceAttribute(): float
    {
        return (float) ($this->retail_price ?? 0);
    }

    // Mutator for price - sets retail_price
    public function setPriceAttribute($value): void
    {
        $this->attributes['retail_price'] = $value;
    }

    // Accessor for image_url - returns full URL to the image
    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }

        // If it's already a full URL (like seeded data), return as is
        if (str_starts_with($this->image, 'http')) {
            return $this->image;
        }

        // If it's a relative path, prepend the storage URL
        return url('storage/' . $this->image);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function getPriceForQuantity(int $quantity): float
    {
        if ($this->wholesale_threshold && $quantity >= $this->wholesale_threshold) {
            return $this->wholesale_price;
        }
        return $this->retail_price;
    }

    public function isWholesale(int $quantity): bool
    {
        return $this->wholesale_threshold && $quantity >= $this->wholesale_threshold;
    }
}
