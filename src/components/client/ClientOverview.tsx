import React from 'react';
import { LayoutDashboard, Calendar, FileText, CreditCard, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ClientOverview: React.FC = () => {
  // Mock data for charts
  const appointmentData = [
    { month: 'Jan', appointments: 2 },
    { month: 'Feb', appointments: 3 },
    { month: 'Mar', appointments: 1 },
    { month: 'Apr', appointments: 4 },
    { month: 'May', appointments: 2 },
    { month: 'Jun', appointments: 3 },
    { month: 'Jul', appointments: 5 },
  ];

  const documentStatusData = [
    { name: 'Completed', value: 8, color: '#10b981' },
    { name: 'Pending', value: 3, color: '#f59e0b' },
    { name: 'Missing', value: 1, color: '#ef4444' },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      title: 'General Consultation',
      doctor: 'Dr. Sarah Johnson',
      date: '2025-07-28',
      time: '10:00 AM',
      type: 'consultation',
      status: 'confirmed'
    },
    {
      id: 2,
      title: 'Follow-up Appointment',
      doctor: 'Dr. Emily Chen',
      date: '2025-08-02',
      time: '2:30 PM',
      type: 'follow-up',
      status: 'confirmed'
    },
    {
      id: 3,
      title: 'Annual Check-up',
      doctor: 'Dr. Michael Brown',
      date: '2025-08-15',
      time: '11:15 AM',
      type: 'checkup',
      status: 'pending'
    },
  ];

  const recentDocuments = [
    {
      id: 1,
      name: 'Medical Report - July 2025',
      type: 'medical-report',
      date: '2025-07-20',
      status: 'completed'
    },
    {
      id: 2,
      name: 'Lab Results',
      type: 'lab-results',
      date: '2025-07-18',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Insurance Claim Form',
      type: 'insurance',
      date: '2025-07-15',
      status: 'pending'
    },
  ];

  const StatCard: React.FC<{
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, subtitle, icon, color }) => (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 ${color} rounded-lg`}>
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'follow-up': return 'bg-green-100 text-green-800';
      case 'checkup': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'missing': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <LayoutDashboard className="w-6 h-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Welcome Message */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <h2 className="text-xl font-semibold mb-2">Welcome back!</h2>
        <p className="text-primary-100">
          Here's an overview of your healthcare activities and upcoming appointments.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Upcoming Appointments"
          value="3"
          subtitle="Next: Jul 28, 2025"
          icon={<Calendar className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Documents"
          value="12"
          subtitle="3 pending review"
          icon={<FileText className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Pending Claims"
          value="2"
          subtitle="$1,250 total"
          icon={<CreditCard className="w-6 h-6 text-white" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Health Score"
          value="85%"
          subtitle="↑ 5% from last month"
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Trends */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Appointment Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={appointmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="appointments" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Document Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Document Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={documentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {documentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {documentStatusData.map((item) => (
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
          </div>
        </div>
      </div>

      {/* Upcoming Appointments & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Upcoming Appointments</h3>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900">{appointment.title}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAppointmentTypeColor(appointment.type)}`}>
                      {appointment.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{appointment.doctor}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(appointment.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {appointment.time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {appointment.status === 'confirmed' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Documents</h3>
          <div className="space-y-4">
            {recentDocuments.map((document) => (
              <div key={document.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900">{document.name}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDocumentStatusColor(document.status)}`}>
                      {document.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FileText className="w-3 h-3" />
                    {new Date(document.date).toLocaleDateString()}
                  </div>
                </div>
                <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <Calendar className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Book Appointment</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <FileText className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Upload Document</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <CreditCard className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Submit Claim</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <AlertCircle className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Contact Support</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientOverview;
