// Shared domain types for the service layer (email / stripe / calendly).
export type { default as User } from '../models/User.js';
export type { default as Booking } from '../models/Booking.js';
export type { default as Task } from '../models/Task.js';
export type { default as Lead } from '../models/Lead.js';
export type { default as Subscription } from '../models/Subscription.js';

export interface Invoice {
  id: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: string | null;
  created: number;
  periodStart: number;
  periodEnd: number;
  pdfUrl?: string | null;
  hostedUrl?: string | null;
}
