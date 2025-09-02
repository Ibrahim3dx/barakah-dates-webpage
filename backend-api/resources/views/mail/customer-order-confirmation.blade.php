<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تأكيد الطلب #{{ $order->id }}</title>
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
        .thank-you {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 20px;
            border-radius: 4px;
            text-align: center;
            margin: 20px 0;
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
        .contact-info {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            text-align: right;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 0.9em;
        }
        .processing-notice {
            background: #cce5ff;
            border: 1px solid #99ccff;
            color: #004080;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .processing-notice h3 {
            margin: 0 0 10px 0;
            color: #004080;
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
            <h1>شكراً لطلبك!</h1>
            <p>البركة للتمور ومنتجات النخيل</p>
        </div>

        <div class="thank-you">
            <h2>تم استلام طلبك بنجاح</h2>
            <p>رقم طلبك: <strong>#{{ $order->id }}</strong></p>
        </div>

        <div class="processing-notice">
            <h3>🔄 طلبك قيد المعالجة</h3>
            <p><strong>سنتواصل معك قريباً مع تفاصيل التسليم وموعد الوصول المتوقع.</strong></p>
        </div>

        <div class="section">
            <h3>تفاصيل الطلب</h3>
            <p><strong>تاريخ الطلب:</strong> {{ $order->created_at->format('Y-m-d H:i:s') }}</p>
            <p><strong>طريقة الدفع:</strong> {{ $paymentMethod }}</p>
            <p><strong>عنوان التسليم:</strong> {{ $order->shipping_address }}</p>
        </div>

        <div class="section">
            <h3>المنتجات المطلوبة</h3>
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

        @if($order->notes)
        <div class="section">
            <h3>ملاحظاتك</h3>
            <p>{{ $order->notes }}</p>
        </div>
        @endif

        <div class="contact-info">
            <h3>📞 معلومات الاتصال</h3>
            <p><strong>هاتف:</strong> +218 910911909</p>
            <p><strong>البريد الإلكتروني:</strong> orders@albarakadates.com</p>
            <p>لأي استفسارات حول طلبك، يرجى الاتصال بنا مع ذكر رقم الطلب.</p>
        </div>

        <div class="footer">
            <p>شكراً لاختياركم البركة للتمور ومنتجات النخيل</p>
            <p>&copy; {{ date('Y') }} البركة للتمور ومنتجات النخيل</p>
        </div>
    </div>
</body>
</html>
