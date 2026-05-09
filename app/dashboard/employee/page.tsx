// app/dashboard/employee/page.tsx
"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/dashboard/DataTable';
import StatsCard from '@/components/dashboard/StatsCard';
import NewRequestModal from '@/components/dashboard/NewRequestModal';
import { Clock, CheckCircle, XCircle, Loader2, Search } from 'lucide-react';
import { getMyRequests } from '@/lib/api/requests.api';
import { Request, RequestStats } from '@/types/request.types';
import { formatDate, getStatusColorClass, calculateRequestStats } from '@/lib/api/requests.api';
import { toast } from 'sonner';

const columns = [
  { header: "Title", accessor: "title" },
  { header: "Status", accessor: "status" },
  { header: "Submitted", accessor: "createdAt" },
  { header: "Actions", accessor: "actions" },
];

export default function EmployeeDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredRequests = recentRequests.filter(req => 
    req.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    req.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setIsRefreshing(true);
      
      // Fetch all requests to calculate stats and get recent requests
      const requestsResponse = await getMyRequests({ limit: 50 });
      
      // Check if response has the expected structure
      if (!requestsResponse || typeof requestsResponse !== 'object') {
        console.error('Invalid response object:', requestsResponse);
        toast.error('Invalid response from server');
        return;
      }

      // Handle different response structures
      let requestData: any[] = [];
      
      if (requestsResponse.data && requestsResponse.data.data && Array.isArray(requestsResponse.data.data)) {
        // Backend returns { success, message, data: { data: [...], ... } }
        requestData = requestsResponse.data.data;
      } else if (requestsResponse.data && Array.isArray(requestsResponse.data)) {
        // Backend returns { success, message, data: [...] }
        requestData = requestsResponse.data;
      } else if (Array.isArray(requestsResponse)) {
        // Direct array response
        requestData = requestsResponse;
      } else if (requestsResponse.success && requestsResponse.data && typeof requestsResponse.data === 'object' && !Array.isArray(requestsResponse.data)) {
        // Possibly { success: true, data: {} } when empty or single object (though unexpected for list)
        requestData = [];
      } else {
        console.error('Unexpected API response structure:', requestsResponse);
        toast.error('Invalid response structure from server');
        return;
      }
      
      const allRequests = requestData;
      const recentFive = allRequests.slice(0, 5);
      
      // Calculate stats from the requests data
      const calculatedStats = calculateRequestStats(allRequests);
      
      setStats(calculatedStats);
      setRecentRequests(recentFive);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      if (!isRefresh) setLoading(false);
      else setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up polling interval
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleViewRequest = (requestId: string) => {
    router.push(`/dashboard/employee/requests/${requestId}`);
  };

  const handleNewRequestSuccess = (requestId: string) => {
    // Refresh data to show the new request
    fetchDashboardData(true);
    // Optionally navigate to the new request details
    router.push(`/dashboard/employee/requests/${requestId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#4338CA]" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatsCard
          label="Total Requests" 
          value={stats?.total || 0} 
          color="text-[#2a14b4]"
        />
        <StatsCard
          label="Pending Requests" 
          value={stats?.pending || 0} 
          color="text-amber-600"
          icon={<Clock className="w-8 h-8" />}
        />
        <StatsCard 
          label="Approved" 
          value={stats?.approved || 0} 
          color="text-green-600"
          icon={<CheckCircle className="w-8 h-8" />}
        />
        <StatsCard 
          label="Rejected" 
          value={stats?.rejected || 0} 
          color="text-red-600"
          icon={<XCircle className="w-8 h-8" />}
        />
      </div>

      {/* Recent Requests Header with Search */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#0d1c2e]">Recent Requests</h2>
          <div className="flex items-center gap-4">
            {recentRequests.length > 0 && (
              <button 
                onClick={() => router.push('/dashboard/employee/requests')}
                className="text-[#4338CA] font-medium hover:underline text-sm"
              >
                View All →
              </button>
            )}
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search recent requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4338CA]/20 focus:border-[#4338CA] transition-all"
          />
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

            if (col.accessor === "createdAt") {
              return formatDate(row.createdAt);
            }

            if (col.accessor === "actions") {
              return (
                <button 
                  onClick={() => handleViewRequest(row.id)}
                  className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  View
                </button>
              );
            }

            return row[col.accessor];
          }}
        />
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't created any requests yet. Get started by creating your first request.
          </p>
          <button
            onClick={() => setIsNewRequestModalOpen(true)}
            className="bg-[#4338CA] hover:bg-[#372abf] text-white px-6 py-2.5 rounded-lg transition-colors"
          >
            Create Your First Request
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative h-64 bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
             onClick={() => setIsNewRequestModalOpen(true)}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#4338CA]/10 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <p className="text-lg font-semibold text-[#0d1c2e]">Create New Request</p>
            <p className="text-sm text-gray-600">Submit a new request for approval</p>
          </div>
        </div>

        <div className="relative h-64 bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <p className="text-lg font-semibold text-[#0d1c2e]">Request Statistics</p>
            <p className="text-sm text-gray-600">
              {stats?.approved ? Math.round((stats.approved / stats.total) * 100) : 0}% approval rate
            </p>
          </div>
        </div>
      </div>

      {/* New Request Modal */}
      <NewRequestModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onSuccess={handleNewRequestSuccess}
      />
    </>
  );
}