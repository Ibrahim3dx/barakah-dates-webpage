/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', searchQuery, roleFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (roleFilter && roleFilter !== 'all') params.append('role', roleFilter);

        const response = await api.get(`/api/users?${params.toString()}`);
        return response.data;
      } catch (error) {
        throw new Error('Failed to fetch users');
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">{t('dashboard.users.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t('dashboard.users.title')}</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="max-w-lg w-full">
          <div className="relative">
            <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className={`block w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              placeholder={t('dashboard.users.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={`block w-full sm:w-48 ${isRTL ? 'pr-3 pl-10' : 'pl-3 pr-10'} py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md`}
        >
          <option value="all">{t('dashboard.users.all_roles')}</option>
          <option value="admin">{t('dashboard.users.admin')}</option>
          <option value="user">{t('dashboard.users.user')}</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dashboard.users.name')}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dashboard.users.email')}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dashboard.users.role')}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dashboard.users.created_at')}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dashboard.users.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.data?.length > 0 ? (
                users.data.map((user: any) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.roles?.[0]?.name === 'admin' ? t('dashboard.users.admin') :
                         user.roles?.[0]?.name === 'user' ? t('dashboard.users.user') :
                         user.roles?.[0]?.name || t('dashboard.users.user')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-left' : 'text-right'} text-sm font-medium`}>
                      <div className={`flex ${isRTL ? 'justify-start space-x-reverse' : 'justify-end'} space-x-2`}>
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="text-yellow-600 hover:text-yellow-900">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    {t('dashboard.users.no_users')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
