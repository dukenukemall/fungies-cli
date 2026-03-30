// Fungies API base URL: https://api.fungies.io/v0

// Enums

export enum ProductType {
  OneTimePayment = 'OneTimePayment',
  Subscription = 'Subscription',
  Membership = 'Membership',
  GameKey = 'GameKey',
}

export enum ProductStatus {
  active = 'active',
  archived = 'archived',
}

export enum OfferStatus {
  active = 'active',
  archived = 'archived',
}

export enum DiscountType {
  coupon = 'coupon',
  sale = 'sale',
}

export enum AmountType {
  fixed = 'fixed',
  percentage = 'percentage',
}

export enum OrderStatus {
  pending = 'pending',
  paid = 'paid',
  cancelled = 'cancelled',
  refunded = 'refunded',
  disputed = 'disputed',
}

export enum PaymentStatus {
  pending = 'pending',
  paid = 'paid',
  refunded = 'refunded',
  failed = 'failed',
}

export enum SubscriptionStatus {
  active = 'active',
  cancelled = 'cancelled',
  paused = 'paused',
  trialing = 'trialing',
  past_due = 'past_due',
}

// Core interfaces

export interface Variant {
  id: string;
  name: string;
  description?: string;
  price: number; // in cents
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  intervalCount: number;
  intervalUnit: string;
  trialDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  type: ProductType;
  status: ProductStatus;
  variants?: Variant[];
  plans?: Plan[];
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  name: string;
  productId: string;
  status: OfferStatus;
  price: number; // in cents
  currency: string;
  recurring?: boolean;
  recurringInterval?: string;
  recurringIntervalCount?: number;
  keyCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  amountType: AmountType;
  amount: number;
  usageCount: number;
  expiresAt?: string;
  maxUsage?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  offerId: string;
  quantity: number;
  price: number; // in cents
  currency: string;
}

export interface Order {
  id: string;
  userId?: string;
  status: OrderStatus;
  items: CartItem[];
  total: number; // in cents
  currency: string;
  discountId?: string;
  discountAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  userId?: string;
  status: PaymentStatus;
  amount: number; // in cents
  currency: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  offerId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingDetails {
  countryCode: string;
  postalCode?: string;
  city?: string;
  line1?: string;
  line2?: string;
  state?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  billingDetails?: BillingDetails;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  key: string;
  orderId?: string;
  claimedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutElement {
  id: string;
  name: string;
  offers: string[];
}

// Generic / utility types

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
}
