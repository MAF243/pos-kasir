<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    protected $fillable = ['invoice_no', 'shift_id', 'customer_id', 'subtotal', 'discount', 'total', 'pay', 'change', 'payment_method', 'status'];

    protected function casts(): array
    {
        return [
            'subtotal' => 'float',
            'discount' => 'float',
            'total' => 'float',
            'pay' => 'float',
            'change' => 'float',
        ];
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function transactionDetails(): HasMany
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function customerReturns(): HasMany
    {
        return $this->hasMany(CustomerReturn::class);
    }

    public function activeReturns(): HasMany
    {
        return $this->hasMany(CustomerReturn::class)->whereIn('status', ['pending', 'approved']);
    }
}
