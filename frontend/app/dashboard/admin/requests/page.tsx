'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/dashboard/DataTable';
import { getAllRequests, formatDate, deleteRequest } from '@/lib/api/requests.api';
import { Request } from '@/types/request.types';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Clock, XCircle, ClipboardList, Filter, Trash2, X, Search, RefreshCw } from 'lucide-react';
import DeleteRequestModal from '@/components/dashboard/DeleteRequestModal';

const columns = [
  { header: "Title", accessor: "title" },
  { header: "Status", accessor: "status" },
  { header: "Created By", accessor: "createdBy" },
  { header: "Created", accessor: "createdAt" },
  { header: "Actions", accessor: "actions" }
];

export default function AllRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [requestToDelete, setRequestToDelete] = useState<{id: string, title: string} | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(true);

  const fetchRequests = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setIsRefreshing(true);
      
      const response = await getAllRequests();
      
      let requestData: Request[] = [];
      if (response && response.success && response.data?.data && Array.isArray(response.data.data)) {
        requestData = response.data.data;
      } else if (response && response.data && Array.isArray(response.data)) {
        requestData = response.data;
      } else if (Array.isArray(response)) {
        requestData = response as unknown as Request[];
      }

      setRequests(requestData || []);
    } catch (error) {
      if (!isRefresh) {
        toast.error(error instanceof Error ? error.message : 'Error loading requests');
      }
      setRequests([]); 
    } finally {
      if (!isRefresh) setLoading(false);
      else setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    
    const interval = setInterval(() => {
      fetchRequests(true);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const handleDeleteClick = (requestId: string, title: string) => {
    setRequestToDelete({ id: requestId, title });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!requestToDelete) return;

    try {
      await deleteRequest(requestToDelete.id);
      toast.success('Request deleted successfully');
      setRequests(prev => prev.filter(req => req.id !== requestToDelete.id));
    } catch (error) {
      toast.error('Failed to delete request');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter ? req.status === statusFilter : true;
    const matchesSearch = 
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.createdBy?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#4338CA]" />
          <span className="text-gray-600">Loading requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0d1c2e]">All Requests</h1>
        <p className="text-gray-500">Managing all system requests. You can approve, reject, or review requests from here.</p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, description, or employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2a14b4]/20 focus:border-[#2a14b4] transition-all"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2a14b4]/20 focus:border-[#2a14b4] transition-all appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">
            Showing <span className="text-[#2a14b4]">{filteredRequests.length}</span> of <span className="text-gray-900">{requests.length}</span> requests
          </p>
          <button
            onClick={() => fetchRequests(true)}
            disabled={isRefreshing}
            className="text-sm font-bold text-[#2a14b4] hover:text-[#1e0e8a] flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh List
          </button>
        </div>
      </div>

      {requests.length === 0 && !loading && showWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 relative">
          <button 
            onClick={() => setShowWarning(false)}
            className="absolute top-4 right-4 p-1 hover:bg-amber-100 rounded-full text-amber-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-4">
            <ClipboardList className="w-5 h-5 text-amber-600 mt-1" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">No requests loaded</h4>
              <p className="text-sm text-amber-800">
                The requests list is currently empty. If you expect data here, please check your permissions or contact an administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {filteredRequests.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredRequests}
          renderCell={(col, row) => {
            if (col.accessor === "status") {
              return (
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  row.status === 'approved' ? 'bg-green-100 text-green-700' : 
                  row.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                  row.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {row.status.toUpperCase()}
                </span>
              );
            }

            if (col.accessor === "createdBy") {
              return row.createdBy?.name || row.createdById || 'Unknown User';
            }

            if (col.accessor === "createdAt") {
              return formatDate(row.createdAt);
            }

            if (col.accessor === "actions") {
              return (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => router.push(`/dashboard/admin/requests/${row.id}`)}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors font-medium"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(row.id, row.title)}
                    className="p-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            }

            return row[col.accessor];
          }}
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter ? 'Try adjusting your search or filters.' : 'No requests are currently in the system.'}
          </p>
        </div>
      )}

      {requestToDelete && (
        <DeleteRequestModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setRequestToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          requestTitle={requestToDelete.title}
        />
      )}
    </div>
  );
}
