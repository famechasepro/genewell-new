import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  TrendingUp,
  DollarSign,
  Mail,
  LogOut,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

interface DashboardStats {
  totalUsers: number;
  totalQuizzes: number;
  totalPurchases: number;
  completedPurchases: number;
  totalRevenue: number;
  emailStats: Record<string, number>;
}

interface RecentPurchase {
  id: number;
  user_id: number;
  total_price: number;
  payment_status: string;
  created_at: string;
  email: string;
  name: string;
}

interface AdminUser {
  id: number;
  email: string;
  name: string;
  age?: number;
  gender?: string;
  phone?: string;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(!!adminToken);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'purchases'>('overview');
  const [tempToken, setTempToken] = useState('');

  const handleLogin = async () => {
    if (!tempToken) {
      setError('Please enter an admin token');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'X-Admin-Token': tempToken,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid admin token');
      }

      localStorage.setItem('adminToken', tempToken);
      setAdminToken(tempToken);
      setIsAuthenticated(true);
      setError('');
      setTempToken('');
      loadDashboard(tempToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboard = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'X-Admin-Token': token,
        },
      });

      if (!response.ok) throw new Error('Failed to load dashboard');

      const data = await response.json();
      setStats(data.statistics);
      setRecentPurchases(data.recentPurchases);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'X-Admin-Token': adminToken,
        },
      });

      if (!response.ok) throw new Error('Failed to load users');

      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken('');
    setIsAuthenticated(false);
    setStats(null);
    setUsers([]);
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/admin/export/users-csv', {
        headers: {
          'X-Admin-Token': adminToken,
        },
      });

      if (!response.ok) throw new Error('Failed to export data');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users-export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  useEffect(() => {
    if (isAuthenticated && adminToken) {
      loadDashboard(adminToken);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>Enter your admin token to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Token</label>
              <Input
                type="password"
                placeholder="Enter admin token"
                value={tempToken}
                onChange={(e) => setTempToken(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleLogin();
                }}
              />
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoading || !tempToken}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Login'
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              Contact your administrator for the admin token.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-900">Admin Dashboard</h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          <Button
            onClick={() => {
              setActiveTab('overview');
              if (stats) loadDashboard(adminToken);
            }}
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            className={activeTab === 'overview' ? 'bg-blue-600' : ''}
          >
            Overview
          </Button>
          <Button
            onClick={() => {
              setActiveTab('users');
              if (activeTab === 'users') loadUsers();
            }}
            variant={activeTab === 'users' ? 'default' : 'outline'}
            className={activeTab === 'users' ? 'bg-blue-600' : ''}
          >
            <Users className="mr-2 h-4 w-4" />
            Users
          </Button>
          <Button
            onClick={() => setActiveTab('purchases')}
            variant={activeTab === 'purchases' ? 'default' : 'outline'}
            className={activeTab === 'purchases' ? 'bg-blue-600' : ''}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Purchases
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <Loader className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
            <p className="text-slate-600 mt-4">Loading data...</p>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && !isLoading && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Users</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
                    </div>
                    <Users className="h-12 w-12 text-blue-100 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Quizzes</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.totalQuizzes}</p>
                    </div>
                    <TrendingUp className="h-12 w-12 text-green-100 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Purchases</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.totalPurchases}</p>
                    </div>
                    <DollarSign className="h-12 w-12 text-purple-100 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-slate-900">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                    </div>
                    <TrendingUp className="h-12 w-12 text-orange-100 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Purchases */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-semibold">User</th>
                        <th className="text-left py-2 font-semibold">Email</th>
                        <th className="text-left py-2 font-semibold">Amount</th>
                        <th className="text-left py-2 font-semibold">Status</th>
                        <th className="text-left py-2 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPurchases.map((purchase) => (
                        <tr key={purchase.id} className="border-b hover:bg-slate-50">
                          <td className="py-3">{purchase.name || 'Unknown'}</td>
                          <td className="py-3 text-slate-600">{purchase.email}</td>
                          <td className="py-3 font-semibold">₹{purchase.total_price.toLocaleString('en-IN')}</td>
                          <td className="py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              purchase.payment_status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {purchase.payment_status}
                            </span>
                          </td>
                          <td className="py-3 text-slate-600">{new Date(purchase.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && !isLoading && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all users</CardDescription>
              </div>
              <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-slate-600 text-center py-8">No users found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-semibold">Name</th>
                        <th className="text-left py-2 font-semibold">Email</th>
                        <th className="text-left py-2 font-semibold">Age</th>
                        <th className="text-left py-2 font-semibold">Gender</th>
                        <th className="text-left py-2 font-semibold">Phone</th>
                        <th className="text-left py-2 font-semibold">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-slate-50">
                          <td className="py-3">{user.name || '-'}</td>
                          <td className="py-3 text-slate-600">{user.email}</td>
                          <td className="py-3">{user.age || '-'}</td>
                          <td className="py-3">{user.gender || '-'}</td>
                          <td className="py-3">{user.phone || '-'}</td>
                          <td className="py-3 text-slate-600">{new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Purchases Tab */}
        {activeTab === 'purchases' && !isLoading && (
          <Card>
            <CardHeader>
              <CardTitle>Purchase Management</CardTitle>
              <CardDescription>View all user purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-semibold">User</th>
                      <th className="text-left py-2 font-semibold">Amount</th>
                      <th className="text-left py-2 font-semibold">Status</th>
                      <th className="text-left py-2 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPurchases.map((purchase) => (
                      <tr key={purchase.id} className="border-b hover:bg-slate-50">
                        <td className="py-3">{purchase.name || purchase.email}</td>
                        <td className="py-3 font-semibold">₹{purchase.total_price.toLocaleString('en-IN')}</td>
                        <td className="py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            purchase.payment_status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {purchase.payment_status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600">{new Date(purchase.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
