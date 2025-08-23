import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, CheckSquare, Square, MoreVertical } from 'lucide-react';
// Add icons for import/export
import { Upload, Download } from 'lucide-react';
import ProductForm from '@/components/dashboard/ProductForm';
import api from '@/lib/api';
import { Product, ProductsResponse } from '@/types/dashboard';
import { useLanguage } from '@/contexts/LanguageContext';

// Interface for import error response
interface ImportError {
  response?: {
    data?: {
      missing_columns?: string[];
      found_columns?: string[];
      required_columns?: string[];
      help?: string;
      message?: string;
      summary?: {
        errors: Array<{ error: string }>;
      };
    };
  };
}

// Currency formatter for Libyan Dinar
const formatCurrency = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${numAmount.toFixed(2)} د.ل`;
};

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: products, isLoading } = useQuery<ProductsResponse>({
    queryKey: ['products', searchQuery, currentPage, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', currentPage.toString());
      params.append('per_page', pageSize.toString());

      const response = await api.get(`/api/products?${params.toString()}`);
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/api/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setProductToDelete(null);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const response = await api.patch(`/api/products/${id}/status`, { is_active });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleEdit = async (product: Product) => {
    // Fetch full product data to ensure we have all fields including buying prices
    try {
      const response = await api.get(`/api/products/${product.id}`);
      setSelectedProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      // Fallback to using the product from the list
      setSelectedProduct(product);
    }
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (product: Product) => {
    toggleStatusMutation.mutate({
      id: product.id,
      is_active: !product.is_active,
    });
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
  };

  const handleCancelDelete = () => {
    setProductToDelete(null);
  };

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && products?.data) {
      setSelectedProducts(products.data.map(product => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const batchActivateMutation = useMutation({
    mutationFn: async (is_active: boolean) => {
      await Promise.all(
        selectedProducts.map(id =>
          api.patch(`/api/products/${id}/status`, { is_active })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSelectedProducts([]);
    },
  });

  const batchStockMutation = useMutation({
    mutationFn: async (stock: number) => {
      await Promise.all(
        selectedProducts.map(id =>
          api.patch(`/api/products/${id}/stock`, { stock })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSelectedProducts([]);
    },
  });

  const batchDeleteMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        selectedProducts.map(id =>
          api.delete(`/api/products/${id}`)
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSelectedProducts([]);
      setShowBatchActions(false);
    },
  });

  const handleBatchAction = (action: string) => {
    switch (action) {
      case 'activate':
        batchActivateMutation.mutate(true);
        break;
      case 'deactivate':
        batchActivateMutation.mutate(false);
        break;
      case 'instock':
        batchStockMutation.mutate(1);
        break;
      case 'outofstock':
        batchStockMutation.mutate(0);
        break;
      case 'delete':
        setShowBatchActions(true);
        break;
    }
  };

  const handleConfirmBatchDelete = () => {
    batchDeleteMutation.mutate();
  };

  const handleDownloadSample = async() => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/import/sample`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download sample');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sample_products.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download sample file');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/api/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      queryClient.invalidateQueries({ queryKey: ['products'] });

      // Show success message with summary
      if (response.data?.summary) {
        const { created = 0, updated = 0 } = response.data.summary;
        const message = `${t('dashboard.products.import_success') || 'Import completed'}: ${created} created, ${updated} updated`;
        alert(message);
      } else {
        alert(t('dashboard.products.import_success') || 'Import completed successfully');
      }
    } catch (error: unknown) {
      console.error('Import failed', error);
      const errorData = (error as ImportError)?.response?.data;

      if (errorData?.missing_columns) {
        // Handle missing columns error with detailed message
        const missingCols = errorData.missing_columns.join(', ');
        const foundCols = errorData.found_columns?.join(', ') || 'none';
        const requiredCols = errorData.required_columns?.join(', ') || 'unknown';

        const detailedMessage = `${t('dashboard.products.import_missing_columns') || 'Missing required columns in CSV file'}\n\n` +
          `${t('dashboard.products.import_missing') || 'Missing columns'}: ${missingCols}\n` +
          `${t('dashboard.products.import_found') || 'Found columns'}: ${foundCols}\n` +
          `${t('dashboard.products.import_required') || 'Required columns'}: ${requiredCols}\n\n` +
          `${errorData.help || t('dashboard.products.import_help') || 'Please download the sample CSV file to see the correct format'}`;

        alert(detailedMessage);
      } else if (errorData?.summary?.errors) {
        // Handle import errors with summary
        const errorCount = errorData.summary.errors.length;
        const firstError = errorData.summary.errors[0]?.error || 'Unknown error';
        alert(`Import completed with ${errorCount} errors.\nFirst error: ${firstError}\n\nCheck console for full details.`);
      } else {
        // Generic error handling
        alert(`${t('dashboard.products.import_error') || 'Import failed'}: ${errorData?.message || (error as Error)?.message || 'Unknown error'}`);
      }
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-semibold text-gray-900">{t('dashboard.products.title')}</h1>
          {/* Import / Sample buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSample}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium bg-white text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-1" /> {t('dashboard.products.download_sample') || 'Sample CSV'}
            </button>
            <button
              type="button"
              onClick={handleImportClick}
              disabled={isImporting}
              className="inline-flex items-center px-3 py-1.5 border border-indigo-300 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
            >
              <Upload className="h-4 w-4 mr-1" /> {isImporting ? (t('dashboard.products.importing') || 'Importing...') : (t('dashboard.products.import_csv') || 'Import CSV')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleImportChange}
            />
          </div>
          {selectedProducts.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedProducts.length} {t('dashboard.products.selected')}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBatchAction('activate')}
                  disabled={batchActivateMutation.isPending}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50"
                >
                  {t('dashboard.products.batch_activate')}
                </button>
                <button
                  onClick={() => handleBatchAction('deactivate')}
                  disabled={batchActivateMutation.isPending}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  {t('dashboard.products.batch_deactivate')}
                </button>
                <button
                  onClick={() => handleBatchAction('instock')}
                  disabled={batchStockMutation.isPending}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50"
                >
                  {t('dashboard.products.batch_instock')}
                </button>
                <button
                  onClick={() => handleBatchAction('outofstock')}
                  disabled={batchStockMutation.isPending}
                  className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 disabled:opacity-50"
                >
                  {t('dashboard.products.batch_outofstock')}
                </button>
                <button
                  onClick={() => handleBatchAction('delete')}
                  disabled={batchDeleteMutation.isPending}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('dashboard.products.add_product')}
        </button>
      </div>

      {/* Search Bar and Page Size Selector */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="max-w-lg w-full">
          <div className="relative">
            <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className={`block w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              placeholder={t('dashboard.products.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">
            {t('common.items_per_page') || 'Items per page:'}
          </label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing page size
            }}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={(e) => handleSelectAll((e.target as HTMLInputElement).checked)}
                    className="flex items-center"
                  >
                    {selectedProducts.length === products?.data?.length && products?.data?.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-indigo-600" />
                    ) : selectedProducts.length > 0 ? (
                      <div className="h-4 w-4 bg-indigo-600 rounded-sm flex items-center justify-center">
                        <div className="h-2 w-2 bg-white rounded-sm"></div>
                      </div>
                    ) : (
                      <Square className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dashboard.products.name')}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dashboard.products.category')}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dashboard.products.price')}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dashboard.products.stock')}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dashboard.products.status')}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dashboard.products.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products?.data?.map((product: Product) => (
                <tr key={product.id} className={selectedProducts.includes(product.id) ? 'bg-indigo-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleSelectProduct(product.id)}
                      className="flex items-center"
                    >
                      {selectedProducts.includes(product.id) ? (
                        <CheckSquare className="h-4 w-4 text-indigo-600" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={product.image_url}
                          alt={product.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/fallback-product-image.png';
                          }}
                        />
                      </div>
                      <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category ? product.category.name : t('dashboard.products.no_category')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stock > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.stock > 0 ? t('dashboard.products.in_stock') || 'In Stock' : t('dashboard.products.out_of_stock') || 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(product)}
                      disabled={toggleStatusMutation.isPending}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors hover:opacity-80 disabled:opacity-50 ${
                        product.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {product.is_active ? t('dashboard.products.active') : t('dashboard.products.inactive')}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteClick(product)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {products && products.last_page > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.previous') || 'Previous'}
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(products.last_page, currentPage + 1))}
                disabled={currentPage >= products.last_page}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.next') || 'Next'}
              </button>
            </div>

            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  {t('common.showing') || 'Showing'}{' '}
                  <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span>
                  {' '}{t('common.to') || 'to'}{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, products.total)}
                  </span>
                  {' '}{t('common.of') || 'of'}{' '}
                  <span className="font-medium">{products.total}</span>
                  {' '}{t('common.results') || 'results'}
                </p>
              </div>

              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.previous') || 'Previous'}
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, products.last_page) }, (_, i) => {
                    const startPage = Math.max(1, Math.min(products.last_page - 4, currentPage - 2));
                    const pageNumber = startPage + i;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(Math.min(products.last_page, currentPage + 1))}
                    disabled={currentPage >= products.last_page}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.next') || 'Next'}
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {isFormOpen && (
        <ProductForm
          product={selectedProduct}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                {t('dashboard.products.delete_confirmation') || 'Delete Product'}
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  {t('dashboard.products.delete_confirmation_message') || 'Are you sure you want to delete'} <strong>"{productToDelete.name}"</strong>? {t('dashboard.products.delete_warning') || 'This action cannot be undone.'}
                </p>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={handleCancelDelete}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? (t('common.deleting') || 'Deleting...') : (t('common.delete') || 'Delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Delete Confirmation Modal */}
      {showBatchActions && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                {t('dashboard.products.batch_delete_confirmation') || 'Delete Products'}
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  {t('dashboard.products.batch_delete_message') || 'Are you sure you want to delete'} <strong>{selectedProducts.length}</strong> {t('dashboard.products.batch_delete_products') || 'products'}? {t('dashboard.products.delete_warning') || 'This action cannot be undone.'}
                </p>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => setShowBatchActions(false)}
                  disabled={batchDeleteMutation.isPending}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  onClick={handleConfirmBatchDelete}
                  disabled={batchDeleteMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {batchDeleteMutation.isPending ? (t('common.deleting') || 'Deleting...') : (t('common.delete') || 'Delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
