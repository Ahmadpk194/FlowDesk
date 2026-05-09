"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  X, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  User,
  Calendar
} from 'lucide-react';
import { getRequestById, updateRequest, cancelRequest, deleteRequest } from '@/lib/api/requests.api';
import { Request, UpdateRequestDto } from '@/types/request.types';
import { formatDate, formatFullDateTime, getStatusColorClass, canEditRequest, canCancelRequest } from '@/lib/api/requests.api';
import { toast } from 'sonner';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import DeleteRequestModal from '@/components/dashboard/DeleteRequestModal';
import EditRequestModal from '@/components/dashboard/EditRequestModal';

export default function RequestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
      router.push('/dashboard/employee/requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (data: UpdateRequestDto) => {
    try {
      setUpdating(true);
      const response = await updateRequest(requestId, data);
      setRequest(response.data);
      setIsEditModalOpen(false);
      toast.success('Request updated successfully');
    } catch (error) {
      console.error('Failed to update request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update request');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      setUpdating(true);
      const response = await cancelRequest(requestId);
      setRequest(response.data);
      toast.success('Request cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel request');
    } finally {
      setUpdating(false);
      setIsCancelModalOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setUpdating(true);
      await deleteRequest(requestId);
      toast.success('Request deleted successfully');
      router.push('/dashboard/employee/requests');
    } catch (error) {
      console.error('Failed to delete request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete request');
      setUpdating(false);
      setIsDeleteModalOpen(false);
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
          <Loader2 className="w-6 h-6 animate-spin text-[#4338CA]" />
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
          onClick={() => router.push('/dashboard/employee/requests')}
          className="bg-[#4338CA] hover:bg-[#372abf] text-white px-6 py-2.5 rounded-lg transition-colors"
        >
          Back to My Requests
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/employee/requests')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Requests
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#0d1c2e] mb-2">Request Details</h1>
            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClass(request.status)}`}>
                {getStatusIcon(request.status)}
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                Request ID: {request.id}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {canEditRequest(request) && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            {canCancelRequest(request) && (
              <button
                onClick={() => setIsCancelModalOpen(true)}
                disabled={updating}
                className="w-full sm:w-auto px-4 py-2 border border-orange-300 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center"
              >
                Cancel Request
              </button>
            )}
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={updating}
              className="w-full sm:w-auto px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Request Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Information */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Request Information</h2>
            
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Title</h3>
                <p className="text-gray-900 font-medium">{request.title}</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {request.description}
                </p>
              </div>
            </div>
          </div>

          {/* Rejection Reason (if rejected) */}
          {request.status === 'rejected' && request.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-3">Rejection Reason</h3>
              <p className="text-red-800">{request.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Request Details */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Created by</p>
                  <p className="text-sm text-gray-600">{request.createdBy?.name || request.createdById || 'Unknown User'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Submitted</p>
                  <p className="text-sm text-gray-600">{formatFullDateTime(request.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Last updated</p>
                  <p className="text-sm text-gray-600">{formatFullDateTime(request.updatedAt)}</p>
                </div>
              </div>

              {(request.reviewedBy || request.reviewedById) && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Reviewed by</p>
                    <p className="text-sm text-gray-600">{request.reviewedBy?.name || request.reviewedById || 'Unknown User'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Request Created</p>
                  <p className="text-xs text-gray-500">{formatFullDateTime(request.createdAt)}</p>
                </div>
              </div>
              
              {request.updatedAt !== request.createdAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Request Updated</p>
                    <p className="text-xs text-gray-500">{formatFullDateTime(request.updatedAt)}</p>
                  </div>
                </div>
              )}

              {request.status !== 'pending' && (
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    request.status === 'approved' ? 'bg-green-500' : 
                    request.status === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {request.status === 'approved' ? 'Request Approved' : 
                       request.status === 'rejected' ? 'Request Rejected' : 'Request Cancelled'}
                    </p>
                    <p className="text-xs text-gray-500">{formatFullDateTime(request.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modals */}
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
    </div>
  );
}
