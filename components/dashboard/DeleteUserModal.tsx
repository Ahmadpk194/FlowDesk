'use client';

import Modal from '@/components/ui/Modal';
import { Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userName: string;
}

export default function DeleteUserModal({ isOpen, onClose, onConfirm, userName }: DeleteUserModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
    } catch (error) {
      // Error is handled in the parent component
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete User" size="sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
          <Trash2 className="w-8 h-8 text-red-600" />
        </div>
        
        <h3 className="text-xl font-bold text-[#0d1c2e] mb-3">Permanent Deletion</h3>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Are you sure you want to delete <span className="font-bold text-gray-900">{userName}</span>? 
          All associated data will be removed. This action <span className="text-red-600 font-medium">cannot be undone</span>.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
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
