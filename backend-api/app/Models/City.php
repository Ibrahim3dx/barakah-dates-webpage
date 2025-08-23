<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'delivery_price',
        'is_active'
    ];

    protected $casts = [
        'delivery_price' => 'decimal:2',
        'is_active' => 'boolean'
    ];
}
