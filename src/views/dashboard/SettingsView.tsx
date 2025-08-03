import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings as SettingsIcon,
  Save,
  Upload,
  Globe,
  Mail,
  Smartphone,
  MapPin,
  DollarSign,
  Shield,
  Bell,
  Palette,
  Database,
  Cloud,
  Key,
  User,
  Building
} from 'lucide-react';
import api from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface AppSettings {
  site_name: string;
  site_description: string;
  site_logo: string;
  site_favicon: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  currency: string;
  language: string;
  timezone: string;
  maintenance_mode: boolean;
  allow_registration: boolean;
  email_verification_required: boolean;
  notifications_enabled: boolean;
  backup_enabled: boolean;
  theme: string;
}

const SettingsView = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [activeTab, setActiveTab] = useState('general');
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<AppSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/api/settings');
      return response.data;
    },
  });

  const [formData, setFormData] = useState<Partial<AppSettings>>(settings || {});

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<AppSettings>) => {
      const response = await api.put('/api/settings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const tabs = [
    { id: 'general', name: t('dashboard.settings.general') || 'General', icon: SettingsIcon },
    { id: 'contact', name: t('dashboard.settings.contact') || 'Contact', icon: Mail },
    { id: 'localization', name: t('dashboard.settings.localization') || 'Localization', icon: Globe },
    { id: 'security', name: t('dashboard.settings.security') || 'Security', icon: Shield },
    { id: 'notifications', name: t('dashboard.settings.notifications') || 'Notifications', icon: Bell },
    { id: 'appearance', name: t('dashboard.settings.appearance') || 'Appearance', icon: Palette },
    { id: 'system', name: t('dashboard.settings.system') || 'System', icon: Database },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('dashboard.settings.title') || 'Settings'}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('dashboard.settings.subtitle') || 'Manage your application settings and preferences'}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {updateMutation.isPending ? t('common.saving') : t('common.save')}
        </button>
      </div>

      {/* Settings Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="bg-white rounded-lg shadow">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                {t('dashboard.settings.categories') || 'Categories'}
              </h3>
              <ul className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                          activeTab === tab.id
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                        {tab.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  {t('dashboard.settings.general') || 'General Settings'}
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('dashboard.settings.site_name') || 'Site Name'}
                      </label>
                      <input
                        type="text"
                        name="site_name"
                        value={formData.site_name || ''}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('dashboard.settings.currency') || 'Currency'}
                      </label>
                      <select
                        name="currency"
                        value={formData.currency || 'LYD'}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="LYD">Libyan Dinar (LYD)</option>
                        <option value="USD">US Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dashboard.settings.site_description') || 'Site Description'}
                    </label>
                    <textarea
                      name="site_description"
                      rows={3}
                      value={formData.site_description || ''}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('dashboard.settings.site_logo') || 'Site Logo'}
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          accept="image/*"
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('dashboard.settings.site_favicon') || 'Site Favicon'}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Settings */}
            {activeTab === 'contact' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  {t('dashboard.settings.contact') || 'Contact Information'}
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="h-4 w-4 inline mr-2" />
                        {t('dashboard.settings.contact_email') || 'Contact Email'}
                      </label>
                      <input
                        type="email"
                        name="contact_email"
                        value={formData.contact_email || ''}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Smartphone className="h-4 w-4 inline mr-2" />
                        {t('dashboard.settings.contact_phone') || 'Contact Phone'}
                      </label>
                      <input
                        type="tel"
                        name="contact_phone"
                        value={formData.contact_phone || ''}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-2" />
                      {t('dashboard.settings.contact_address') || 'Contact Address'}
                    </label>
                    <textarea
                      name="contact_address"
                      rows={3}
                      value={formData.contact_address || ''}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Localization Settings */}
            {activeTab === 'localization' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  {t('dashboard.settings.localization') || 'Localization Settings'}
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('dashboard.settings.language') || 'Default Language'}
                      </label>
                      <select
                        name="language"
                        value={formData.language || 'ar'}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('dashboard.settings.timezone') || 'Timezone'}
                      </label>
                      <select
                        name="timezone"
                        value={formData.timezone || 'Africa/Tripoli'}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="Africa/Tripoli">Africa/Tripoli</option>
                        <option value="UTC">UTC</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="America/New_York">America/New_York</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  {t('dashboard.settings.security') || 'Security Settings'}
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {t('dashboard.settings.allow_registration') || 'Allow User Registration'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {t('dashboard.settings.allow_registration_desc') || 'Allow new users to register accounts'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="allow_registration"
                        checked={formData.allow_registration || false}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {t('dashboard.settings.email_verification') || 'Email Verification Required'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {t('dashboard.settings.email_verification_desc') || 'Require email verification for new accounts'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="email_verification_required"
                        checked={formData.email_verification_required || false}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeTab === 'system' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  {t('dashboard.settings.system') || 'System Settings'}
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {t('dashboard.settings.maintenance_mode') || 'Maintenance Mode'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {t('dashboard.settings.maintenance_mode_desc') || 'Put the site in maintenance mode'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="maintenance_mode"
                        checked={formData.maintenance_mode || false}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {t('dashboard.settings.backup_enabled') || 'Automatic Backups'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {t('dashboard.settings.backup_enabled_desc') || 'Enable automatic database backups'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="backup_enabled"
                        checked={formData.backup_enabled || false}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
