<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>طلب جديد - New Order #{{ $order->id }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
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
            border-left: 4px solid #2c5530;
            background: #f9f9f9;
        }
        .section h3 {
            margin: 0 0 10px 0;
            color: #2c5530;
        }
        .order-items {
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .item {
            padding: 10px;
            border-bottom: 1px solid #eee;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>طلب جديد - New Order #{{ $order->id }}</h1>
            <p>البركة للتمور ومنتجات النخيل - Al Baraka Dates</p>
        </div>

        <div class="processing-notice">
            <p>طلبك قيد المعالجة وسنتواصل معك قريباً.</p>
            <p>Your order is being processed and we will contact you soon.</p>
        </div>

        <div class="section">
            <h3>معلومات الطلب - Order Information</h3>
            <p><strong>رقم الطلب / Order Number:</strong> #{{ $order->id }}</p>
            <p><strong>تاريخ الطلب / Order Date:</strong> {{ $order->created_at->format('Y-m-d H:i:s') }}</p>
            <p><strong>حالة الطلب / Order Status:</strong>
                <span class="status-badge status-pending">{{ $orderStatus }}</span>
            </p>
        </div>

        <div class="section">
            <h3>بيانات العميل - Customer Information</h3>
            <p><strong>الاسم / Name:</strong> {{ $order->customer_name }}</p>
            <p><strong>البريد الإلكتروني / Email:</strong> {{ $order->customer_email }}</p>
            <p><strong>رقم الهاتف / Phone:</strong> {{ $order->customer_phone }}</p>
            <p><strong>عنوان التسليم / Delivery Address:</strong> {{ $order->shipping_address }}</p>
        </div>

        <div class="section">
            <h3>تفاصيل المنتجات - Product Details</h3>
            <div class="order-items">
                @foreach($order->items as $item)
                <div class="item">
                    <strong>{{ $item->product->name }}</strong><br>
                    <small>
                        الكمية / Quantity: {{ $item->quantity }} |
                        السعر / Price: {{ number_format($item->unit_price, 2) }} ريال |
                        المجموع / Total: {{ number_format($item->quantity * $item->unit_price, 2) }} ريال
                        @if($item->is_wholesale)
                            <span style="color: #28a745;">(سعر الجملة - Wholesale Price)</span>
                        @endif
                    </small>
                </div>
                @endforeach
            </div>
        </div>

        <div class="total">
            المبلغ الإجمالي / Total Amount: {{ number_format($order->total_amount, 2) }} ريال سعودي
        </div>

        <div class="section">
            <h3>معلومات الدفع والتسليم - Payment & Delivery Information</h3>
            <p><strong>طريقة الدفع / Payment Method:</strong> {{ $paymentMethod }}</p>
            <p><strong>نوع الطلب / Order Type:</strong>
                {{ $order->is_wholesale ? 'طلب جملة - Wholesale Order' : 'طلب تجزئة - Retail Order' }}
            </p>
            @if($order->delivery_price > 0)
            <p><strong>رسوم التوصيل / Delivery Fee:</strong> {{ number_format($order->delivery_price, 2) }} ريال</p>
            @endif
        </div>

        @if($order->notes)
        <div class="section">
            <h3>ملاحظات العميل - Customer Notes</h3>
            <p>{{ $order->notes }}</p>
        </div>
        @endif

        <div class="footer">
            <p>تم إنشاء هذا البريد الإلكتروني تلقائياً من نظام البركة للتمور</p>
            <p>This email was automatically generated from Al Baraka Dates system</p>
            <p>&copy; {{ date('Y') }} البركة للتمور ومنتجات النخيل - Al Baraka Dates</p>
        </div>
    </div>
</body>
</html>
