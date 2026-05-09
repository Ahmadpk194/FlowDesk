"use client"
import { useState, useEffect, useCallback } from 'react';
import DataTable from '@/components/dashboard/DataTable';
import StatsCard from '@/components/dashboard/StatsCard';
import RejectRequestModal from '@/components/dashboard/RejectRequestModal';
import { Clock, CheckCircle, XCircle, AlertCircle, Loader2, Search } from 'lucide-react';
import { getAllRequests, approveRequest, rejectRequest, formatDate, calculateRequestStats } from '@/lib/api/requests.api';
import { Request, RequestStatus, RequestStats } from '@/types/request.types';
import { toast } from 'sonner';

const columns = [
  { header: "Employee", accessor: "employee" },
  { header: "Title", accessor: "title" },
  { header: "Submitted", accessor: "submitted" },
  { header: "Actions", accessor: "actions", className: "text-right" },
];

export default function ManagerDashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [loading, setLoading] = useState(true);

  const filteredRequests = (requests || []).filter(req => 
    req.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.createdBy?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const fetchRequests = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      // Fetch pending requests specifically for the table
      const response = await getAllRequests({ status: RequestStatus.PENDING });
      
      let requestData: Request[] = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        requestData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        requestData = response.data;
      } else if (Array.isArray(response)) {
        requestData = response as unknown as Request[];
      }
      
      setRequests(requestData);
      
      // Fetch all requests to calculate stats
      const allResponse = await getAllRequests({ limit: 100 });
      let allRequestData: Request[] = [];
      if (allResponse.data && allResponse.data.data && Array.isArray(allResponse.data.data)) {
        allRequestData = allResponse.data.data;
      } else if (allResponse.data && Array.isArray(allResponse.data)) {
        allRequestData = allResponse.data;
      } else if (Array.isArray(allResponse)) {
        allRequestData = allResponse as unknown as Request[];
      }
      
      const calculatedStats = calculateRequestStats(allRequestData);
      setStats(calculatedStats);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch requests');
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
      await rejectRequest(selectedRequest.id, { rejectionResason: reason });
      toast.success('Request rejected successfully');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      throw error; // Let the modal handle the error display
    }
  };

  if (loading && (!requests || requests.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#2a14b4] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          label="TOTAL REQUESTS" 
          value={stats?.total.toString() || "0"} 
          color="text-[#2a14b4]" 
        />
        <StatsCard 
          label="PENDING" 
          value={stats?.pending.toString() || "0"} 
          color="text-amber-600" 
          icon={<Clock className="w-8 h-8" />} 
        />
        <StatsCard 
          label="APPROVED" 
          value={stats?.approved.toString() || "0"} 
          color="text-green-600" 
          icon={<CheckCircle className="w-8 h-8" />} 
        />
        <StatsCard 
          label="REJECTED" 
          value={stats?.rejected.toString() || "0"} 
          color="text-red-600" 
          icon={<XCircle className="w-8 h-8" />} 
        />
      </div>

      {/* Pending Requests Section Header with Search */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[#0d1c2e]">Pending requests</h2>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
              {stats?.pending || 0}
            </span>
          </div>
          <a href="/dashboard/manager/requests" className="text-[#2a14b4] font-medium hover:underline flex items-center gap-1 text-sm">
            View All →
          </a>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search pending requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2a14b4]/20 focus:border-[#2a14b4] transition-all"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredRequests || []}
        renderCell={(col, row: Request) => {
          if (col.accessor === "employee") {
            const employeeName = row.createdBy?.name || 'Unknown';
            return (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2a14b4]/10 flex items-center justify-center text-[#2a14b4] font-bold text-xs">
                  {employeeName.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{employeeName}</span>
              </div>
            );
          }
          if (col.accessor === "title") {
            return (
              <div>
                <p className="font-medium text-gray-900">{row.title}</p>
                <p className="text-xs text-gray-500 truncate max-w-[300px]">{row.description}</p>
              </div>
            );
          }
          if (col.accessor === "submitted") {
            return formatDate(row.createdAt);
          }
          if (col.accessor === "actions") {
            return (
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => handleApprove(row.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-1.5 rounded-lg text-sm font-medium transition shadow-sm"
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleOpenRejectModal(row)}
                  className="border border-red-200 text-red-600 hover:bg-red-50 px-5 py-1.5 rounded-lg text-sm font-medium transition"
                >
                  Reject
                </button>
              </div>
            );
          }
          return (row as any)[col.accessor];
        }}
      />

      {(!requests || requests.length === 0) && !loading && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">All caught up!</h3>
          <p className="text-gray-500 mt-1">There are no pending requests for you to review.</p>
        </div>
      )}

      {/* Bottom Info Cards */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Priority Alert */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4">
          <div className="text-blue-600 mt-0.5">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-700">Reviewing High-Priority Requests</h4>
            <p className="text-sm text-gray-600 mt-2">
              Ensure you review all attachments and descriptions carefully before approving.
              Large purchases may require budget approval from the finance department.
            </p>
          </div>
        </div>

        {/* Average Approval Time */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">AVG. APPROVAL TIME</p>
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-4xl font-semibold">4.2h</span>
            <span className="text-green-600 font-medium flex items-center gap-1">
              ↑12%
            </span>
          </div>
        </div>
      </div>

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
    </>
  );
}