import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Route, Node } from '../lib/supabase';
import { Route as RouteIcon, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function Routes() {
  const { profile, isAdmin } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoute, setNewRoute] = useState({ node_id: '', route: '' });

  useEffect(() => {
    fetchData();
  }, [profile, isAdmin]);

  const fetchData = async () => {
    try {
      const [routesRes, nodesRes] = await Promise.all([
        supabase.from('routes').select('*').order('created_at', { ascending: false }),
        supabase.from('nodes').select('*'),
      ]);

      if (routesRes.error) throw routesRes.error;
      if (nodesRes.error) throw nodesRes.error;

      setRoutes(routesRes.data || []);
      setNodes(nodesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    try {
      const { error } = await supabase.from('routes').insert({
        user_id: profile.id,
        node_id: parseInt(newRoute.node_id),
        route: newRoute.route,
        enabled: false,
      });

      if (error) throw error;

      await fetchData();
      setShowAddModal(false);
      setNewRoute({ node_id: '', route: '' });
    } catch (error) {
      console.error('Error adding route:', error);
      alert('Failed to add route');
    }
  };

  const handleToggleRoute = async (id: number, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('routes')
        .update({ enabled: !enabled })
        .eq('id', id);

      if (error) throw error;

      setRoutes(routes.map((r) => (r.id === id ? { ...r, enabled: !enabled } : r)));
    } catch (error) {
      console.error('Error toggling route:', error);
      alert('Failed to update route');
    }
  };

  const handleDeleteRoute = async (id: number) => {
    if (!confirm('Are you sure you want to delete this route?')) return;

    try {
      const { error } = await supabase.from('routes').delete().eq('id', id);

      if (error) throw error;

      setRoutes(routes.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Error deleting route:', error);
      alert('Failed to delete route');
    }
  };

  const getNodeName = (nodeId: number) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node?.node_name || 'Unknown Node';
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
          <h2 className="text-2xl font-bold text-gray-900">Routes</h2>
          <p className="mt-1 text-sm text-gray-600">Manage network routes for your nodes</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-smooth"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Route
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Node
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {routes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <RouteIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">No routes found</p>
                  </td>
                </tr>
              ) : (
                routes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50 transition-smooth">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getNodeName(route.node_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <code className="bg-gray-100 px-2 py-1 rounded">{route.route}</code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          route.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {route.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(route.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleToggleRoute(route.id, route.enabled)}
                        className="text-blue-600 hover:text-blue-900 mr-3 transition-smooth"
                      >
                        {route.enabled ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteRoute(route.id)}
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

      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Route</h3>
              <form onSubmit={handleAddRoute} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Node
                  </label>
                  <select
                    required
                    value={newRoute.node_id}
                    onChange={(e) => setNewRoute({ ...newRoute, node_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a node</option>
                    {nodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.node_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Route (CIDR)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 10.0.0.0/24"
                    value={newRoute.route}
                    onChange={(e) => setNewRoute({ ...newRoute, route: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-smooth"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-smooth"
                  >
                    Add Route
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
