/**
 * Shared API types for CocoBu frontend
 * These types match the backend API responses
 */

export interface User {
  id: string;
  email: string;
  real_name: string | null;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  name: string;
  type: 'PERSONAL' | 'SPLIT';
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  book_id: string;
  user_id: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  joined_at: string;
}

export interface Entry {
  id: string;
  book_id: string;
  occurred_on: string;
  amount: string;
  description: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
}

export interface LoginResponse {
  message: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface VerifyTokenResponse {
  user: User;
  token: string;
}

export interface CreateBookRequest {
  name: string;
  type: 'PERSONAL' | 'SPLIT';
  currency?: string;
}

export interface CreateBookResponse {
  book: Book;
  membership: Membership;
}
