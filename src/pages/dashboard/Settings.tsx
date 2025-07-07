import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Setting {
  id: number;
  key: string;
  value: string;
  group: string;
  description: string;
}

const Settings = () => {
  const queryClient = useQueryClient();
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/settings`);
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      return response.json();
    },
  });

  const updateSetting = useMutation({
    mutationFn: async (setting: Setting) => {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/settings`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(setting),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update setting');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Setting updated successfully');
      setEditingSetting(null);
    },
    onError: (error) => {
      toast.error('Failed to update setting');
      console.error('Update error:', error);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>

      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {settings?.data?.map((setting: Setting) => (
          <div key={setting.id} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{setting.key}</h3>
                <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
              </div>
              <div className="flex items-center space-x-4">
                {editingSetting?.id === setting.id ? (
                  <>
                    <input
                      type="text"
                      value={editingSetting.value}
                      onChange={(e) =>
                        setEditingSetting({ ...editingSetting, value: e.target.value })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <button
                      onClick={() => updateSetting.mutate(editingSetting)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingSetting(null)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-500">{setting.value}</span>
                    <button
                      onClick={() => setEditingSetting(setting)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Edit
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