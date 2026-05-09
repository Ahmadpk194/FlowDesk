'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/dashboard/DataTable';
import RejectRequestModal from '@/components/dashboard/RejectRequestModal';
import {
  getAllRequests,
  approveRequest,
  rejectRequest,
  formatDate,
  getStatusColorClass
} from '@/lib/api/requests.api';
import { Request, RequestStatus } from '@/types/request.types';
import { toast } from 'sonner';
import {
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  ClipboardList,
  Filter,
  Search,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

const columns = [
  { header: "Employee", accessor: "employee" },
  { header: "Title", accessor: "title" },
  { header: "Status", accessor: "status" },
  { header: "Submitted", accessor: "createdAt" },
  { header: "Actions", accessor: "actions", className: "text-right" }
];

export default function ManagerAllRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const fetchRequests = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const response = await getAllRequests({ limit: 100 });

      let requestData: Request[] = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        requestData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        requestData = response.data;
      } else if (Array.isArray(response)) {
        requestData = response as unknown as Request[];
      }

      setRequests(requestData);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();

    // Set up polling interval for new requests
    const interval = setInterval(() => {
      fetchRequests(true);
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [fetchRequests, refreshKey]);

  const handleApprove = async (id: string) => {
    try {
      toast.promise(approveRequest(id), {
        loading: 'Approving request...',
        success: () => {
          setRefreshKey(prev => prev + 1);
          return 'Request approved successfully';
        },
        error: (err) => err.message || 'Failed to approve request',
      });
    } catch (error) {
      // Handled by toast.promise
    }
  };

  const handleOpenRejectModal = (request: Request) => {
    setSelectedRequest(request);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!selectedRequest) return;

    try {
      await rejectRequest(selectedRequest.id, { rejectionReason: reason });
      toast.success('Request rejected successfully');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      throw error;
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesSearch =
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.createdBy?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading && requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#2a14b4] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0d1c2e]">All Requests</h1>
          <p className="text-gray-500">View and manage all employee submissions.</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or employee name..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2a14b4]/20 focus:border-[#2a14b4] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2a14b4]/20 focus:border-[#2a14b4] transition-all appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
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
            onClick={() => fetchRequests(false)}
            className="text-sm font-bold text-[#2a14b4] hover:text-[#1e0e8a] flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh List
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredRequests}
        renderCell={(col, row: Request) => {
          if (col.accessor === "employee") {
            const employeeName = row.createdBy?.name || 'Unknown';
            return (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2a14b4]/10 flex items-center justify-center text-[#2a14b4] font-bold text-xs">
                  {employeeName.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-[#0d1c2e]">{employeeName}</span>
              </div>
            );
          }
          if (col.accessor === "title") {
            return (
              <div className="max-w-md">
                <p className="font-semibold text-gray-900 truncate">{row.title}</p>
                <p className="text-xs text-gray-500 truncate">{row.description}</p>
              </div>
            );
          }
          if (col.accessor === "status") {
            return (
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getStatusColorClass(row.status)}`}>
                {row.status.toUpperCase()}
              </span>
            );
          }
          if (col.accessor === "createdAt") {
            return formatDate(row.createdAt);
          }
          if (col.accessor === "actions") {
            return (
              <div className="flex items-center justify-end gap-2">
                {row.status === RequestStatus.PENDING && (
                  <>
                    <button
                      onClick={() => handleApprove(row.id)}
                      className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleOpenRejectModal(row)}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Reject"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => router.push(`/dashboard/manager/requests/${row.id}`)}
                  className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="View Details"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            );
          }
          return (row as any)[col.accessor];
        }}
      />

      {filteredRequests.length === 0 && !loading && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No requests found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your filters or search query.</p>
        </div>
      )}

      {selectedRequest && (
        <RejectRequestModal
          isOpen={rejectModalOpen}
          onClose={() => {
            setRejectModalOpen(false);
            setSelectedRequest(null);
          }}
          onConfirm={handleConfirmReject}
          requestTitle={selectedRequest.title}
        />
      )}
    </div>
  );
}
