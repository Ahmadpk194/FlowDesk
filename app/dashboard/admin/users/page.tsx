"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getUserIdFromToken } from '@/lib/utils/jwt';
import DataTable from '@/components/dashboard/DataTable';
import { Filter, Search, Loader2, RefreshCw, UserPlus, Trash2, Edit } from 'lucide-react';
import { getAllUsers, deleteUser } from '@/lib/api/users.api';
import { User, UserRole, PaginatedResponse } from '@/types/user.types';
import { formatDate, getRoleColorClass } from '@/lib/api/users.api';
import { toast } from 'sonner';
import RoleChangeModal from '@/components/dashboard/RoleChangeModal';
import DeleteUserModal from '@/components/dashboard/DeleteUserModal';

const columns = [
  { header: "Name", accessor: "name" },
  { header: "Email", accessor: "email" },
  { header: "Role", accessor: "role" },
  { header: "Created", accessor: "createdAt" },
  { header: "Actions", accessor: "actions" },
];

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: UserRole.ADMIN, label: 'Admin' },
  { value: UserRole.MANAGER, label: 'Manager' },
  { value: UserRole.EMPLOYEE, label: 'Employee' },
];

export default function UsersPage() {
  const router = useRouter();
  const { token } = useAuth();
  const currentUserId = getUserIdFromToken(token || '');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{id: string, name: string} | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchUsers = async (page = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (!refresh && page === 1) setLoading(true);

      const query: any = { page, limit: pagination.limit };
      if (roleFilter) query.role = roleFilter;
      if (searchTerm) query.search = searchTerm;

      const response = await getAllUsers(query);
      const responseData = response.data as any;

      if (Array.isArray(responseData)) {
        setUsers(responseData);
        setPagination({
          page: 1,
          limit: responseData.length || 10,
          total: responseData.length,
          totalPages: 1,
        });
      } else if (responseData && Array.isArray(responseData.data)) {
        setUsers(responseData.data);
        setPagination({
          page: responseData.page || 1,
          limit: responseData.limit || 10,
          total: responseData.total || responseData.data.length,
          totalPages: responseData.totalPages || 1,
        });
      } else {
        setUsers([]);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchTerm]);

  const handleRefresh = () => {
    fetchUsers(pagination.page, true);
  };

  const handleViewUser = (userId: string) => {
    router.push(`/dashboard/admin/users/${userId}`);
  };

  const handleChangeRole = (user: User) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser(userToDelete.id);
      toast.success('User deleted successfully');
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  const handleRoleChangeSuccess = () => {
    setIsRoleModalOpen(false);
    setSelectedUser(null);
    fetchUsers(pagination.page);
  };

  // Filter users based on search term and role (client-side filtering as backup)
  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  const renderActions = (user: User) => {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleViewUser(user.id)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          View
        </button>
        <button
          onClick={() => handleChangeRole(user)}
          className="px-3 py-1.5 border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg text-sm transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        {user.id !== currentUserId && (
          <button
            onClick={() => handleDeleteClick(user.id, user.name)}
            className="px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#4338CA]" />
          <span className="text-gray-600">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0d1c2e]">Users Management</h1>
        <p className="text-gray-500">View and manage all users in the system</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2a14b4]/20 focus:border-[#2a14b4] transition-all"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2a14b4]/20 focus:border-[#2a14b4] transition-all appearance-none"
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count & Refresh */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">
            Showing <span className="text-[#2a14b4]">{filteredUsers.length}</span> of <span className="text-gray-900">{pagination.total}</span> users
          </p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-sm font-bold text-[#2a14b4] hover:text-[#1e0e8a] flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh List
          </button>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredUsers}
          renderCell={(col, row) => {
            if (col.accessor === "name") {
              return (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{row.name}</span>
                  {row.id === currentUserId && (
                    <span className="bg-[#4338CA]/10 text-[#4338CA] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      YOU
                    </span>
                  )}
                </div>
              );
            }

            if (col.accessor === "role") {
              return (
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getRoleColorClass(row.role)}`}>
                  {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
                </span>
              );
            }

            if (col.accessor === "createdAt") {
              return formatDate(row.createdAt);
            }

            if (col.accessor === "actions") {
              return renderActions(row);
            }

            return row[col.accessor];
          }}
        />
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">
            {searchTerm || roleFilter ? 'Try adjusting your search or filters' : 'There are no users in the system yet'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchUsers(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => fetchUsers(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {selectedUser && (
        <RoleChangeModal
          isOpen={isRoleModalOpen}
          onClose={() => {
            setIsRoleModalOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={handleRoleChangeSuccess}
          user={selectedUser}
        />
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <DeleteUserModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          userName={userToDelete.name}
        />
      )}
    </div>
  );
}