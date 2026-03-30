import type {
  Product,
  Offer,
  Discount,
  Order,
  Payment,
  Subscription,
  User,
  CheckoutElement,
  PaginatedResponse,
} from '../types/api.js'

const BASE_URL = 'https://api.fungies.io/v0'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}: ${res.statusText}`
    try {
      const body = (await res.json()) as { message?: string; error?: string }
      message = body.message ?? body.error ?? message
    } catch {
      // ignore parse errors
    }
    switch (res.status) {
      case 401:
        throw new ApiError(401, `Authentication failed: ${message}. Run \`fungies auth set --key sk_...\` to authenticate.`)
      case 404:
        throw new ApiError(404, `Not found: ${message}`)
      case 422:
        throw new ApiError(422, `Validation error: ${message}`)
      case 429:
        throw new ApiError(429, `Rate limited: ${message}. Please wait before retrying.`)
      case 500:
        throw new ApiError(500, `Server error: ${message}`)
      default:
        throw new ApiError(res.status, message)
    }
  }
  return res.json() as Promise<T>
}

export class FungiesApiClient {
  private headers: Record<string, string>

  constructor(secretKey: string) {
    this.headers = {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    }
  }

  private async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = new URL(`${BASE_URL}${path}`)
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) url.searchParams.set(k, String(v))
      }
    }
    const res = await fetch(url.toString(), { headers: this.headers })
    return handleResponse<T>(res)
  }

  private async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: this.headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(res)
  }

  private async patch<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(body),
    })
    return handleResponse<T>(res)
  }

  private async delete<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: this.headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(res)
  }

  // Products
  listProducts(params?: { type?: string; limit?: number; page?: number }) {
    return this.get<PaginatedResponse<Product>>('/products', params as Record<string, string | number | undefined>)
  }
  getProduct(id: string) {
    return this.get<Product>(`/products/${id}`)
  }
  createProduct(data: Partial<Product>) {
    return this.post<Product>('/products', data)
  }
  updateProduct(id: string, data: Partial<Product>) {
    return this.patch<Product>(`/products/${id}`, data)
  }
  archiveProduct(id: string) {
    return this.delete<Product>(`/products/${id}`)
  }
  duplicateProduct(id: string) {
    return this.post<Product>(`/products/${id}/duplicate`)
  }

  // Offers
  listOffers(params?: { productId?: string; limit?: number; page?: number }) {
    return this.get<PaginatedResponse<Offer>>('/offers', params as Record<string, string | number | undefined>)
  }
  getOffer(id: string) {
    return this.get<Offer>(`/offers/${id}`)
  }
  createOffer(data: Partial<Offer>) {
    return this.post<Offer>('/offers', data)
  }
  updateOffer(id: string, data: Partial<Offer>) {
    return this.patch<Offer>(`/offers/${id}`, data)
  }
  archiveOffer(id: string) {
    return this.delete<Offer>(`/offers/${id}`)
  }
  addKeys(offerId: string, keys: string[]) {
    return this.post<{ added: number }>(`/offers/${offerId}/keys`, { keys })
  }
  removeKey(offerId: string, keyId: string) {
    return this.delete<void>(`/offers/${offerId}/keys/${keyId}`)
  }
  removeAllUnsoldKeys(offerId: string) {
    return this.delete<{ removed: number }>(`/offers/${offerId}/keys`)
  }

  // Discounts
  listDiscounts(params?: { active?: boolean; limit?: number; page?: number }) {
    return this.get<PaginatedResponse<Discount>>('/discounts', params as Record<string, string | number | boolean | undefined>)
  }
  getDiscount(id: string) {
    return this.get<Discount>(`/discounts/${id}`)
  }
  createDiscount(data: Partial<Discount>) {
    return this.post<Discount>('/discounts', data)
  }
  updateDiscount(id: string, data: Partial<Discount>) {
    return this.patch<Discount>(`/discounts/${id}`, data)
  }
  archiveDiscount(id: string) {
    return this.delete<Discount>(`/discounts/${id}`)
  }

  // Orders
  listOrders(params?: { status?: string; limit?: number; page?: number; from?: string }) {
    return this.get<PaginatedResponse<Order>>('/orders', params as Record<string, string | number | undefined>)
  }
  getOrder(id: string) {
    return this.get<Order>(`/orders/${id}`)
  }
  cancelOrder(id: string) {
    return this.post<Order>(`/orders/${id}/cancel`)
  }
  updateOrder(id: string, data: Partial<Order>) {
    return this.patch<Order>(`/orders/${id}`, data)
  }

  // Payments
  listPayments(params?: { limit?: number; page?: number; from?: string }) {
    return this.get<PaginatedResponse<Payment>>('/payments', params as Record<string, string | number | undefined>)
  }
  getPayment(id: string) {
    return this.get<Payment>(`/payments/${id}`)
  }

  // Subscriptions
  listSubscriptions(params?: { status?: string; limit?: number; page?: number }) {
    return this.get<PaginatedResponse<Subscription>>('/subscriptions', params as Record<string, string | number | undefined>)
  }
  getSubscription(id: string) {
    return this.get<Subscription>(`/subscriptions/${id}`)
  }
  createSubscription(data: Record<string, unknown>) {
    return this.post<Subscription>('/subscriptions', data)
  }
  updateSubscription(id: string, data: Record<string, unknown>) {
    return this.patch<Subscription>(`/subscriptions/${id}`, data)
  }
  cancelSubscription(id: string, data?: { immediately?: boolean; refund?: boolean }) {
    return this.delete<Subscription>(`/subscriptions/${id}`, data)
  }
  pauseSubscription(id: string, data?: Record<string, unknown>) {
    return this.patch<Subscription>(`/subscriptions/${id}/pause`, data ?? {})
  }
  chargeSubscription(id: string, data: { amount: number; currency: string }) {
    return this.post<Payment>(`/subscriptions/${id}/charge`, data)
  }

  // Users
  listUsers(params?: { search?: string; limit?: number; page?: number }) {
    return this.get<PaginatedResponse<User>>('/users', params as Record<string, string | number | undefined>)
  }
  getUser(id: string) {
    return this.get<User>(`/users/${id}`)
  }
  createUser(data: Partial<User>) {
    return this.post<User>('/users', data)
  }
  updateUser(id: string, data: Partial<User>) {
    return this.patch<User>(`/users/${id}`, data)
  }
  archiveUser(id: string) {
    return this.delete<User>(`/users/${id}`)
  }
  unarchiveUser(id: string) {
    return this.post<User>(`/users/${id}/unarchive`)
  }
  getUserInventory(id: string) {
    return this.get<{ data: unknown[] }>(`/users/${id}/inventory`)
  }

  // Elements
  listElements() {
    return this.get<PaginatedResponse<CheckoutElement>>('/elements')
  }
  createElement(data: Partial<CheckoutElement>) {
    return this.post<CheckoutElement>('/elements', data)
  }
}
