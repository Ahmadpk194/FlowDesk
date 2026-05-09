import { UserRole } from './user.types';

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

// Re-export UserRole for backward compatibility
export { UserRole };

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Request {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  createdBy?: User;
  createdById?: string;
  reviewedBy?: User;
  reviewedById?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestDto {
  title: string;
  description: string;
}

export interface UpdateRequestDto {
  title?: string;
  description?: string;
}

export interface RejectRequestDto {
  rejectionReason: string;
}

export interface RequestQueryDto {
  status?: RequestStatus;
  page?: number;
  limit?: number;
}

export interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
