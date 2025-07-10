<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $period = $request->get('period', 'month'); // Changed default from 'today' to 'month'
        $from = $request->get('from');
        $to = $request->get('to');

        // If date range is provided, use it; otherwise use period
        if ($from && $to) {
            $startDate = Carbon::parse($from)->startOfDay();
            $endDate = Carbon::parse($to)->endOfDay();
        } else {
            $startDate = $this->getStartDate($period);
            $endDate = now();
        }

        $stats = [
            'total_orders' => Order::whereBetween('created_at', [$startDate, $endDate])->count(),
            'total_products' => Product::count(),
            'total_users' => User::count(),
            'total_revenue' => Order::whereBetween('created_at', [$startDate, $endDate])
                ->where('payment_status', 'paid')
                ->sum('total_amount'),
            'total_profit' => $this->calculateProfit($startDate, $endDate),
            'average_order_value' => $this->calculateAverageOrderValue($startDate, $endDate),
            'top_products' => $this->getTopProducts($startDate, $endDate, 5),
            'order_status_distribution' => $this->getOrderStatusDistribution($startDate, $endDate),
            'payment_method_distribution' => $this->getPaymentMethodDistribution($startDate, $endDate),
            'recent_orders' => $this->getRecentOrders(5),
            'low_stock_products' => $this->getLowStockProducts(10) // Products with stock <= 10
        ];

        return response()->json($stats);
    }

    private function calculateProfit($startDate, $endDate)
    {
        $orderItems = OrderItem::whereHas('order', function ($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate])
                  ->where('payment_status', 'paid');
        })->with('product')->get();

        $totalProfit = 0;

        foreach ($orderItems as $item) {
            if ($item->product) {
                $costPrice = $item->is_wholesale
                    ? ($item->product->wholesale_buying_price ?? $item->product->retail_buying_price ?? 0)
                    : ($item->product->retail_buying_price ?? 0);

                $sellingPrice = $item->unit_price;
                $profitPerItem = $sellingPrice - $costPrice;
                $totalProfit += $profitPerItem * $item->quantity;
            }
        }

        return $totalProfit;
    }

    public function revenue(Request $request)
    {
        $period = $request->get('period', 'monthly');
        $from = $request->get('from');
        $to = $request->get('to');

        // If date range is provided, use it; otherwise use period
        if ($from && $to) {
            $startDate = Carbon::parse($from)->startOfDay();
            $endDate = Carbon::parse($to)->endOfDay();
        } else {
            $startDate = $this->getStartDate($period);
            $endDate = now();
        }

        $revenue = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as amount')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json(['data' => $revenue]);
    }

    public function orders()
    {
        $orders = Order::with('user')
            ->latest()
            ->limit(10)
            ->get();

        return response()->json($orders);
    }

    public function products()
    {
        $products = Product::with('category')
            ->latest()
            ->limit(10)
            ->get();

        return response()->json($products);
    }

    public function users()
    {
        $users = User::latest()
            ->limit(10)
            ->get();

        return response()->json($users);
    }

    public function profit(Request $request)
    {
        $period = $request->get('period', 'monthly');
        $from = $request->get('from');
        $to = $request->get('to');

        // If date range is provided, use it; otherwise use period
        if ($from && $to) {
            $startDate = Carbon::parse($from)->startOfDay();
            $endDate = Carbon::parse($to)->endOfDay();
        } else {
            $startDate = $this->getStartDate($period);
            $endDate = now();
        }

        $profit = OrderItem::whereHas('order', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate])
                    ->where('payment_status', 'paid');
            })
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_price - (unit_price * quantity)) as amount')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json(['data' => $profit]);
    }

    public function bestSellers(Request $request)
    {
        $period = $request->get('period', 'monthly');
        $from = $request->get('from');
        $to = $request->get('to');
        $limit = $request->get('limit', 10);

        // If date range is provided, use it; otherwise use period
        if ($from && $to) {
            $startDate = Carbon::parse($from)->startOfDay();
            $endDate = Carbon::parse($to)->endOfDay();
        } else {
            $startDate = $this->getStartDate($period);
            $endDate = now();
        }

        $bestSellers = OrderItem::whereHas('order', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate])
                    ->where('payment_status', 'paid');
            })
            ->select(
                'product_id',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(total_price) as total_revenue')
            )
            ->with('product:id,name,retail_price')
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

    private function calculateAverageOrderValue(Carbon $startDate, Carbon $endDate): float
    {
        return Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->avg('total_amount') ?? 0;
    }

    private function getTopProducts(Carbon $startDate, Carbon $endDate, int $limit = 5): array
    {
        return OrderItem::whereHas('order', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate])
                    ->where('payment_status', 'paid');
            })
            ->select(
                'product_id',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(total_price) as total_revenue')
            )
            ->with('product:id,name,retail_price')
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    private function getOrderStatusDistribution(Carbon $startDate, Carbon $endDate): array
    {
        return Order::whereBetween('created_at', [$startDate, $endDate])
            ->select('order_status', DB::raw('count(*) as count'))
            ->groupBy('order_status')
            ->get()
            ->toArray();
    }

    private function getPaymentMethodDistribution(Carbon $startDate, Carbon $endDate): array
    {
        return Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->select('payment_method', DB::raw('count(*) as count'))
            ->groupBy('payment_method')
            ->get()
            ->toArray();
    }

    private function getRecentOrders(int $limit = 5): array
    {
        return Order::with(['user:id,name,email'])
            ->select('id', 'customer_name', 'customer_email', 'total_amount', 'order_status', 'payment_status', 'created_at', 'user_id')
            ->latest()
            ->limit($limit)
            ->get()
            ->toArray();
    }

    private function getLowStockProducts(int $threshold = 10): array
    {
        return Product::where('stock', '<=', $threshold)
            ->where('is_active', true)
            ->select('id', 'name', 'stock', 'retail_price as price')
            ->orderBy('stock', 'asc')
            ->get()
            ->toArray();
    }
}
