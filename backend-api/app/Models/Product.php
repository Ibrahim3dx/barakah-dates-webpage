<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'category_id',
        'retail_price',
        'wholesale_price',
        'retail_buying_price',
        'wholesale_buying_price',
        'wholesale_threshold',
        'stock',
        'image',
        'is_active'
    ];

    protected $casts = [
        'category_id' => 'integer',
        'retail_price' => 'decimal:2',
        'wholesale_price' => 'decimal:2',
        'retail_buying_price' => 'decimal:2',
        'wholesale_buying_price' => 'decimal:2',
        'wholesale_threshold' => 'integer',
        'stock' => 'integer',
        'is_active' => 'boolean'
    ];

    // Add price and image_url to appends so they're included in JSON responses
    protected $appends = ['price', 'image_url'];

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
