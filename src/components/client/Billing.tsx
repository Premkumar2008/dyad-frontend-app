import React, { useState } from 'react';
import { CreditCard, Search, Filter, Plus, Download, Eye, DollarSign, TrendingUp, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Bill {
  id: string;
  billNumber: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  type: 'consultation' | 'procedure' | 'lab' | 'medication' | 'other';
  provider: string;
  serviceDate: string;
  insuranceCoverage?: number;
}

const Billing: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  // Mock data
  const bills: Bill[] = [
    {
      id: '1',
      billNumber: 'BILL-2025-001',
      description: 'General Consultation - Dr. Sarah Johnson',
      amount: 250.00,
      dueDate: '2025-08-15',
      status: 'pending',
      type: 'consultation',
      provider: 'Dr. Sarah Johnson',
      serviceDate: '2025-07-20',
      insuranceCoverage: 80
    },
    {
      id: '2',
      billNumber: 'BILL-2025-002',
      description: 'Blood Test Panel',
      amount: 180.00,
      dueDate: '2025-08-10',
      status: 'pending',
      type: 'lab',
      provider: 'Medical Laboratory',
      serviceDate: '2025-07-18',
      insuranceCoverage: 70
    },
    {
      id: '3',
      billNumber: 'BILL-2025-003',
      description: 'Cardiac Stress Test',
      amount: 850.00,
      dueDate: '2025-07-30',
      status: 'overdue',
      type: 'procedure',
      provider: 'Dr. Emily Chen',
      serviceDate: '2025-07-10',
      insuranceCoverage: 60
    },
    {
      id: '4',
      billNumber: 'BILL-2025-004',
      description: 'Prescription Medication',
      amount: 45.00,
      dueDate: '2025-07-25',
      status: 'paid',
      type: 'medication',
      provider: 'Pharmacy',
      serviceDate: '2025-07-08',
      insuranceCoverage: 50
    },
    {
      id: '5',
      billNumber: 'BILL-2025-005',
      description: 'Annual Physical Exam',
      amount: 320.00,
      dueDate: '2025-07-20',
      status: 'paid',
      type: 'consultation',
      provider: 'Dr. Sarah Johnson',
      serviceDate: '2025-06-20',
      insuranceCoverage: 90
    },
    {
      id: '6',
      billNumber: 'BILL-2025-006',
      description: 'Chest X-Ray',
      amount: 220.00,
      dueDate: '2025-08-05',
      status: 'pending',
      type: 'procedure',
      provider: 'Radiology Department',
      serviceDate: '2025-07-15',
      insuranceCoverage: 75
    },
  ];

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;
    const matchesType = filterType === 'all' || bill.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime();
      case 'dueDate':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'amount':
        return b.amount - a.amount;
      default:
        return 0;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Paid' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' };
      case 'overdue':
        return { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Overdue' };
      case 'cancelled':
        return { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelled' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: status };
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'procedure': return 'bg-purple-100 text-purple-800';
      case 'lab': return 'bg-green-100 text-green-800';
      case 'medication': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = filteredBills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + bill.amount, 0);
  const pendingAmount = filteredBills.filter(b => b.status === 'pending' || b.status === 'overdue').reduce((sum, bill) => sum + bill.amount, 0);
  const overdueAmount = filteredBills.filter(b => b.status === 'overdue').reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Make Payment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Billed</p>
              <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-gray-200" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-green-600">${paidAmount.toFixed(2)}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">${overdueAmount.toFixed(2)}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-200" />
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
                placeholder="Search bills..."
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
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field min-w-[120px]"
          >
            <option value="all">All Types</option>
            <option value="consultation">Consultation</option>
            <option value="procedure">Procedure</option>
            <option value="lab">Lab</option>
            <option value="medication">Medication</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field min-w-[120px]"
          >
            <option value="date">Service Date</option>
            <option value="dueDate">Due Date</option>
            <option value="amount">Amount</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Bill #</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Provider</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Service Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Due Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBills.map((bill) => {
                const statusBadge = getStatusBadge(bill.status);
                const StatusIcon = statusBadge.icon;
                const patientResponsibility = bill.insuranceCoverage 
                  ? bill.amount * (1 - bill.insuranceCoverage / 100)
                  : bill.amount;
                
                return (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-gray-900">{bill.billNumber}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-sm text-gray-900 max-w-xs truncate">{bill.description}</div>
                        {bill.insuranceCoverage && (
                          <div className="text-xs text-gray-500">
                            Insurance: {bill.insuranceCoverage}% | You pay: ${patientResponsibility.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{bill.provider}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(bill.type)}`}>
                        {bill.type.charAt(0).toUpperCase() + bill.type.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">
                        {new Date(bill.serviceDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-sm ${
                        bill.status === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-600'
                      }`}>
                        {new Date(bill.dueDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">${bill.amount.toFixed(2)}</div>
                        {bill.insuranceCoverage && (
                          <div className="text-xs text-gray-500">${patientResponsibility.toFixed(2)}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-primary-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-primary-600 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        {(bill.status === 'pending' || bill.status === 'overdue') && (
                          <button className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors">
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredBills.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No bills found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Billed</span>
              <span className="text-sm font-medium text-gray-900">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Insurance Coverage</span>
              <span className="text-sm font-medium text-green-600">
                -${(totalAmount - paidAmount - pendingAmount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Paid</span>
              <span className="text-sm font-medium text-green-600">-${paidAmount.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Outstanding Balance</span>
                <span className="text-lg font-bold text-gray-900">${pendingAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <CreditCard className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Pay Bills</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <Download className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Download Statement</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <TrendingUp className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Payment History</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <Calendar className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Schedule Payment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredBills.length} of {bills.length} bills
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

export default Billing;
