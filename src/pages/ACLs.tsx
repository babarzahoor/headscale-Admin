import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, ACL } from '../lib/supabase';
import { Shield, Plus, Trash2, Edit2 } from 'lucide-react';

export default function ACLs() {
  const { profile } = useAuth();
  const [acls, setAcls] = useState<ACL[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAcl, setEditingAcl] = useState<ACL | null>(null);
  const [formData, setFormData] = useState({ name: '', rules: '' });

  useEffect(() => {
    fetchAcls();
  }, [profile]);

  const fetchAcls = async () => {
    try {
      const { data, error } = await supabase
        .from('acls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAcls(data || []);
    } catch (error) {
      console.error('Error fetching ACLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    try {
      let rules;
      try {
        rules = JSON.parse(formData.rules);
      } catch {
        alert('Invalid JSON format for rules');
        return;
      }

      if (editingAcl) {
        const { error } = await supabase
          .from('acls')
          .update({ name: formData.name, rules })
          .eq('id', editingAcl.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('acls').insert({
          user_id: profile.id,
          name: formData.name,
          rules,
        });

        if (error) throw error;
      }

      await fetchAcls();
      setShowModal(false);
      setEditingAcl(null);
      setFormData({ name: '', rules: '' });
    } catch (error) {
      console.error('Error saving ACL:', error);
      alert('Failed to save ACL');
    }
  };

  const handleEdit = (acl: ACL) => {
    setEditingAcl(acl);
    setFormData({
      name: acl.name,
      rules: JSON.stringify(acl.rules, null, 2),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ACL?')) return;

    try {
      const { error } = await supabase.from('acls').delete().eq('id', id);

      if (error) throw error;

      setAcls(acls.filter((acl) => acl.id !== id));
    } catch (error) {
      console.error('Error deleting ACL:', error);
      alert('Failed to delete ACL');
    }
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
          <h2 className="text-2xl font-bold text-gray-900">Access Control Lists</h2>
          <p className="mt-1 text-sm text-gray-600">
            Define access rules for your network
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAcl(null);
            setFormData({ name: '', rules: '[]' });
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-smooth"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add ACL
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {acls.length === 0 ? (
          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Shield className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-500">No ACLs found</p>
          </div>
        ) : (
          acls.map((acl) => (
            <div
              key={acl.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-smooth"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">{acl.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(acl)}
                    className="text-blue-600 hover:text-blue-900 transition-smooth"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(acl.id)}
                    className="text-red-600 hover:text-red-900 transition-smooth"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <pre className="text-xs text-gray-700 overflow-x-auto">
                  {JSON.stringify(acl.rules, null, 2)}
                </pre>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Created: {new Date(acl.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowModal(false)}
            ></div>
            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingAcl ? 'Edit ACL' : 'Add New ACL'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="My ACL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rules (JSON)
                  </label>
                  <textarea
                    required
                    rows={12}
                    value={formData.rules}
                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder='[{"action": "accept", "src": ["*"], "dst": ["*:*"]}]'
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-smooth"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-smooth"
                  >
                    {editingAcl ? 'Update' : 'Create'} ACL
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
