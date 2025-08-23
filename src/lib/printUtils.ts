import { Order } from '@/types/dashboard';

export const printOrderInvoiceSimple = (order: Order) => {
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${numAmount.toFixed(2)} د.ل`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'pending': return 'في الانتظار';
      case 'processing': return 'قيد المعالجة';
      case 'cancelled': return 'ملغي';
      case 'paid': return 'مدفوع';
      case 'failed': return 'مرفوض';
      default: return status;
    }
  };

  const orderNumber = order.order_number || order.id;
  const paymentMethod = order.payment_method || 'غير محدد';

  const printContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاتورة رقم ${orderNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
          padding: 20px;
          direction: rtl;
        }
        .invoice {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border: 2px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .header p {
          font-size: 1.2em;
          opacity: 0.9;
        }
        .invoice-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          padding: 30px;
          background: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
        }
        .detail-section h3 {
          color: #4f46e5;
          margin-bottom: 15px;
          font-size: 1.3em;
          border-bottom: 2px solid #4f46e5;
          padding-bottom: 5px;
        }
        .detail-item {
          margin-bottom: 10px;
          font-size: 1.1em;
        }
        .detail-item strong {
          color: #374151;
          display: inline-block;
          width: 120px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .items-table th {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 15px;
          text-align: center;
          font-weight: bold;
          font-size: 1.1em;
        }
        .items-table td {
          padding: 15px;
          text-align: center;
          border-bottom: 1px solid #e2e8f0;
          font-size: 1.05em;
        }
        .items-table tr:nth-child(even) {
          background: #f8fafc;
        }
        .total-section {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          padding: 25px 30px;
          text-align: center;
        }
        .total-amount {
          font-size: 2.5em;
          font-weight: bold;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .footer {
          background: #374151;
          color: white;
          padding: 20px;
          text-align: center;
          font-size: 0.95em;
        }
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 0.9em;
        }
        .status-paid, .status-completed { background: #d1fae5; color: #065f46; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-failed, .status-cancelled { background: #fee2e2; color: #991b1b; }
        .status-processing { background: #dbeafe; color: #1e40af; }
        @media print {
          body { margin: 0; padding: 0; }
          .invoice { max-width: none; border: none; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <h1>بركة التمور</h1>
          <p>فاتورة رقم ${orderNumber}</p>
        </div>
        
        <div class="invoice-details">
          <div class="detail-section">
            <h3>معلومات الطلب</h3>
            <div class="detail-item"><strong>رقم الطلب:</strong> ${orderNumber}</div>
            <div class="detail-item"><strong>التاريخ:</strong> ${formatDate(order.created_at)}</div>
            <div class="detail-item"><strong>حالة الطلب:</strong> 
              <span class="status-badge status-${order.order_status}">
                ${getStatusText(order.order_status)}
              </span>
            </div>
            <div class="detail-item"><strong>طريقة الدفع:</strong> ${paymentMethod}</div>
            <div class="detail-item"><strong>حالة الدفع:</strong> 
              <span class="status-badge status-${order.payment_status}">
                ${getStatusText(order.payment_status)}
              </span>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>معلومات العميل</h3>
            <div class="detail-item"><strong>الاسم:</strong> ${order.customer_name}</div>
            <div class="detail-item"><strong>الهاتف:</strong> ${order.customer_phone}</div>
            <div class="detail-item"><strong>البريد:</strong> ${order.customer_email}</div>
            <div class="detail-item"><strong>العنوان:</strong> ${order.shipping_address}</div>
          </div>
        </div>
        
        <div style="padding: 0 30px;">
          ${order.items && order.items.length > 0 ? `
            <table class="items-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>النوع</th>
                  <th>المجموع</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.product?.name || 'منتج غير متوفر'}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.unit_price)}</td>
                    <td>${item.is_wholesale ? 'جملة' : 'قطعة'}</td>
                    <td>${formatCurrency(parseFloat(item.unit_price) * item.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `
            <div style="text-align: center; padding: 30px; color: #666;">
              <p>لا توجد عناصر للعرض</p>
            </div>
          `}
        </div>
        
        <div class="total-section">
          <div>المبلغ الإجمالي</div>
          <div class="total-amount">${formatCurrency(order.total_amount)}</div>
        </div>
        
        <div class="footer">
          <p>شكراً لتعاملكم معنا • بركة التمور</p>
          <p>للاستفسارات يرجى التواصل معنا</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  printWindow.document.write(printContent);
  printWindow.document.close();
  
  // Wait for images and styles to load, then print
  printWindow.addEventListener('load', () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  });
};
