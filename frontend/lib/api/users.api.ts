import { 
  User, 
  CreateUserDto, 
  UpdateUserRoleDto, 
  UserQueryDto, 
  ApiResponse,
  PaginatedResponse,
  UserRole
} from '@/types/user.types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flowdesk-backend-production-706d.up.railway.app/api/v1';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Handle 401 errors by logging out
const handleAuthError = () => {
  localStorage.removeItem('accessToken');
  // Force page reload to clear any cached state
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// Helper to normalize snake_case dates from DB to camelCase
function normalizeDates(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(normalizeDates);
  
  const newObj: any = { ...obj };
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (key === 'created_at') {
        newObj.createdAt = obj[key];
      } else if (key === 'updated_at') {
        newObj.updatedAt = obj[key];
      } else if ((key === '_id' || key === 'uuid') && !newObj.id) {
        newObj.id = obj[key];
      } else if (typeof obj[key] === 'object') {
        newObj[key] = normalizeDates(obj[key]);
      }
    }
  }
  return newObj;
}

// Generic API request helper
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  
  console.log('Making API request to:', url);
  console.log('Request options:', options);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
      credentials: 'include',
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    // Handle 401 Unauthorized errors (expired token)
    if (response.status === 401) {
      handleAuthError();
      throw new Error('Session expired. Please login again.');
    }

    const result = await response.json();
    console.log('Response data:', result);

    const normalizedResult = normalizeDates(result);

    if (!response.ok) {
      throw new Error(normalizedResult.message || `API request failed: ${response.statusText}`);
    }

    return normalizedResult;
  } catch (error) {
    console.error('API request error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Get all users
 * GET /api/v1/users
 */
export async function getAllUsers(query?: UserQueryDto): Promise<ApiResponse<PaginatedResponse<User>>> {
  const params = new URLSearchParams();
  if (query?.role) params.append('role', query.role);
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());
  if (query?.search) params.append('search', query.search);

  const endpoint = `/users${params.toString() ? `?${params.toString()}` : ''}`;
  return apiRequest<PaginatedResponse<User>>(endpoint);
}

/**
 * Get user by ID
 * GET /api/v1/users/:id
 */
export async function getUserById(id: string): Promise<ApiResponse<User>> {
  return apiRequest<User>(`/users/${id}`);
}

/**
 * Update user role
 * PATCH /api/v1/users/:id/role
 */
export async function updateUserRole(id: string, data: UpdateUserRoleDto): Promise<ApiResponse<User>> {
  console.log('Updating user role:', id);
  console.log('Role data:', data);
  console.log('Request body:', JSON.stringify(data));
  
  return apiRequest<User>(`/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete user
 * DELETE /api/v1/users/:id
 */
export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  console.log('Deleting user:', id);
  
  return apiRequest<void>(`/users/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Format date string to readable format
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';

  // Normalize SQL timestamp to ISO 8601 (replace space with T, fix timezone)
  let normalizedString = dateString.replace(' ', 'T');
  if (normalizedString.endsWith('+00')) {
    normalizedString = normalizedString.slice(0, -3) + 'Z';
  }

  const date = new Date(normalizedString);
  
  // Fallback to original if parsing fails
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  }
}

/**
 * Get role color classes
 */
export function getRoleColorClass(role: string): string {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-700';
    case 'manager':
      return 'bg-blue-100 text-blue-700';
    case 'employee':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}