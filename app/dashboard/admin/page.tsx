"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/dashboard/DataTable';
import StatsCard from '@/components/dashboard/StatsCard';
import { Users, ClipboardList, Clock, CheckCircle, Loader2, ArrowRight, Activity, FileText, X } from 'lucide-react';
import { getAllRequests, formatDate } from '@/lib/api/requests.api';
import { Request } from '@/types/request.types';
import { toast } from 'sonner';

const columns = [
  { header: "User", accessor: "user" },
  { header: "Action", accessor: "action" },
  { header: "Request", accessor: "request" },
  { header: "Time", accessor: "time" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    const fetchAllRequests = async () => {
      try {
        setLoading(true);
        console.log('Attempting to fetch all requests for admin dashboard...');
        const response = await getAllRequests();
        
        console.log('Admin dashboard API response:', response);
        
        // Check if response is empty object
        if (response && Object.keys(response).length === 0) {
          console.error('Received empty object from API');
          toast.error('Unable to load requests. API endpoint may not be available.');
          setRequests([]); // Set empty array to avoid breaking the UI
          return;
        }
        
        // Handle different response structures
        let requestData;
        if (response.success && response.data?.data) {
          requestData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          requestData = response.data;
        } else if (Array.isArray(response)) {
          requestData = response;
        } else {
          console.error('Failed to fetch requests:', response);
          console.error('Response structure:', JSON.stringify(response, null, 2));
          toast.error('Invalid response structure from server');
          setRequests([]); // Set empty array to avoid breaking the UI
          return;
        }

        if (Array.isArray(requestData)) {
          setRequests(requestData);
        } else {
          console.error('Expected array but got:', requestData);
          toast.error('Invalid data format from server');
          setRequests([]); // Set empty array to avoid breaking the UI
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        toast.error(error instanceof Error ? error.message : 'Error loading requests');
        setRequests([]); // Set empty array to avoid breaking the UI
      } finally {
        setLoading(false);
      }
    };

    fetchAllRequests();
  }, []);

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

  const recentActivity = requests.slice(0, 5).map((request) => ({
    id: request.id,
    user: request.createdBy?.name || request.createdById || 'Unknown User',
    action: request.status === 'approved' ? 'Approved request' : request.status === 'rejected' ? 'Rejected request' : 'Submitted request',
    request: request.title,
    time: request.createdAt,
    status: request.status,
    avatar: `https://i.pravatar.cc/40?u=${request.createdBy?.name || request.createdById || 'unknown'}`,
  }));

  const latestRequests = requests.slice(0, 5);

  return (
    <>
      {/* Warning message if requests couldn't be loaded */}
      {!loading && requests.length === 0 && showWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-10 relative">
          <button 
            onClick={() => setShowWarning(false)}
            className="absolute top-4 right-4 p-1 hover:bg-amber-100 rounded-full text-amber-600 transition-colors"
            title="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-4 pr-8">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 mb-2">Unable to load requests data</h4>
              <p className="text-sm text-amber-800 mb-2">
                The API endpoint for fetching all requests may not be available yet.
              </p>
              <p className="text-sm text-amber-700">
                Check the browser console for more details. The charts and activity below may not display correctly until the backend endpoint is implemented.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          label="TOTAL REQUESTS" 
          value={requests.length} 
          color="text-gray-700" 
          icon={<ClipboardList className="w-8 h-8" />} 
        />
        <StatsCard 
          label="PENDING REQUESTS" 
          value={requests.filter(r => r.status === 'pending').length} 
          color="text-amber-600" 
          icon={<Clock className="w-8 h-8" />} 
        />
        <StatsCard 
          label="APPROVED REQUESTS" 
          value={requests.filter(r => r.status === 'approved').length} 
          color="text-green-600" 
          icon={<CheckCircle className="w-8 h-8" />} 
        />
        <StatsCard 
          label="APPROVAL RATE" 
          value={requests.length > 0 ? Math.round((requests.filter(r => r.status === 'approved').length / requests.length) * 100) : 0} 
          color="text-green-600" 
          icon={<CheckCircle className="w-8 h-8" />} 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Requests Over Time (Bar Chart) */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 h-[380px]">
          <h3 className="font-semibold text-lg mb-6">Requests over time</h3>
          <div className="flex items-end justify-between h-64 gap-4 px-4">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
              const heights = [40, 55, 75, 45, 90, 65];
              return (
                <div key={i} className="flex flex-col items-center flex-1 gap-2">
                  <div 
                    className="w-full bg-[#4338CA] rounded-t transition-all hover:bg-[#372abf]"
                    style={{ height: `${heights[i]}%` }}
                  />
                  <span className="text-xs text-gray-500">{month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Requests by Status (Donut) */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 h-[380px]">
          <h3 className="font-semibold text-lg mb-6">Requests by status</h3>
          <div className="flex items-center justify-center gap-12">
            <div className="relative w-52 h-52">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="48" fill="none" stroke="#e2e8f0" strokeWidth="18"/>
                <circle cx="60" cy="60" r="48" fill="none" stroke="#4338CA" strokeWidth="18" 
                        strokeDasharray="301" strokeDashoffset="75"/>
                <circle cx="60" cy="60" r="48" fill="none" stroke="#fbbf24" strokeWidth="18" 
                        strokeDasharray="301" strokeDashoffset="210"/>
                <circle cx="60" cy="60" r="48" fill="none" stroke="#ef4444" strokeWidth="18" 
                        strokeDasharray="301" strokeDashoffset="260"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-semibold">{requests.length}</span>
                <span className="text-sm text-gray-500">Total</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-[#4338CA] rounded"></div>
                <span>Approved <span className="text-gray-500">({requests.filter(r => r.status === 'approved').length})</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-amber-400 rounded"></div>
                <span>Pending <span className="text-gray-500">({requests.filter(r => r.status === 'pending').length})</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Rejected <span className="text-gray-500">({requests.filter(r => r.status === 'rejected').length})</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Requests (Col Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#4338CA]" />
              Latest Requests
            </h2>
            <a href="/dashboard/admin/requests" className="text-sm font-medium text-[#4338CA] hover:text-[#372abf] flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
            {latestRequests.length > 0 ? (
              <DataTable
                columns={[
                  { header: "Title", accessor: "title" },
                  { header: "Status", accessor: "status" },
                  { header: "Created By", accessor: "createdBy" },
                  { header: "Date", accessor: "createdAt" },
                  { header: "", accessor: "actions" }
                ]}
                data={latestRequests}
                renderCell={(col, row) => {
                  if (col.accessor === "status") {
                    return (
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                        row.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 
                        row.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 
                        row.status === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 
                        'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </span>
                    );
                  }
                  if (col.accessor === "createdAt") {
                    return <span className="text-gray-500 font-medium">{formatDate(row.createdAt)}</span>;
                  }
                  if (col.accessor === "createdBy") {
                    return (
                      <div className="flex items-center gap-3">
                        <img src={`https://i.pravatar.cc/40?u=${row.createdBy?.name || row.createdById || 'unknown'}`} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                        <span className="font-medium text-gray-900">{row.createdBy?.name || row.createdById || 'Unknown User'}</span>
                      </div>
                    );
                  }
                  if (col.accessor === "title") {
                    return <span className="font-semibold text-gray-900">{row.title}</span>;
                  }
                  if (col.accessor === "actions") {
                    return (
                      <button 
                        onClick={() => router.push(`/dashboard/admin/requests/${row.id}`)}
                        className="p-1.5 text-gray-400 hover:text-[#4338CA] hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    );
                  }
                  return row[col.accessor];
                }}
              />
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <ClipboardList className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No requests found</h3>
                <p className="text-gray-500 text-sm">
                  There are no requests in the system at the moment.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Feed (Col Span 1) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#4338CA]" />
              Activity Feed
            </h2>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6 transition-all hover:shadow-md">
            {recentActivity.length > 0 ? (
              <div className="space-y-6">
                {recentActivity.map((activity, idx) => (
                  <div 
                    key={activity.id || idx} 
                    className="relative flex gap-4 cursor-pointer p-2 -m-2 rounded-xl hover:bg-gray-50 transition-colors"
                    onClick={() => router.push(`/dashboard/admin/requests/${activity.id}`)}
                  >
                    {/* Vertical line connecting feed items */}
                    {idx !== recentActivity.length - 1 && (
                      <div className="absolute top-10 left-5 -ml-px w-0.5 h-full bg-gray-100" />
                    )}
                    
                    <div className="relative z-10 shrink-0">
                      <img src={activity.avatar} alt="" className="w-10 h-10 rounded-full ring-4 ring-white shadow-sm" />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                        activity.status === 'approved' ? 'bg-emerald-500' :
                        activity.status === 'rejected' ? 'bg-rose-500' : 'bg-[#4338CA]'
                      }`}>
                        {activity.status === 'approved' ? <CheckCircle className="w-2.5 h-2.5 text-white" /> : 
                         activity.status === 'rejected' ? <span className="w-1.5 h-1.5 bg-white rounded-full" /> : 
                         <Clock className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 pb-1">
                      <p className="text-sm text-gray-900 leading-snug">
                        <span className="font-bold">{activity.user}</span>{' '}
                        <span className="text-gray-600">{activity.action.toLowerCase()}</span>{' '}
                        <span className="font-semibold">"{activity.request}"</span>
                      </p>
                      <span className="text-xs text-gray-400 font-medium mt-1">{formatDate(activity.time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}