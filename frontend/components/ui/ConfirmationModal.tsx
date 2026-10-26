'use client';

import { AlertCircle, Trash2, X } from 'lucide-react';
import Modal from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmationModalProps) {
  const variantStyles = {
    danger: {
      icon: <Trash2 className="w-6 h-6 text-red-600" />,
      iconBg: 'bg-red-100',
      button: 'bg-red-600 hover:bg-red-700 text-white shadow-red-100',
    },
    warning: {
      icon: <AlertCircle className="w-6 h-6 text-amber-600" />,
      iconBg: 'bg-amber-100',
      button: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-100',
    },
    info: {
      icon: <AlertCircle className="w-6 h-6 text-blue-600" />,
      iconBg: 'bg-blue-100',
      button: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100',
    },
  };

  const style = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className={`w-14 h-14 ${style.iconBg} rounded-full flex items-center justify-center mb-4`}>
          {style.icon}
        </div>

        <p className="text-gray-600 mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 ${style.button}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
