'use client';

import Modal from '@/components/ui/Modal';
import { Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';

interface RejectRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  requestTitle: string;
}

export default function RejectRequestModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  requestTitle 
}: RejectRequestModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for rejection.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm(reason);
      setReason('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Request" size="md">
      <div className="flex flex-col">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 border border-red-100">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0d1c2e]">Reject this request?</h3>
            <p className="text-gray-600 mt-1">
              You are rejecting <span className="font-semibold text-gray-900">"{requestTitle}"</span>. 
              The employee will be notified.
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="reason" className="block text-sm font-bold text-gray-700 mb-2">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            rows={4}
            className={`w-full px-4 py-3 bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none`}
            placeholder="Please explain why this request is being rejected..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            disabled={isSubmitting}
          />
          {error && <p className="text-red-600 text-sm mt-2 font-medium">{error}</p>}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Rejecting...
              </>
            ) : (
              'Confirm Rejection'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
