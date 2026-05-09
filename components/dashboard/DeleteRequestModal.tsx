'use client';

import Modal from '@/components/ui/Modal';
import { Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  requestTitle: string;
}

export default function DeleteRequestModal({ isOpen, onClose, onConfirm, requestTitle }: DeleteRequestModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Request" size="sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
          <Trash2 className="w-8 h-8 text-red-600" />
        </div>
        
        <h3 className="text-xl font-bold text-[#0d1c2e] mb-3">Remove Request?</h3>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Are you sure you want to delete <span className="font-bold text-gray-900">"{requestTitle}"</span>? 
          This will permanently remove the request from the database.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Go Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-100"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Deleting...
              </>
            ) : (
              'Confirm Delete'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
