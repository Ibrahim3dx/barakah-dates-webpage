<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Integration extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'type',
        'credentials',
        'is_active',
        'settings',
        'last_sync_at'
    ];

    protected $casts = [
        'credentials' => 'encrypted:array',
        'settings' => 'array',
        'is_active' => 'boolean',
        'last_sync_at' => 'datetime'
    ];

    public function getCredential(string $key, $default = null)
    {
        return $this->credentials[$key] ?? $default;
    }

    public function setCredential(string $key, $value): void
    {
        $credentials = $this->credentials ?? [];
        $credentials[$key] = $value;
        $this->credentials = $credentials;
    }

    public function getSetting(string $key, $default = null)
    {
        return $this->settings[$key] ?? $default;
    }

    public function setSetting(string $key, $value): void
    {
        $settings = $this->settings ?? [];
        $settings[$key] = $value;
        $this->settings = $settings;
    }

    public function updateLastSync(): void
    {
        $this->update(['last_sync_at' => now()]);
    }
}
