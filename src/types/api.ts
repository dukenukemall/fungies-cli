export type ProductType = 'OneTimePayment' | 'Subscription' | 'Membership' | 'GameKey'
export type ProductStatus = 'active' | 'archived'
export type OfferStatus = 'active' | 'archived'
export type DiscountType = 'coupon' | 'sale'
export type AmountType = 'fixed' | 'percentage'
export type OrderStatus = 'paid' | 'pending' | 'cancelled' | 'refunded'
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded'
export type SubscriptionStatus = 'active' | 'cancelled' | 'paused' | 'past_due'

export interface ProductVariant {
  id: string
  name: string
  description?: string
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  type: ProductType
  slug: string
  description?: string
  status: ProductStatus
  variants?: ProductVariant[]
  createdAt: string
  updatedAt: string
}

export interface Offer {
  id: string
  productId: string
  name: string
  price: number
  currency: string
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year'
    intervalCount: number
  }
  status: OfferStatus
  keyCount?: number
  createdAt: string
  updatedAt: string
}

export interface Discount {
  id: string
  code?: string
  name?: string
  type: DiscountType
  amount: number
  amountType: AmountType
  status: 'active' | 'archived'
  usageCount: number
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  offerId: string
  offerName: string
  quantity: number
  unitPrice: number
  total: number
  currency: string
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  userId: string
  cartItems: CartItem[]
  total: number
  currency: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  orderId: string
  userId: string
  amount: number
  currency: string
  status: PaymentStatus
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  userId: string
  offerId: string
  status: SubscriptionStatus
  currentPeriodEnd: string
  createdAt: string
  updatedAt: string
}

export interface BillingDetails {
  name?: string
  email?: string
  address?: {
    line1?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
}

export interface User {
  id: string
  email: string
  name?: string
  billingDetails?: BillingDetails
  status?: 'active' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface CheckoutElement {
  id: string
  name: string
  offers: string[]
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
}

export interface ApiError {
  statusCode: number
  message: string
  error?: string
}
