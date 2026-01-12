import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, PreauthKey } from '../lib/supabase';
import { Key, Plus, Trash2, Copy, CheckCircle } from 'lucide-react';

export default function PreauthKeys() {
  const { profile, isAdmin } = useAuth();
  const [keys, setKeys] = useState<PreauthKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expirationType, setExpirationType] = useState<'1h' | '24h' | '7d' | 'custom'>('24h');
  const [customExpiration, setCustomExpiration] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, [profile, isAdmin]);

  const fetchKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('preauth_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKeys(data || []);
    } catch (error) {
      console.error('Error fetching keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'hskey-';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const getExpirationDate = () => {
    const now = new Date();
    switch (expirationType) {
      case '1h':
        return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      case '24h':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'custom':
        return customExpiration ? new Date(customExpiration).toISOString() : null;
      default:
        return null;
    }
  };

  const handleCreateKey = async () => {
    if (!profile?.id) return;

    const expiration = getExpirationDate();
    if (expirationType === 'custom' && !expiration) {
      alert('Please select a custom expiration date');
      return;
    }

    try {
      const { error } = await supabase.from('preauth_keys').insert({
        user_id: profile.id,
        key: generateKey(),
        expiration,
        used: false,
      });

      if (error) throw error;

      await fetchKeys();
      setShowModal(false);
    } catch (error) {
      console.error('Error creating key:', error);
      alert('Failed to create key');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this key?')) return;

    try {
      const { error } = await supabase.from('preauth_keys').delete().eq('id', id);

      if (error) throw error;

      setKeys(keys.filter((key) => key.id !== id));
    } catch (error) {
      console.error('Error deleting key:', error);
      alert('Failed to delete key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isExpired = (expiration?: string) => {
    if (!expiration) return false;
    return new Date(expiration) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pre-authentication Keys</h2>
          <p className="mt-1 text-sm text-gray-600">
            Generate keys to register new devices
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-smooth"
        >
          <Plus className="h-4 w-4 mr-2" />
          Generate Key
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Key className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">No pre-authentication keys found</p>
                  </td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50 transition-smooth">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <code className="text-sm font-mono text-gray-900 mr-2">
                          {key.key.substring(0, 20)}...
                        </code>
                        <button
                          onClick={() => copyToClipboard(key.key)}
                          className="text-gray-400 hover:text-gray-600 transition-smooth"
                        >
                          {copiedKey === key.key ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          key.used
                            ? 'bg-gray-100 text-gray-800'
                            : isExpired(key.expiration)
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {key.used ? 'Used' : isExpired(key.expiration) ? 'Expired' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {key.expiration
                        ? new Date(key.expiration).toLocaleString()
                        : 'No expiration'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(key.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(key.id)}
                        className="text-red-600 hover:text-red-900 transition-smooth"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowModal(false)}
            ></div>
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Generate Pre-authentication Key
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: '1h', label: '1 Hour' },
                      { value: '24h', label: '24 Hours' },
                      { value: '7d', label: '7 Days' },
                      { value: 'custom', label: 'Custom' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="expiration"
                          value={option.value}
                          checked={expirationType === option.value}
                          onChange={(e) =>
                            setExpirationType(e.target.value as typeof expirationType)
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {expirationType === 'custom' && (
                    <input
                      type="datetime-local"
                      value={customExpiration}
                      onChange={(e) => setCustomExpiration(e.target.value)}
                      className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-smooth"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateKey}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-smooth"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
