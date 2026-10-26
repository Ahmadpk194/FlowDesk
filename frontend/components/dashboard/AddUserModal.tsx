import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Loader2, UserPlus } from 'lucide-react';
import { registerUser } from '@/lib/api/auth.api';
import { toast } from 'sonner';
import { UserRole } from '@/types/user.types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddUserModal({ isOpen, onClose, onSuccess }: AddUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.EMPLOYEE,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await registerUser(formData);
      toast.success('User created successfully');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: UserRole.EMPLOYEE,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New User" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4338CA] focus:border-transparent outline-none"
            placeholder="John Doe"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4338CA] focus:border-transparent outline-none"
            placeholder="john@example.com"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4338CA] focus:border-transparent outline-none"
            placeholder="••••••••"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4338CA] focus:border-transparent outline-none appearance-none bg-white"
            disabled={loading}
          >
            <option value={UserRole.EMPLOYEE}>Employee</option>
            <option value={UserRole.MANAGER}>Manager</option>
            <option value={UserRole.ADMIN}>Admin</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4 mt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-[#4338CA] hover:bg-[#372abf] text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            Create User
          </button>
        </div>
      </form>
    </Modal>
  );
}
