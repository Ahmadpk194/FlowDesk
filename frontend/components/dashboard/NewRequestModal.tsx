'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { createRequest } from '@/lib/api/requests.api';
import { CreateRequestDto } from '@/types/request.types';
import { toast } from 'sonner';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (requestId: string) => void;
}

export default function NewRequestModal({ isOpen, onClose, onSuccess }: NewRequestModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateRequestDto>({
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
      };

      const response = await createRequest(requestData);

      toast.success('Request submitted successfully!');
      
      // Reset form
      setFormData({ title: '', description: '' });
      setErrors({});
      
      // Close modal
      onClose();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response.data.id);
      }
    } catch (error) {
      console.error('Failed to create request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateRequestDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ title: '', description: '' });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Request"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Request Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Office Equipment Purchase, Software License Request"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent transition-colors ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
            maxLength={100}
            autoFocus
          />
          {errors.title && (
            <p className="mt-2 text-sm text-red-600">{errors.title}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.title.length}/100 characters
          </p>
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Provide detailed information about your request, including justification, expected benefits, and any relevant details..."
            rows={6}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent transition-colors resize-none ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
            maxLength={1000}
          />
          {errors.description && (
            <p className="mt-2 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.description.length}/1000 characters
          </p>
        </div>

        {/* Form Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Request Guidelines:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be specific and detailed in your description</li>
            <li>• Include business justification for your request</li>
            <li>• Mention any deadlines or time constraints</li>
            <li>• Attach relevant documents if needed (after submission)</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#4338CA] hover:bg-[#372abf] text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
