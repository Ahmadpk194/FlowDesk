import { 
  Request, 
  CreateRequestDto, 
  UpdateRequestDto, 
  RejectRequestDto, 
  RequestQueryDto, 
  RequestStats,
  ApiResponse,
  PaginatedResponse,
  RequestStatus,
  UserRole
} from '@/types/request.types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flowdesk-backend-production-706d.up.railway.app/api/v1';

// Development mode flag - set to true when backend is not available
const DEV_MODE = false; // Use real backend

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
      } else if (key === 'rejection_reason') {
        newObj.rejectionReason = obj[key];
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
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
      credentials: 'include',
    });

    // Handle 401 Unauthorized errors (expired token)
    if (response.status === 401) {
      handleAuthError();
      throw new Error('Session expired. Please login again.');
    }

    // Handle 404 errors
    if (response.status === 404) {
      throw new Error(`API endpoint not found: ${endpoint}`);
    }

    // Handle 403 errors
    if (response.status === 403) {
      throw new Error('Access denied. You may not have permission to access this resource.');
    }

    const result = await response.json();
    const normalizedResult = normalizeDates(result);

    if (!response.ok) {
      throw new Error(normalizedResult.message || `API request failed: ${response.statusText}`);
    }

    // Validate response structure
    if (!normalizedResult || typeof normalizedResult !== 'object') {
      throw new Error('Invalid response format from server');
    }

    return normalizedResult;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

// ==================== EMPLOYEE REQUESTS ====================

/**
 * Get current user's requests
 * GET /api/v1/requests/my
 */
export async function getMyRequests(query?: RequestQueryDto): Promise<ApiResponse<PaginatedResponse<Request>>> {
  const params = new URLSearchParams();
  if (query?.status) params.append('status', query.status);
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());

  const endpoint = `/requests/my${params.toString() ? `?${params.toString()}` : ''}`;
  return apiRequest<PaginatedResponse<Request>>(endpoint);
}


/**
 * Create a new request
 * POST /api/v1/requests
 */
export async function createRequest(data: CreateRequestDto): Promise<ApiResponse<Request>> {
  return apiRequest<Request>('/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get a specific request by ID
 * GET /api/v1/requests/:id
 */
export async function getRequestById(id: string): Promise<ApiResponse<Request>> {
  return apiRequest<Request>(`/requests/${id}`);
}

/**
 * Update a pending request
 * PATCH /requests/:id
 */
export async function updateRequest(id: string, data: UpdateRequestDto): Promise<ApiResponse<Request>> {
  return apiRequest<Request>(`/requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Cancel a pending request
 * PATCH /api/v1/requests/:id/cancel
 */
export async function cancelRequest(id: string): Promise<ApiResponse<Request>> {
  return apiRequest<Request>(`/requests/${id}/cancel`, {
    method: 'PATCH',
  });
}

/**
 * Delete a request
 * DELETE /api/v1/requests/:id
 */
export async function deleteRequest(id: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/requests/${id}`, {
    method: 'DELETE',
  });
}

// ==================== MANAGER REQUESTS ====================

/**
 * Get all requests (for managers)
 * GET /api/v1/requests
 */
export async function getAllRequests(query?: RequestQueryDto): Promise<ApiResponse<PaginatedResponse<Request>>> {
  const params = new URLSearchParams();
  if (query?.status) params.append('status', query.status);
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());

  const endpoint = `/requests${params.toString() ? `?${params.toString()}` : ''}`;
  return apiRequest<PaginatedResponse<Request>>(endpoint);
}

/**
 * Approve a pending request
 * PATCH /api/v1/requests/:id/approve
 */
export async function approveRequest(id: string): Promise<ApiResponse<Request>> {
  return apiRequest<Request>(`/requests/${id}/approve`, {
    method: 'PATCH',
  });
}

/**
 * Reject a pending request
 * PATCH /api/v1/requests/:id/reject
 */
export async function rejectRequest(id: string, data: RejectRequestDto): Promise<ApiResponse<Request>> {
  return apiRequest<Request>(`/requests/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format date string to readable format
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';

  let normalizedString = dateString.replace(' ', 'T');
  if (normalizedString.endsWith('+00')) {
    normalizedString = normalizedString.slice(0, -3) + 'Z';
  }

  const date = new Date(normalizedString);
  
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
 * Format date string to full date and time
 */
export function formatFullDateTime(dateString: string): string {
  if (!dateString) return 'N/A';

  let normalizedString = dateString.replace(' ', 'T');
  if (normalizedString.endsWith('+00')) {
    normalizedString = normalizedString.slice(0, -3) + 'Z';
  }

  const date = new Date(normalizedString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour12: true
  });
}

/**
 * Get status color classes
 */
export function getStatusColorClass(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-700';
    case 'approved':
      return 'bg-green-100 text-green-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    case 'cancelled':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

/**
 * Check if request can be cancelled
 */
export function canCancelRequest(request: Request): boolean {
  return request.status === 'pending';
}

/**
 * Check if request can be edited
 */
export function canEditRequest(request: Request): boolean {
  return request.status === 'pending';
}

/**
 * Calculate request statistics from an array of requests
 */
export function calculateRequestStats(requests: Request[]): RequestStats {
  return {
    total: requests.length,
    pending: requests.filter(r => r.status === RequestStatus.PENDING).length,
    approved: requests.filter(r => r.status === RequestStatus.APPROVED).length,
    rejected: requests.filter(r => r.status === RequestStatus.REJECTED).length,
    cancelled: requests.filter(r => r.status === RequestStatus.CANCELLED).length,
  };
}
