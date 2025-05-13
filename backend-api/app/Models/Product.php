<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'price',
        'wholesale_price',
        'wholesale_threshold',
        'stock',
        'image',
        'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'wholesale_price' => 'decimal:2',
        'wholesale_threshold' => 'integer',
        'stock' => 'integer',
        'is_active' => 'boolean'
    ];

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getPriceForQuantity(int $quantity): float
    {
        if ($this->wholesale_threshold && $quantity >= $this->wholesale_threshold) {
            return $this->wholesale_price;
        }
        return $this->price;
    }

    public function isWholesale(int $quantity): bool
    {
        return $this->wholesale_threshold && $quantity >= $this->wholesale_threshold;
    }
}
