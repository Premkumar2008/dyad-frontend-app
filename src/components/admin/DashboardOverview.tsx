import React from 'react';
import { LayoutDashboard, TrendingUp, Users, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts';

const DashboardOverview: React.FC = () => {
  // Mock data for charts
  const userDistributionData = [
    { name: 'Physician', value: 10, color: '#fbbf24' },
    { name: 'Group', value: 3, color: '#1e40af' },
    { name: 'Admin', value: 2, color: '#dc2626' },
  ];

  const userIntakeData = [
    { name: 'In Progress', value: 10, color: '#fbbf24' },
    { name: 'Completed', value: 4, color: '#10b981' },
  ];

  const monthlyDistributionData = [
    { month: 'Jan', physician: 2, group: 0, admin: 0 },
    { month: 'Feb', physician: 3, group: 1, admin: 0 },
    { month: 'Mar', physician: 4, group: 1, admin: 1 },
    { month: 'Apr', physician: 5, group: 1, admin: 1 },
    { month: 'May', physician: 7, group: 2, admin: 1 },
    { month: 'Jun', physician: 8, group: 2, admin: 1 },
    { month: 'Jul', physician: 10, group: 3, admin: 2 },
  ];

  const recentUsers = [
    {
      id: 1,
      name: 'SA Shannon Aardema',
      email: 'shaurya.gupta@synlabs.io',
      date: '25 Jul 2025 | 9:30 AM',
      avatar: 'SA'
    },
    {
      id: 2,
      name: 'Dr. John Smith',
      email: 'john.smith@example.com',
      date: '24 Jul 2025 | 2:15 PM',
      avatar: 'JS'
    },
    {
      id: 3,
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      date: '23 Jul 2025 | 11:45 AM',
      avatar: 'SJ'
    },
  ];

  const StatCard: React.FC<{
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down';
  }> = ({ title, value, subtitle, icon, trend }) => (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-primary-50 rounded-lg">
          {icon}
        </div>
        {trend && (
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <LayoutDashboard className="w-6 h-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value="15"
          subtitle="↑ 13% from last year"
          icon={<Users className="w-6 h-6 text-primary-600" />}
          trend="up"
        />
        <StatCard
          title="Active Users"
          value="2"
          subtitle="↑ 13% of total users"
          icon={<Activity className="w-6 h-6 text-primary-600" />}
          trend="up"
        />
        <StatCard
          title="Total Intake"
          value="14"
          subtitle="Intake completed 7% this year"
          icon={<TrendingUp className="w-6 h-6 text-primary-600" />}
          trend="up"
        />
        <StatCard
          title="Completion Rate"
          value="28%"
          subtitle="↑ 5% from last month"
          icon={<Activity className="w-6 h-6 text-primary-600" />}
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Overview */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">User Distribution Overview</h3>
          <p className="text-sm text-gray-600 mb-6">Trending up by 13% this year</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {userDistributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Total</span>
                <span className="text-sm font-bold text-gray-900">15 users</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Intake Summary */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">User Intake Summary</h3>
          <p className="text-sm text-gray-600 mb-6">Intake completed 7% this year</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userIntakeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userIntakeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {userIntakeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Total</span>
                <span className="text-sm font-bold text-gray-900">14</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Distribution Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">User Type Monthly Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="physician" stackId="1" stroke="#fbbf24" fill="#fbbf24" />
              <Area type="monotone" dataKey="group" stackId="1" stroke="#1e40af" fill="#1e40af" />
              <Area type="monotone" dataKey="admin" stackId="1" stroke="#dc2626" fill="#dc2626" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recently Onboarded Users */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recently Onboarded Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-600">{user.avatar}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{user.date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
