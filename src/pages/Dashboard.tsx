import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Server, Route, Shield, Activity, TrendingUp, Users as UsersIcon } from 'lucide-react';

interface Stats {
  nodes: number;
  routes: number;
  acls: number;
  users: number;
  trafficUsed: number;
  trafficLimit: number;
}

export default function Dashboard() {
  const { profile, isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats>({
    nodes: 0,
    routes: 0,
    acls: 0,
    users: 0,
    trafficUsed: 0,
    trafficLimit: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [profile, isAdmin]);

  const fetchStats = async () => {
    try {
      const userId = profile?.id;
      if (!userId) return;

      const [nodesRes, routesRes, aclsRes, usersRes] = await Promise.all([
        supabase.from('nodes').select('id', { count: 'exact', head: true }),
        supabase.from('routes').select('id', { count: 'exact', head: true }),
        supabase.from('acls').select('id', { count: 'exact', head: true }),
        isAdmin
          ? supabase.from('user_profiles').select('id', { count: 'exact', head: true })
          : Promise.resolve({ count: 1 }),
      ]);

      setStats({
        nodes: nodesRes.count || 0,
        routes: routesRes.count || 0,
        acls: aclsRes.count || 0,
        users: usersRes.count || 0,
        trafficUsed: profile?.traffic_used || 0,
        trafficLimit: profile?.traffic_limit || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const trafficPercentage =
    stats.trafficLimit > 0 ? (stats.trafficUsed / stats.trafficLimit) * 100 : 0;

  const statCards = [
    {
      name: 'Nodes',
      value: stats.nodes,
      icon: Server,
      color: 'bg-blue-500',
      show: true,
    },
    {
      name: 'Routes',
      value: stats.routes,
      icon: Route,
      color: 'bg-green-500',
      show: true,
    },
    {
      name: 'ACLs',
      value: stats.acls,
      icon: Shield,
      color: 'bg-yellow-500',
      show: true,
    },
    {
      name: 'Users',
      value: stats.users,
      icon: UsersIcon,
      color: 'bg-purple-500',
      show: isAdmin,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.username}!
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your Headscale network
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards
          .filter((card) => card.show)
          .map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.name}
                className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition-smooth"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 ${card.color} rounded-lg p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {card.name}
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900">
                          {card.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Activity className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Traffic Usage</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Used</span>
              <span className="font-medium text-gray-900">
                {formatBytes(stats.trafficUsed)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  trafficPercentage > 80
                    ? 'bg-red-500'
                    : trafficPercentage > 50
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(trafficPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Limit</span>
              <span className="font-medium text-gray-900">
                {stats.trafficLimit > 0 ? formatBytes(stats.trafficLimit) : 'Unlimited'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  profile?.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {profile?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Role</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {profile?.role}
              </span>
            </div>
            {profile?.expiration_date && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Expires</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(profile.expiration_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h3>
        <p className="text-sm text-blue-800 mb-4">
          To connect your devices to Headscale, you'll need to generate a pre-authentication key
          and configure your Tailscale client.
        </p>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>1.</strong> Go to Pre-auth Keys page to generate a new key
          </p>
          <p>
            <strong>2.</strong> Install Tailscale client on your device
          </p>
          <p>
            <strong>3.</strong> Use the key to connect: <code className="bg-blue-100 px-2 py-1 rounded">tailscale up --login-server=YOUR_SERVER --authkey=YOUR_KEY</code>
          </p>
        </div>
      </div>
    </div>
  );
}
