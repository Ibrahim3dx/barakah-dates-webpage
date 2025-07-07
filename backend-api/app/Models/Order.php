<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'total_amount',
        'payment_method',
        'payment_status',
        'order_status',
        'is_wholesale',
        'notes'
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'is_wholesale' => 'boolean',
        'payment_status' => 'string',
        'order_status' => 'string'
    ];

    // Append order_number to JSON output
    protected $appends = ['order_number'];

    // Accessor for order_number - returns the id as order number
    public function getOrderNumberAttribute(): int
    {
        return $this->id;
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function calculateTotal(): void
    {
        $this->total_amount = $this->items->sum('total_price');
        $this->save();
    }

    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    public function isCompleted(): bool
    {
        return $this->order_status === 'completed';
    }
}
