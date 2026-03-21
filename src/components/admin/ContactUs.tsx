import React, { useState } from 'react';
import { Phone, Search, Filter, Mail, MessageSquare, Check, X, Clock } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'responded' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedDate: string;
  lastUpdated: string;
  category: 'general' | 'technical' | 'billing' | 'support';
}

const ContactUs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Mock data
  const messages: ContactMessage[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      subject: 'Issue with claim submission',
      message: 'I am having trouble submitting my medical claim through the portal. The system keeps showing an error message when I try to upload the required documents.',
      status: 'new',
      priority: 'high',
      submittedDate: '2025-07-25',
      lastUpdated: '2025-07-25',
      category: 'technical'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@hospital.com',
      subject: 'Billing inquiry',
      message: 'I have a question about the billing statement I received for last month. There seems to be a discrepancy in the amount charged.',
      status: 'read',
      priority: 'medium',
      submittedDate: '2025-07-24',
      lastUpdated: '2025-07-24',
      category: 'billing'
    },
    {
      id: '3',
      name: 'Dr. Michael Chen',
      email: 'mchen@clinic.com',
      phone: '+1 (555) 987-6543',
      subject: 'Account access problem',
      message: 'I am unable to access my account. I tried resetting my password but I am not receiving the reset email.',
      status: 'responded',
      priority: 'urgent',
      submittedDate: '2025-07-23',
      lastUpdated: '2025-07-24',
      category: 'support'
    },
    {
      id: '4',
      name: 'Mary Wilson',
      email: 'mary.w@example.com',
      subject: 'General information request',
      message: 'I would like to know more about the services offered and the process for becoming a provider.',
      status: 'closed',
      priority: 'low',
      submittedDate: '2025-07-22',
      lastUpdated: '2025-07-23',
      category: 'general'
    },
    {
      id: '5',
      name: 'Robert Taylor',
      email: 'robert.t@medicalgroup.com',
      subject: 'System performance issue',
      message: 'The dashboard has been loading very slowly for the past two days. This is affecting our workflow significantly.',
      status: 'new',
      priority: 'high',
      submittedDate: '2025-07-25',
      lastUpdated: '2025-07-25',
      category: 'technical'
    },
  ];

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || message.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || message.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return { color: 'bg-blue-100 text-blue-800', icon: Mail, label: 'New' };
      case 'read':
        return { color: 'bg-yellow-100 text-yellow-800', icon: MessageSquare, label: 'Read' };
      case 'responded':
        return { color: 'bg-green-100 text-green-800', icon: Check, label: 'Responded' };
      case 'closed':
        return { color: 'bg-gray-100 text-gray-800', icon: X, label: 'Closed' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: MessageSquare, label: status };
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-purple-100 text-purple-800';
      case 'billing': return 'bg-blue-100 text-blue-800';
      case 'support': return 'bg-green-100 text-green-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Phone className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Contact Us Messages</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New Messages</p>
              <p className="text-2xl font-bold text-blue-600">
                {filteredMessages.filter(m => m.status === 'new').length}
              </p>
            </div>
            <Mail className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-red-600">
                {filteredMessages.filter(m => m.priority === 'urgent').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">!</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Response</p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredMessages.filter(m => m.status === 'new' || m.status === 'read').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{filteredMessages.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-gray-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field min-w-[120px]"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="responded">Responded</option>
            <option value="closed">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input-field min-w-[120px]"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field min-w-[120px]"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="technical">Technical</option>
            <option value="billing">Billing</option>
            <option value="support">Support</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Subject</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Priority</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMessages.map((message) => {
                const statusBadge = getStatusBadge(message.status);
                const StatusIcon = statusBadge.icon;
                
                return (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{message.name}</div>
                        <div className="text-sm text-gray-500">{message.email}</div>
                        {message.phone && (
                          <div className="text-xs text-gray-400">{message.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900 truncate">{message.subject}</p>
                        <p className="text-xs text-gray-500 truncate">{message.message}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadgeColor(message.category)}`}>
                        {message.category.charAt(0).toUpperCase() + message.category.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(message.priority)}`}>
                        {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600">
                        <div>{new Date(message.submittedDate).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {message.lastUpdated !== message.submittedDate && 
                            `Updated ${new Date(message.lastUpdated).toLocaleDateString()}`
                          }
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-primary-600 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No messages found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredMessages.length} of {messages.length} messages
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
