<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\User;
use App\Models\Category;
use Spatie\Permission\Models\Role;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_products' => Product::count(),
            'total_users' => User::count(),
            'total_roles' => Role::count(),
            'total_categories' => Category::count(),
        ];

        return Inertia::render('Dashboard/Index', [
            'stats' => $stats
        ]);
    }
}
