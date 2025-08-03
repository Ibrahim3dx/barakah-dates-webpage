import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/api';

interface Setting {
  id: number;
  key: string;
  value: string;
  group: string;
  description: string;
}

const Settings = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const queryClient = useQueryClient();
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/api/settings');
      return response.data;
    },
  });

  const updateSetting = useMutation({
    mutationFn: async (setting: Setting) => {
      const response = await api.put('/api/settings', setting);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success(t('settings.updateSuccess') || 'Setting updated successfully');
      setEditingSetting(null);
    },
    onError: (error) => {
      toast.error(t('settings.updateError') || 'Failed to update setting');
      console.error('Update error:', error);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        <p className={`ml-4 text-gray-600 ${isRTL ? 'mr-4 ml-0' : ''}`}>
          {t('settings.loading') || 'Loading settings...'}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('settings.title') || 'Settings'}
        </h1>
      </div>

      {/* Account Settings Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className={`text-lg font-medium text-gray-900 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('settings.accountSettings') || 'Account Settings'}
        </h2>
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h3 className="text-sm font-medium text-gray-900">
              {t('settings.password') || 'Password'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('settings.passwordDescription') || 'Change your account password'}
            </p>
          </div>
          <Link
            to="/change-password"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('settings.changePassword') || 'Change Password'}
          </Link>
        </div>
      </div>

      {/* Application Settings */}
      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        <div className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h2 className="text-lg font-medium text-gray-900">
            {t('settings.applicationSettings') || 'Application Settings'}
          </h2>
        </div>
        {settings?.data?.map((setting: Setting) => (
          <div key={setting.id} className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h3 className="text-lg font-medium text-gray-900">{setting.key}</h3>
                <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
              </div>
              <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
                {editingSetting?.id === setting.id ? (
                  <>
                    <input
                      type="text"
                      value={editingSetting.value}
                      onChange={(e) =>
                        setEditingSetting({ ...editingSetting, value: e.target.value })
                      }
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                    <button
                      onClick={() => updateSetting.mutate(editingSetting)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {t('settings.save') || 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingSetting(null)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {t('settings.cancel') || 'Cancel'}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-500">{setting.value}</span>
                    <button
                      onClick={() => setEditingSetting(setting)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {t('settings.edit') || 'Edit'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
