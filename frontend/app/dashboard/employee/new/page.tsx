"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { createRequest } from '@/lib/api/requests.api';
import { CreateRequestDto } from '@/types/request.types';
import { toast } from 'sonner';

export default function NewRequestPage() {
  const router = useRouter();
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
      router.push(`/dashboard/employee/requests/${response.data.id}`);
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

  const handleCancel = () => {
    router.back();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-semibold text-[#0d1c2e] mb-2">Create New Request</h1>
        <p className="text-gray-600">Submit a new request for approval</p>
      </div>

      {/* Form */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8">
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
              rows={8}
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
              onClick={handleCancel}
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
      </div>

      {/* Tips Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-green-600 font-semibold">✓</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Be Clear</h3>
          <p className="text-sm text-gray-600">
            Clear requests get approved faster. State exactly what you need and why.
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-amber-600 font-semibold">!</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Add Context</h3>
          <p className="text-sm text-gray-600">
            Provide background information to help managers understand the importance.
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-blue-600 font-semibold">⏱</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Timeline</h3>
          <p className="text-sm text-gray-600">
            Mention if your request is time-sensitive for better prioritization.
          </p>
        </div>
      </div>
    </div>
  );
}
