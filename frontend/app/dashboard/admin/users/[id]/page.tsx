"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getUserIdFromToken } from '@/lib/utils/jwt';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Shield, 
  Calendar,
  Loader2,
  Clock
} from 'lucide-react';
import { getUserById, deleteUser } from '@/lib/api/users.api';
import { User as UserType } from '@/types/user.types';
import { formatDate, getRoleColorClass } from '@/lib/api/users.api';
import { toast } from 'sonner';
import RoleChangeModal from '@/components/dashboard/RoleChangeModal';
import DeleteUserModal from '@/components/dashboard/DeleteUserModal';

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { token } = useAuth();
  const currentUserId = getUserIdFromToken(token || '');

  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await getUserById(userId);
      const userData = response.data || (response as any);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      toast.error('Failed to load user details');
      router.push('/dashboard/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!user) return;

    try {
      await deleteUser(userId);
      toast.success('User deleted successfully');
      router.push('/dashboard/admin/users');
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  const handleRoleChangeSuccess = () => {
    setIsRoleModalOpen(false);
    fetchUser();
  };

  const getRoleIcon = (role: string) => {
    return <Shield className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#4338CA]" />
          <span className="text-gray-600">Loading user details...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">User not found</h3>
        <p className="text-gray-600 mb-6">The user you're looking for doesn't exist or you don't have access to it.</p>
        <button
          onClick={() => router.push('/dashboard/admin/users')}
          className="bg-[#4338CA] hover:bg-[#372abf] text-white px-6 py-2.5 rounded-lg transition-colors"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/admin/users')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#0d1c2e] mb-2">User Details</h1>
            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getRoleColorClass(user.role)}`}>
                {getRoleIcon(user.role)}
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                User ID: {user.id}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="px-4 py-2 border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Change Role
            </button>
            {user.id !== currentUserId && (
              <button
                onClick={handleDeleteClick}
                className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete User
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Information */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">User Information</h2>
            
            <div className="space-y-6">
              {/* Name */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                  <p className="text-base text-gray-900 font-medium">{user.name}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                  <p className="text-base text-gray-900 font-medium">{user.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">Role</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRoleColorClass(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Account Created</p>
                  <p className="text-base font-semibold text-gray-900">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-base font-semibold text-gray-900">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="w-full px-4 py-3 border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Change Role
              </button>
              {user.id !== currentUserId && (
                <button
                  onClick={handleDeleteClick}
                  className="w-full px-4 py-3 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </button>
              )}
            </div>
          </div>

          {/* Role Information */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Role Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${user.role === 'admin' ? 'bg-purple-500' : user.role === 'manager' ? 'bg-blue-500' : 'bg-green-500'}`} />
                <span className="text-sm text-gray-700 capitalize">{user.role}</span>
              </div>
              <p className="text-sm text-gray-600">
                {user.role === 'admin' && 'Full system access with user management capabilities.'}
                {user.role === 'manager' && 'Can view and approve/reject requests from employees.'}
                {user.role === 'employee' && 'Can create and manage own requests.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Change Modal */}
      {user && (
        <RoleChangeModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          onSuccess={handleRoleChangeSuccess}
          user={user}
        />
      )}

      {/* Delete Confirmation Modal */}
      {user && (
        <DeleteUserModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          userName={user.name}
        />
      )}
    </div>
  );
}