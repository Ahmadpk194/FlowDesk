'use client';

import { useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/auth-context';
import { updateUserRole } from '@/lib/api/users.api';
import { User, UserRole } from '@/types/user.types';
import { toast } from 'sonner';
import { getUserIdFromToken } from '@/lib/utils/jwt';

interface RoleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: User;
}

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  {
    value: UserRole.EMPLOYEE,
    label: 'Employee',
    description: 'Can create and manage own requests'
  },
  {
    value: UserRole.MANAGER,
    label: 'Manager',
    description: 'Can view and approve/reject requests from employees'
  },
  {
    value: UserRole.ADMIN,
    label: 'Admin',
    description: 'Full system access with user management capabilities'
  }
];

export default function RoleChangeModal({ isOpen, onClose, onSuccess, user }: RoleChangeModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const currentUserId = token ? getUserIdFromToken(token) : null;
  const isEditingSelf = currentUserId === user.id;
  
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    typeof user.role === 'string' ? user.role as UserRole : user.role
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentRole = typeof user.role === 'string' ? user.role as UserRole : user.role;
    if (selectedRole === currentRole) {
      toast.info('Role is already set to ' + selectedRole);
      onClose();
      return;
    }

    try {
      setLoading(true);

      await updateUserRole(user.id, { role: selectedRole });

      toast.success(`Role changed to ${selectedRole} successfully!`);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Failed to change role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change role');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedRole(user.role);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Access Level"
      size="md"
    >
      <div className="space-y-8">
        {/* User Info Header */}
        <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
          <div className="w-12 h-12 bg-[#4338CA] text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-[#0d1c2e]">{user.name}</p>
            <p className="text-sm text-[#64748B]">{user.email}</p>
          </div>
          <div className="ml-auto text-right">
             <span className="text-[10px] font-bold text-[#4338CA] uppercase tracking-widest block mb-1">Current Role</span>
             <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-white border border-indigo-100 text-[#4338CA] capitalize">
                {user.role}
             </span>
          </div>
        </div>

        {/* Role Selection */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            {isEditingSelf && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-4">
                <p className="text-sm text-amber-800 font-medium">
                  You cannot change your own role to prevent accidental loss of administrative access. 
                  Please ask another administrator to update your permissions if needed.
                </p>
              </div>
            )}
            {roleOptions.map((option) => (
              <label
                key={option.value}
                className={`relative flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all group
                  ${selectedRole === option.value 
                    ? 'border-[#4338CA] bg-indigo-50/30' 
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                  }
                  ${isEditingSelf ? 'opacity-70 cursor-not-allowed grayscale-[0.2]' : ''}`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                   ${selectedRole === option.value ? 'border-[#4338CA]' : 'border-gray-200 group-hover:border-gray-300'}`}>
                   {selectedRole === option.value && <div className="w-3 h-3 bg-[#4338CA] rounded-full" />}
                </div>
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={selectedRole === option.value}
                  onChange={(e) => !isEditingSelf && setSelectedRole(e.target.value as UserRole)}
                  className="hidden"
                  disabled={loading || isEditingSelf}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className={`w-5 h-5 ${selectedRole === option.value ? 'text-[#4338CA]' : 'text-gray-400'}`} />
                    <span className={`font-bold ${selectedRole === option.value ? 'text-[#4338CA]' : 'text-[#0d1c2e]'}`}>
                      {option.label}
                    </span>
                  </div>
                  <p className="text-sm text-[#64748B] leading-relaxed">{option.description}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedRole === user.role || isEditingSelf}
              className="flex-[2] px-6 py-3.5 bg-[#4338CA] hover:bg-[#372abf] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating Permissions...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Update Access Level
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}