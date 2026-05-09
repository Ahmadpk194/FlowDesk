"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/dashboard/DataTable';
import { Filter, Search, Loader2, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { getMyRequests, cancelRequest, deleteRequest, updateRequest } from '@/lib/api/requests.api';
import { Request, RequestStatus, UpdateRequestDto } from '@/types/request.types';
import { formatDate, getStatusColorClass, canCancelRequest, canEditRequest } from '@/lib/api/requests.api';
import { toast } from 'sonner';
import DeleteRequestModal from '@/components/dashboard/DeleteRequestModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import EditRequestModal from '@/components/dashboard/EditRequestModal';

const columns = [
  { header: "Title", accessor: "title" },
  { header: "Status", accessor: "status" },
  { header: "Submitted", accessor: "createdAt" },
  { header: "Updated", accessor: "updatedAt" },
  { header: "Actions", accessor: "actions" },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function MyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0,
  });
  
  const [request, setRequest] = useState<Request | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const fetchRequests = async (page = 1, isSilent = false) => {
    try {
      if (isSilent) setRefreshing(true);
      else if (page === 1 && requests.length === 0) setLoading(true);
      else setRefreshing(true);

      const query: any = { page, limit: pagination.limit };
      if (statusFilter) query.status = statusFilter;

      const response = await getMyRequests(query);

      let requestData: Request[] = [];
      let pageNum = page;
      let limitNum = pagination.limit;
      let totalCount = 0;
      let totalPagesCount = 0;

      if (response.success && response.data) {
        const payload = response.data;
        if (Array.isArray(payload)) {
          requestData = payload;
          totalCount = payload.length;
        } else if (payload.data && Array.isArray(payload.data)) {
          requestData = payload.data;
          pageNum = payload.page ?? page;
          limitNum = payload.limit ?? pagination.limit;
          totalCount = payload.total ?? payload.data.length;
          totalPagesCount = payload.totalPages ?? 1;
        }
      } else if (Array.isArray(response)) {
        requestData = response;
        totalCount = response.length;
      }

      setRequests(requestData);
      setPagination({
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: totalPagesCount,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load requests');
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests(pagination.page);

    // Set up polling interval
    const interval = setInterval(() => {
      fetchRequests(pagination.page, true);
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [statusFilter, pagination.page]);

  const handleRefresh = () => {
    fetchRequests(pagination.page, true);
  };

  const handleViewRequest = (requestId: string) => {
    router.push(`/dashboard/employee/requests/${requestId}`);
  };

  const handleSaveEdit = async (data: UpdateRequestDto) => {
    if (!request) return;
    try {
      setUpdating(true);
      const response = await updateRequest(request.id, data);
      setRequest(response.data);
      setIsEditModalOpen(false);
      toast.success('Request updated successfully');
      fetchRequests(pagination.page);
    } catch (error) {
      console.error('Failed to update request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update request');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!request) return;
    try {
      setUpdating(true);
      const response = await cancelRequest(request.id);
      setRequest(response.data);
      toast.success('Request cancelled successfully');
      fetchRequests(pagination.page);
    } catch (error) {
      console.error('Failed to cancel request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel request');
    } finally {
      setUpdating(false);
      setIsCancelModalOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!request) return;
    try {
      setUpdating(true);
      await deleteRequest(request.id);
      toast.success('Request deleted successfully');
      setIsDeleteModalOpen(false);
      fetchRequests(pagination.page);
    } catch (error) {
      console.error('Failed to delete request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete request');
    } finally {
      setUpdating(false);
    }
  };

  const filteredRequests = (requests || []).filter(req => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) {
      return !statusFilter || req.status === statusFilter;
    }
    
    const titleMatch = (req.title || '').toLowerCase().includes(searchLower);
    const descMatch = (req.description || '').toLowerCase().includes(searchLower);
    const statusMatch = (req.status || '').toLowerCase().includes(searchLower);
    const matchesDropdownStatus = !statusFilter || req.status === statusFilter;
    
    return (titleMatch || descMatch || statusMatch) && matchesDropdownStatus;
  });

  const renderActions = (req: Request) => {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleViewRequest(req.id)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          View
        </button>
        {canEditRequest(req) && (
          <button
            onClick={() => { setRequest(req); setIsEditModalOpen(true); }}
            className="px-3 py-1.5 border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg text-sm transition-colors"
          >
            Edit
          </button>
        )}
        {canCancelRequest(req) && (
          <button
            onClick={() => { setRequest(req); setIsCancelModalOpen(true); }}
            className="px-3 py-1.5 border border-orange-300 text-orange-600 hover:bg-orange-50 rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={() => { setRequest(req); setIsDeleteModalOpen(true); }}
          className="p-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          title="Delete Request"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (loading) {
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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#0d1c2e] mb-2">My Requests</h1>
        <p className="text-gray-600">View and manage all your requests</p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4338CA]/20 focus:border-[#4338CA] transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RequestStatus | '')}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4338CA]/20 focus:border-[#4338CA] transition-all appearance-none bg-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">
            Showing <span className="text-[#4338CA]">{filteredRequests.length}</span> of <span className="text-gray-900">{pagination.total}</span> requests
          </p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-sm font-bold text-[#4338CA] hover:text-[#372abf] flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh List
          </button>
        </div>
      </div>

      {filteredRequests.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredRequests}
          renderCell={(col, row) => {
            if (col.accessor === "status") {
              return (
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColorClass(row.status)}`}>
                  {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </span>
              );
            }
            if (col.accessor === "createdAt" || col.accessor === "updatedAt") {
              return formatDate(row[col.accessor]);
            }
            if (col.accessor === "actions") {
              return renderActions(row);
            }
            return row[col.accessor];
          }}
        />
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter
              ? 'Try adjusting your filters or search terms'
              : 'You haven\'t created any requests yet'}
          </p>
          {!searchTerm && !statusFilter && (
            <button
              onClick={() => router.push('/dashboard/employee/new')}
              className="bg-[#4338CA] hover:bg-[#372abf] text-white px-6 py-2.5 rounded-lg transition-colors"
            >
              Create Your First Request
            </button>
          )}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchRequests(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => fetchRequests(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {request && (
        <>
          <EditRequestModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveEdit}
            request={request}
            isLoading={updating}
          />
          <ConfirmationModal
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            onConfirm={handleConfirmCancel}
            title="Cancel Request"
            message={`Are you sure you want to cancel your request "${request.title}"? This will move it to the cancelled state.`}
            confirmText="Yes, Cancel it"
            variant="warning"
            isLoading={updating}
          />
          <DeleteRequestModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            requestTitle={request.title}
          />
        </>
      )}
    </div>
  );
}
