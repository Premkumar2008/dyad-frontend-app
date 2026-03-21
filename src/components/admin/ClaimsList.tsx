import React, { useState } from 'react';
import { FileText, Search, Filter, Plus, Eye, Download, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Claim {
  id: string;
  claimNumber: string;
  patientName: string;
  providerName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  submittedDate: string;
  lastUpdated: string;
  type: 'medical' | 'surgical' | 'consultation';
}

const ClaimsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Mock data
  const claims: Claim[] = [
    {
      id: '1',
      claimNumber: 'CLM-2025-001',
      patientName: 'John Doe',
      providerName: 'Dr. Sarah Johnson',
      amount: 2500.00,
      status: 'approved',
      submittedDate: '2025-07-20',
      lastUpdated: '2025-07-24',
      type: 'surgical'
    },
    {
      id: '2',
      claimNumber: 'CLM-2025-002',
      patientName: 'Jane Smith',
      providerName: 'Dr. Emily Chen',
      amount: 850.00,
      status: 'pending',
      submittedDate: '2025-07-22',
      lastUpdated: '2025-07-22',
      type: 'consultation'
    },
    {
      id: '3',
      claimNumber: 'CLM-2025-003',
      patientName: 'Robert Johnson',
      providerName: 'Dr. Michael Brown',
      amount: 3200.00,
      status: 'processing',
      submittedDate: '2025-07-21',
      lastUpdated: '2025-07-23',
      type: 'medical'
    },
    {
      id: '4',
      claimNumber: 'CLM-2025-004',
      patientName: 'Mary Wilson',
      providerName: 'Dr. Sarah Johnson',
      amount: 1500.00,
      status: 'rejected',
      submittedDate: '2025-07-19',
      lastUpdated: '2025-07-25',
      type: 'surgical'
    },
    {
      id: '5',
      claimNumber: 'CLM-2025-005',
      patientName: 'James Taylor',
      providerName: 'Dr. Emily Chen',
      amount: 600.00,
      status: 'approved',
      submittedDate: '2025-07-18',
      lastUpdated: '2025-07-20',
      type: 'consultation'
    },
  ];

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.providerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
    const matchesType = filterType === 'all' || claim.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' };
      case 'processing':
        return { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Processing' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: status };
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'surgical': return 'bg-purple-100 text-purple-800';
      case 'medical': return 'bg-blue-100 text-blue-800';
      case 'consultation': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = filteredClaims.reduce((sum, claim) => sum + claim.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Claims List</h1>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Claim
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Claims</p>
              <p className="text-2xl font-bold text-gray-900">{filteredClaims.length}</p>
            </div>
            <FileText className="w-8 h-8 text-primary-200" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">$</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredClaims.filter(c => c.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredClaims.filter(c => c.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
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
                placeholder="Search claims..."
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
            className="input-field min-w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field min-w-[150px]"
          >
            <option value="all">All Types</option>
            <option value="medical">Medical</option>
            <option value="surgical">Surgical</option>
            <option value="consultation">Consultation</option>
          </select>
        </div>
      </div>

      {/* Claims Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Claim #</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Patient</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Provider</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Submitted</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClaims.map((claim) => {
                const statusBadge = getStatusBadge(claim.status);
                const StatusIcon = statusBadge.icon;
                
                return (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-gray-900">{claim.claimNumber}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">{claim.patientName}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{claim.providerName}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(claim.type)}`}>
                        {claim.type.charAt(0).toUpperCase() + claim.type.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-gray-900">${claim.amount.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600">
                        <div>{new Date(claim.submittedDate).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          Updated {new Date(claim.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-primary-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-primary-600 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredClaims.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No claims found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredClaims.length} of {claims.length} claims
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

export default ClaimsList;
