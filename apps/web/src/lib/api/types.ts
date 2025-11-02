/**
 * Shared API types for CocoBu frontend
 * These types match the backend API responses
 */

export interface User {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
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
  userId: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
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
