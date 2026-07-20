<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Shift;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CashierShiftController extends Controller
{
    public function index()
    {
        $query = Shift::with('user')->latest();
        
        // If not admin, only show own shifts
        if (!auth()->user()->hasRole('Admin')) {
            $query->where('user_id', auth()->id());
        }

        return Inertia::render('Shifts/Index', [
            'shifts' => $query->paginate(10),
        ]);
    }

    public function create()
    {
        $hasActiveShift = Shift::where('user_id', auth()->id())
                              ->where('status', 'open')
                              ->exists();

        return Inertia::render('Shifts/Create', [
            'hasActiveShift' => $hasActiveShift
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'starting_cash' => 'required|numeric|min:0',
        ]);

        $hasActiveShift = Shift::where('user_id', auth()->id())
                              ->where('status', 'open')
                              ->exists();

        if ($hasActiveShift) {
            return redirect()->route('shifts.index')->with('error', 'You already have an open shift. Please close it first.');
        }

        Shift::create([
            'user_id' => auth()->id(),
            'start_time' => now(),
            'starting_cash' => $request->starting_cash,
            'status' => 'open',
        ]);

        return redirect()->route('shifts.index')->with('success', 'Shift opened successfully.');
    }

    public function show(Shift $shift)
    {
        // Check authorization if not admin
        if (!auth()->user()->hasRole('Admin') && $shift->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Shifts/Show', [
            'shift' => $shift->load('user'),
        ]);
    }

    public function update(Request $request, Shift $shift)
    {
        if (!auth()->user()->hasRole('Admin') && $shift->user_id !== auth()->id()) {
            abort(403);
        }

        if ($shift->status !== 'open') {
            return back()->with('error', 'This shift is already closed.');
        }

        $request->validate([
            'ending_cash' => 'required|numeric|min:0',
        ]);

        $shift->update([
            'end_time' => now(),
            'ending_cash' => $request->ending_cash,
            'status' => 'closed',
        ]);

        return redirect()->route('shifts.index')->with('success', 'Shift closed successfully.');
    }
}
