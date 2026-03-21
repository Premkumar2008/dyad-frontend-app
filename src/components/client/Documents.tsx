import React, { useState } from 'react';
import { FileText, Search, Filter, Plus, Download, Eye, Upload, Calendar, FileCheck, AlertCircle } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'medical-report' | 'lab-result' | 'insurance' | 'prescription' | 'imaging' | 'other';
  category: string;
  uploadDate: string;
  size: string;
  status: 'completed' | 'pending' | 'processing' | 'rejected';
  doctor?: string;
  description?: string;
}

const Documents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  // Mock data
  const documents: Document[] = [
    {
      id: '1',
      name: 'Annual Physical Report 2025',
      type: 'medical-report',
      category: 'Medical Reports',
      uploadDate: '2025-07-20',
      size: '2.4 MB',
      status: 'completed',
      doctor: 'Dr. Sarah Johnson',
      description: 'Complete annual physical examination results'
    },
    {
      id: '2',
      name: 'Blood Test Results',
      type: 'lab-result',
      category: 'Lab Results',
      uploadDate: '2025-07-18',
      size: '1.2 MB',
      status: 'completed',
      doctor: 'Dr. Emily Chen',
      description: 'Complete blood count and metabolic panel'
    },
    {
      id: '3',
      name: 'Insurance Claim Form',
      type: 'insurance',
      category: 'Insurance',
      uploadDate: '2025-07-15',
      size: '856 KB',
      status: 'pending',
      description: 'Claim for recent consultation visit'
    },
    {
      id: '4',
      name: 'Chest X-Ray',
      type: 'imaging',
      category: 'Imaging',
      uploadDate: '2025-07-10',
      size: '4.8 MB',
      status: 'completed',
      doctor: 'Dr. Michael Brown',
      description: 'Chest radiograph - PA and lateral views'
    },
    {
      id: '5',
      name: 'Prescription - Antibiotics',
      type: 'prescription',
      category: 'Prescriptions',
      uploadDate: '2025-07-08',
      size: '245 KB',
      status: 'completed',
      doctor: 'Dr. Sarah Johnson',
      description: 'Amoxicillin 500mg - 7 day course'
    },
    {
      id: '6',
      name: 'ECG Report',
      type: 'medical-report',
      category: 'Medical Reports',
      uploadDate: '2025-07-05',
      size: '1.8 MB',
      status: 'processing',
      doctor: 'Dr. Emily Chen',
      description: 'Electrocardiogram results and interpretation'
    },
  ];

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (document.doctor && document.doctor.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || document.type === filterType;
    const matchesStatus = filterStatus === 'all' || document.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return parseFloat(b.size) - parseFloat(a.size);
      default:
        return 0;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-green-100 text-green-800', icon: FileCheck, label: 'Completed' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' };
      case 'processing':
        return { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'Processing' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: FileText, label: status };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical-report': return <FileText className="w-4 h-4" />;
      case 'lab-result': return <FileCheck className="w-4 h-4" />;
      case 'insurance': return <FileText className="w-4 h-4" />;
      case 'prescription': return <FileText className="w-4 h-4" />;
      case 'imaging': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'medical-report': return 'bg-blue-100 text-blue-800';
      case 'lab-result': return 'bg-green-100 text-green-800';
      case 'insurance': return 'bg-purple-100 text-purple-800';
      case 'prescription': return 'bg-orange-100 text-orange-800';
      case 'imaging': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSize = filteredDocuments.reduce((sum, doc) => {
    const size = parseFloat(doc.size);
    return sum + size;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{filteredDocuments.length}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-200" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Size</p>
              <p className="text-2xl font-bold text-gray-900">{totalSize.toFixed(1)} MB</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xs">MB</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredDocuments.filter(d => d.status === 'completed').length}
              </p>
            </div>
            <FileCheck className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredDocuments.filter(d => d.status === 'pending').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-200" />
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
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field min-w-[150px]"
          >
            <option value="all">All Types</option>
            <option value="medical-report">Medical Reports</option>
            <option value="lab-result">Lab Results</option>
            <option value="insurance">Insurance</option>
            <option value="prescription">Prescriptions</option>
            <option value="imaging">Imaging</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field min-w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field min-w-[120px]"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => {
          const statusBadge = getStatusBadge(document.status);
          const StatusIcon = statusBadge.icon;
          
          return (
            <div key={document.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    {getTypeIcon(document.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {document.name}
                    </h3>
                    <p className="text-xs text-gray-500">{document.category}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusBadge.label}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {document.doctor && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-medium">Doctor:</span>
                    <span>{document.doctor}</span>
                  </div>
                )}
                {document.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {document.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(document.uploadDate).toLocaleDateString()}
                  </div>
                  <span>{document.size}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Eye className="w-3 h-3" />
                  View
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No documents found matching your criteria.</p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredDocuments.length} of {documents.length} documents
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

export default Documents;
