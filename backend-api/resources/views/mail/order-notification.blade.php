<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>طلب جديد #{{ $order->id }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
            direction: rtl;
            text-align: right;
        }
        .container {
            max-width: 800px;
            margin: 20px auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            background: #2c5530;
            color: white;
            padding: 20px;
            text-align: center;
            margin: -20px -20px 20px -20px;
            border-radius: 8px 8px 0 0;
        }
        .section {
            margin: 20px 0;
            padding: 15px;
            border-right: 4px solid #2c5530;
            background: #f9f9f9;
            text-align: right;
        }
        .section h3 {
            margin: 0 0 10px 0;
            color: #2c5530;
            text-align: right;
        }
        .order-items {
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .item {
            padding: 10px;
            border-bottom: 1px solid #eee;
            text-align: right;
        }
        .item:last-child {
            border-bottom: none;
        }
        .total {
            font-size: 1.2em;
            font-weight: bold;
            color: #2c5530;
            text-align: center;
            padding: 15px;
            background: #e8f5e8;
            border-radius: 4px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 0.9em;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        .processing-notice {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            text-align: center;
            font-weight: bold;
        }
        p, div {
            text-align: right;
        }
        strong {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>طلب جديد #{{ $order->id }}</h1>
            <p>البركة للتمور ومنتجات النخيل</p>
        </div>

        <div class="processing-notice">
            <p>طلبك قيد المعالجة وسنتواصل معك قريباً.</p>
        </div>

        <div class="section">
            <h3>معلومات الطلب</h3>
            <p><strong>رقم الطلب:</strong> #{{ $order->id }}</p>
            <p><strong>تاريخ الطلب:</strong> {{ $order->created_at->format('Y-m-d H:i:s') }}</p>
            <p><strong>حالة الطلب:</strong>
                <span class="status-badge status-pending">{{ $orderStatus }}</span>
            </p>
        </div>

        <div class="section">
            <h3>بيانات العميل</h3>
            <p><strong>الاسم:</strong> {{ $order->customer_name }}</p>
            <p><strong>البريد الإلكتروني:</strong> {{ $order->customer_email }}</p>
            <p><strong>رقم الهاتف:</strong> {{ $order->customer_phone }}</p>
            <p><strong>عنوان التسليم:</strong> {{ $order->shipping_address }}</p>
        </div>

        <div class="section">
            <h3>تفاصيل المنتجات</h3>
            <div class="order-items">
                @foreach($order->items as $item)
                <div class="item">
                    <strong>{{ $item->product->name }}</strong><br>
                    <small>
                        الكمية: {{ $item->quantity }} |
                        السعر: {{ number_format($item->unit_price, 2) }} دينار |
                        المجموع: {{ number_format($item->quantity * $item->unit_price, 2) }} دينار
                        @if($item->is_wholesale)
                            <span style="color: #28a745;">(سعر الجملة)</span>
                        @endif
                    </small>
                </div>
                @endforeach
            </div>
        </div>

        <div class="total">
            المبلغ الإجمالي: {{ number_format($order->total_amount, 2) }} دينار ليبي
        </div>

        <div class="section">
            <h3>معلومات الدفع والتسليم</h3>
            <p><strong>طريقة الدفع:</strong> {{ $paymentMethod }}</p>
            <p><strong>نوع الطلب:</strong>
                {{ $order->is_wholesale ? 'طلب جملة' : 'طلب تجزئة' }}
            </p>
            @if($order->delivery_price > 0)
            <p><strong>رسوم التوصيل:</strong> {{ number_format($order->delivery_price, 2) }} دينار</p>
            @endif
        </div>

        @if($order->notes)
        <div class="section">
            <h3>ملاحظات العميل</h3>
            <p>{{ $order->notes }}</p>
        </div>
        @endif

        <div class="footer">
            <p>تم إنشاء هذا البريد الإلكتروني تلقائياً من نظام البركة للتمور</p>
            <p>&copy; {{ date('Y') }} البركة للتمور ومنتجات النخيل</p>
        </div>
    </div>
</body>
</html>
