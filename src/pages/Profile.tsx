import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Activity } from 'lucide-react';

export default function Profile() {
  const { profile, user } = useAuth();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
        <p className="mt-1 text-sm text-gray-600">View your account information</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-16 mb-6">
            <div className="h-32 w-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
              <User className="h-16 w-16 text-blue-600" />
            </div>
            <div className="ml-6 mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{profile?.username}</h3>
              <p className="text-sm text-gray-600 capitalize">{profile?.role} Account</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Address
                </label>
                <p className="text-gray-900">{user?.email}</p>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 mr-2" />
                  Username
                </label>
                <p className="text-gray-900">{profile?.username}</p>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Activity className="h-4 w-4 mr-2" />
                  Account Status
                </label>
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
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  Member Since
                </label>
                <p className="text-gray-900">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>

              {profile?.expiration_date && (
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    Account Expiration
                  </label>
                  <p className="text-gray-900">
                    {new Date(profile.expiration_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Traffic Usage
                </label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Used</span>
                    <span className="font-medium text-gray-900">
                      {formatBytes(profile?.traffic_used || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          profile?.traffic_limit
                            ? Math.min(
                                ((profile?.traffic_used || 0) / profile.traffic_limit) * 100,
                                100
                              )
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Limit</span>
                    <span className="font-medium text-gray-900">
                      {profile?.traffic_limit
                        ? formatBytes(profile.traffic_limit)
                        : 'Unlimited'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
