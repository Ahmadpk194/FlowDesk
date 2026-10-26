'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Loader2, Edit3, Type, AlignLeft } from 'lucide-react';
import { Request, UpdateRequestDto } from '@/types/request.types';

interface EditRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateRequestDto) => Promise<void>;
  request: Request;
  isLoading?: boolean;
}

export default function EditRequestModal({ isOpen, onClose, onSave, request, isLoading = false }: EditRequestModalProps) {
  const [form, setForm] = useState<UpdateRequestDto>({
    title: request.title,
    description: request.description,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setForm({
        title: request.title,
        description: request.description,
      });
      setErrors({});
    }
  }, [isOpen, request]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.title?.trim()) newErrors.title = 'Title is required';
    if (!form.description?.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Request" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 mb-6">
          <div className="w-10 h-10 bg-[#4338CA] text-white rounded-xl flex items-center justify-center">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#0d1c2e]">Refining Request</p>
            <p className="text-xs text-[#64748B]">Update the details of your submission</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#0d1c2e] mb-2">
              <Type className="w-4 h-4 text-indigo-500" />
              Request Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. New Office Equipment"
              className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4338CA] transition-all
                ${errors.title ? 'border-red-300 ring-red-50' : 'border-gray-200'}`}
              disabled={isLoading}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.title}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#0d1c2e] mb-2">
              <AlignLeft className="w-4 h-4 text-indigo-500" />
              Detailed Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Please provide all necessary details..."
              rows={6}
              className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4338CA] transition-all resize-none
                ${errors.description ? 'border-red-300 ring-red-50' : 'border-gray-200'}`}
              disabled={isLoading}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-[2] px-6 py-3.5 bg-[#4338CA] hover:bg-[#372abf] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
