<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Expense;
use App\Models\Shift;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with(['shift.user', 'user'])
            ->when($request->search, fn($q, $s) => $q->where('note', 'like', "%{$s}%"))
            ->latest();

        // Non-admins see only their own expenses
        if (!auth()->user()->hasRole('Admin')) {
            $query->where('user_id', auth()->id());
        }

        return Inertia::render('Expenses/Index', [
            'expenses' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['search']),
            'activeShift' => Shift::where('user_id', auth()->id())->where('status', 'open')->first(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'note' => 'required|string|max:255',
            'date' => 'required|date',
        ]);

        // CRITICAL: Must have an open shift to log an expense
        $activeShift = Shift::where('user_id', auth()->id())
                            ->where('status', 'open')
                            ->first();

        if (!$activeShift) {
            return back()->withErrors(['shift' => 'You must have an open shift to record an expense. The expense must be deducted from the active cash drawer.']);
        }

        Expense::create([
            'user_id' => auth()->id(),
            'shift_id' => $activeShift->id,
            'amount' => $request->amount,
            'note' => $request->note,
            'date' => $request->date,
        ]);

        return redirect()->route('expenses.index')->with('success', 'Expense recorded successfully.');
    }

    public function update(Request $request, Expense $expense)
    {
        // Only allow editing own expenses or admin
        if (!auth()->user()->hasRole('Admin') && $expense->user_id !== auth()->id()) {
            abort(403);
        }

        // Only allow editing if shift is still open
        if ($expense->shift->status !== 'open') {
            return back()->with('error', 'Cannot edit an expense from a closed shift.');
        }

        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'note' => 'required|string|max:255',
            'date' => 'required|date',
        ]);

        $expense->update($request->only('amount', 'note', 'date'));

        return redirect()->route('expenses.index')->with('success', 'Expense updated successfully.');
    }

    public function destroy(Expense $expense)
    {
        if (!auth()->user()->hasRole('Admin') && $expense->user_id !== auth()->id()) {
            abort(403);
        }

        if ($expense->shift->status !== 'open') {
            return back()->with('error', 'Cannot delete an expense from a closed shift.');
        }

        $expense->delete();

        return redirect()->route('expenses.index')->with('success', 'Expense deleted successfully.');
    }
}
