<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $period = $request->get('period', 'today');
        $startDate = $this->getStartDate($period);
        
        $stats = [
            'total_orders' => Order::where('created_at', '>=', $startDate)->count(),
            'total_revenue' => Order::where('created_at', '>=', $startDate)
                ->where('payment_status', 'paid')
                ->sum('total_amount'),
            'total_profit' => $this->calculateProfit($startDate),
            'average_order_value' => $this->calculateAverageOrderValue($startDate),
            'top_products' => $this->getTopProducts($startDate, 5),
            'order_status_distribution' => $this->getOrderStatusDistribution($startDate),
            'payment_method_distribution' => $this->getPaymentMethodDistribution($startDate)
        ];

        return response()->json($stats);
    }

    public function revenue(Request $request)
    {
        $period = $request->get('period', 'monthly');
        $startDate = $this->getStartDate($period);
        
        $revenue = Order::where('created_at', '>=', $startDate)
            ->where('payment_status', 'paid')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as total')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($revenue);
    }

    public function profit(Request $request)
    {
        $period = $request->get('period', 'monthly');
        $startDate = $this->getStartDate($period);
        
        $profit = OrderItem::whereHas('order', function ($query) use ($startDate) {
                $query->where('created_at', '>=', $startDate)
                    ->where('payment_status', 'paid');
            })
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_price - (unit_price * quantity)) as total_profit')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($profit);
    }

    public function bestSellers(Request $request)
    {
        $period = $request->get('period', 'monthly');
        $startDate = $this->getStartDate($period);
        $limit = $request->get('limit', 10);

        $bestSellers = OrderItem::whereHas('order', function ($query) use ($startDate) {
                $query->where('created_at', '>=', $startDate)
                    ->where('payment_status', 'paid');
            })
            ->select(
                'product_id',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(total_price) as total_revenue')
            )
            ->with('product:id,name,price')
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->limit($limit)
            ->get();

        return response()->json($bestSellers);
    }

    private function getStartDate(string $period): Carbon
    {
        return match($period) {
            'today' => Carbon::today(),
            'yesterday' => Carbon::yesterday(),
            'week' => Carbon::now()->subWeek(),
            'month' => Carbon::now()->subMonth(),
            'year' => Carbon::now()->subYear(),
            default => Carbon::now()->subMonth()
        };
    }

    private function calculateProfit(Carbon $startDate): float
    {
        return OrderItem::whereHas('order', function ($query) use ($startDate) {
                $query->where('created_at', '>=', $startDate)
                    ->where('payment_status', 'paid');
            })
            ->sum(DB::raw('total_price - (unit_price * quantity)'));
    }

    private function calculateAverageOrderValue(Carbon $startDate): float
    {
        return Order::where('created_at', '>=', $startDate)
            ->where('payment_status', 'paid')
            ->avg('total_amount') ?? 0;
    }

    private function getTopProducts(Carbon $startDate, int $limit = 5): array
    {
        return OrderItem::whereHas('order', function ($query) use ($startDate) {
                $query->where('created_at', '>=', $startDate)
                    ->where('payment_status', 'paid');
            })
            ->select(
                'product_id',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(total_price) as total_revenue')
            )
            ->with('product:id,name,price')
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    private function getOrderStatusDistribution(Carbon $startDate): array
    {
        return Order::where('created_at', '>=', $startDate)
            ->select('order_status', DB::raw('count(*) as count'))
            ->groupBy('order_status')
            ->get()
            ->toArray();
    }

    private function getPaymentMethodDistribution(Carbon $startDate): array
    {
        return Order::where('created_at', '>=', $startDate)
            ->where('payment_status', 'paid')
            ->select('payment_method', DB::raw('count(*) as count'))
            ->groupBy('payment_method')
            ->get()
            ->toArray();
    }
}
