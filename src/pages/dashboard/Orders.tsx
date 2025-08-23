import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Printer, Edit } from 'lucide-react';
import api from '@/lib/api';
import OrderForm from '@/components/dashboard/OrderForm';
import { Order, OrdersResponse, OrderItem } from '@/types/dashboard';
import { useLanguage } from '@/contexts/LanguageContext';

import { printOrderInvoiceSimple } from '@/lib/printUtils';

// Currency formatter for Libyan Dinar
const formatCurrency = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${numAmount.toFixed(2)} د.ل`;
};

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { t } = useLanguage();

  const handlePrintInvoice = (order: Order) => {
    printOrderInvoiceSimple(order);
  };

  const generateInvoiceHTML = (order: Order) => {
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

    const orderNumber = order.order_number || order.id;
    const paymentMethod = order.payment_method || 'غير محدد';

    return `
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
          .items-table tr:hover {
            background: #e0e7ff;
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
          .status-paid { background: #d1fae5; color: #065f46; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-failed { background: #fee2e2; color: #991b1b; }
          .status-completed { background: #d1fae5; color: #065f46; }
          .status-cancelled { background: #fee2e2; color: #991b1b; }
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
                  ${order.order_status === 'completed' ? 'مكتمل' :
                    order.order_status === 'pending' ? 'في الانتظار' :
                    order.order_status === 'processing' ? 'قيد المعالجة' :
                    order.order_status === 'cancelled' ? 'ملغي' : order.order_status}
                </span>
              </div>
              <div class="detail-item"><strong>طريقة الدفع:</strong> ${paymentMethod}</div>
              <div class="detail-item"><strong>حالة الدفع:</strong> 
                <span class="status-badge status-${order.payment_status}">
                  ${order.payment_status === 'paid' ? 'مدفوع' : 
                    order.payment_status === 'pending' ? 'في الانتظار' : 'مرفوض'}
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
  };

  const { data: orders, isLoading } = useQuery<OrdersResponse>({
    queryKey: ['orders', searchQuery, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);

      const response = await api.get(`/api/orders?${params.toString()}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">{t('dashboard.orders.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">{t('dashboard.orders.title')}</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full ps-10 pe-3 py-2.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              placeholder={t('dashboard.orders.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full ps-3 pe-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white transition-colors"
          >
            <option value="all">{t('dashboard.orders.all_statuses')}</option>
            <option value="pending">{t('dashboard.order_status.pending')}</option>
            <option value="processing">{t('dashboard.order_status.processing')}</option>
            <option value="completed">{t('dashboard.order_status.completed')}</option>
            <option value="cancelled">{t('dashboard.order_status.cancelled')}</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.orders.order_number')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.orders.customer_name')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.orders.date')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.orders.amount')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.orders.status')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.orders.payment_status')}
                </th>
                <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.orders.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders?.data?.length > 0 ? (
                orders.data.map((order: Order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.order_status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.order_status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {t(`dashboard.order_status.${order.order_status}`) || order.order_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.payment_status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.payment_status === 'paid' ? t('dashboard.orders.paid') :
                         order.payment_status === 'pending' ? t('dashboard.orders.unpaid') :
                         order.payment_status === 'failed' ? t('dashboard.orders.refunded') :
                         order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                      <div className="flex justify-end space-x-2 space-x-reverse">
                        <button
                          onClick={() => {
                            setEditingOrder(order);
                            setShowOrderForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors"
                          title="Edit order"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handlePrintInvoice(order)}
                          className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                          title={t('dashboard.orders.print')}
                        >
                          <Printer className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-gray-400 mb-2">📦</div>
                      <p>{t('dashboard.orders.no_orders')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && editingOrder && (
        <OrderForm
          order={editingOrder}
          onClose={() => {
            setShowOrderForm(false);
            setEditingOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default Orders;
