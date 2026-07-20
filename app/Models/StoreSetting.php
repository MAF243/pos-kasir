<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Casts\Attribute;

class StoreSetting extends Model
{
    protected $fillable = ['name', 'address', 'phone', 'logo', 'receipt_footer'];

    protected $appends = ['image_url'];

    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->logo ? Storage::url($this->logo) : null,
        );
    }
}
