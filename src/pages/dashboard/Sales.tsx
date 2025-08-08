import { useState, useMemo, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { Download } from 'lucide-react';

interface CompletedOrderItem { id:number; quantity:number; unit_price:number; total_price:number; product?: { id:number; name:string }; }
interface CompletedOrder { id:number; total_amount:number; created_at:string; customer_name:string; items: CompletedOrderItem[]; /* no currency field */ }

const Sales = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [exporting, setExporting] = useState(false);
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCompleted = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('status', 'completed');
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);
      const res = await api.get(`/api/orders?${params.toString()}`);
      setOrders(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchCompleted();
  }, [fetchCompleted]);

  const totals = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    // Profit placeholder: need backend cost data per item; using 0 if not present
    const profit = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    return { totalSales, profit };
  }, [orders]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams();
      params.append('status', 'completed');
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);
      const response = await api.get(`/api/orders/export/csv?${params.toString()}`, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_${fromDate || 'all'}_${toDate || 'all'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert(t('common.error'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('dashboard.sales.title')}</h1>
          <p className="text-gray-600 mt-1">{t('dashboard.sales.subtitle')}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.sales.from')}</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.sales.to')}</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {exporting ? t('dashboard.sales.exporting') : t('dashboard.sales.export')}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.sales.completed_orders')}</h2>
          {loading ? (
            <p className="text-gray-500">{t('common.loading')}</p>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-500 text-sm font-medium">
                <div className="text-left">{t('dashboard.sales.order_id')}</div>
                <div className="text-left">{t('dashboard.sales.total_amount')}</div>
                <div className="text-left">{t('dashboard.sales.profit')}</div>
              </div>
              <div className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <div key={order.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3">
                    <div className="text-left text-gray-900">{order.id}</div>
                    <div className="text-left text-gray-900">
                      {new Intl.NumberFormat(language === 'ar' ? 'ar-LY' : 'en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }).format(order.total_amount)} د.ل
                    </div>
                    <div className="text-left text-gray-900">
                      {new Intl.NumberFormat(language === 'ar' ? 'ar-LY' : 'en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }).format(0)} د.ل {/* Placeholder for profit */}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-900 font-semibold">
                  <div className="text-left">{t('dashboard.sales.total')}</div>
                  <div className="text-left">
                    {new Intl.NumberFormat(language === 'ar' ? 'ar-LY' : 'en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }).format(totals.totalSales)} د.ل
                  </div>
                  <div className="text-left">
                    {new Intl.NumberFormat(language === 'ar' ? 'ar-LY' : 'en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }).format(totals.profit)} د.ل
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sales;
