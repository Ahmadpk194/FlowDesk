"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  X,
  AlertCircle,
  Loader2,
  User,
  Calendar,
  ClipboardList
} from 'lucide-react';
import { getRequestById, approveRequest, rejectRequest } from '@/lib/api/requests.api';
import { Request, RequestStatus } from '@/types/request.types';
import { formatDate, formatFullDateTime, getStatusColorClass } from '@/lib/api/requests.api';
import { toast } from 'sonner';
import RejectRequestModal from '@/components/dashboard/RejectRequestModal';

export default function ManagerRequestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  useEffect(() => {
    if (requestId) {
      fetchRequest();
    }
  }, [requestId]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await getRequestById(requestId);
      setRequest(response.data);
    } catch (error) {
      console.error('Failed to fetch request:', error);
      toast.error('Failed to load request details');
      router.push('/dashboard/manager/requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!request) return;
    try {
      toast.promise(approveRequest(request.id), {
        loading: 'Approving request...',
        success: () => {
          fetchRequest();
          return 'Request approved successfully';
        },
        error: (err) => err.message || 'Failed to approve request',
      });
    } catch (error) {
      // Handled by toast.promise
    }
  };

  const handleConfirmReject = async (reason: string) => {
    if (!request) return;
    try {
      await rejectRequest(request.id, { rejectionReason: reason });
      toast.success('Request rejected successfully');
      fetchRequest();
    } catch (error) {
      throw error;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      case 'cancelled':
        return <X className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#2a14b4]" />
          <span className="text-gray-600">Loading request details...</span>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Request not found</h3>
        <p className="text-gray-600 mb-6">The request you're looking for doesn't exist or you don't have access to it.</p>
        <button
          onClick={() => router.push('/dashboard/manager/requests')}
          className="bg-[#2a14b4] hover:bg-[#1e0e8a] text-white px-6 py-2.5 rounded-lg transition-colors font-bold"
        >
          Back to All Requests
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/manager/requests')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Requests
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0d1c2e] mb-2">Request Details</h1>
            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${getStatusColorClass(request.status)}`}>
                {getStatusIcon(request.status)}
                {request.status.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500 font-medium">
                ID: {request.id}
              </span>
            </div>
          </div>

          {request.status === RequestStatus.PENDING && (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleApprove}
                className="w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Approve
              </button>
              <button
                onClick={() => setRejectModalOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-[#2a14b4]" />
              Request Information
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Title</h3>
                <p className="text-xl font-bold text-gray-900">{request.title}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                  {request.description}
                </p>
              </div>
            </div>
          </div>

          {request.status === 'rejected' && request.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Rejection Reason
              </h3>
              <p className="text-red-800 text-lg">{request.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Meta Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Metadata</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#2a14b4]/10 rounded-full flex items-center justify-center text-[#2a14b4]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Created by</p>
                  <p className="font-bold text-gray-900">{request.createdBy?.name || 'Unknown User'}</p>
                  <p className="text-xs text-gray-500">{request.createdBy?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Submitted</p>
                  <p className="font-bold text-gray-900">{formatFullDateTime(request.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Last updated</p>
                  <p className="font-bold text-gray-900">{formatFullDateTime(request.updatedAt)}</p>
                </div>
              </div>

              {request.reviewedBy && (
                <div className="flex items-center gap-4 border-t pt-6">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reviewed by</p>
                    <p className="font-bold text-gray-900">{request.reviewedBy.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#0d1c2e] rounded-2xl p-6 text-white shadow-xl">
            <h3 className="text-lg font-bold mb-4">Quick Tip</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Always ensure you have reviewed any relevant project documentation or budget constraints before making a final decision.
            </p>
          </div>
        </div>
      </div>

      {request && (
        <RejectRequestModal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          onConfirm={handleConfirmReject}
          requestTitle={request.title}
        />
      )}
    </div>
  );
}
