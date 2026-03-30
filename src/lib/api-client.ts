import type {
  Product,
  Offer,
  Discount,
  Order,
  Payment,
  Subscription,
  User,
  CheckoutElement,
  PagedResult,
} from '../types/api.js'

// The Fungies API wraps list responses as { status: "success", data: { <resource>: [...], count: N } }
function extractList<T>(body: Record<string, unknown>): PagedResult<T> {
  const data = body.data as Record<string, unknown> | undefined
  if (!data) return { items: [], count: 0 }
  // Find the array value in data (e.g. data.orders, data.products, etc.)
  for (const val of Object.values(data)) {
    if (Array.isArray(val)) {
      return { items: val as T[], count: (data.count as number | null) ?? val.length, hasMore: (data.hasMore as boolean | undefined) ?? false }
    }
  }
  return { items: [], count: 0 }
}

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
  const body = await res.json() as { status?: string; message?: string; error?: string | { message?: string }; data?: unknown }

  // Fungies wraps errors as { status: "error", error: { message } } even with HTTP 200
  const isApiError = body.status === 'error'

  if (!res.ok || isApiError) {
    let message = `HTTP ${res.status}: ${res.statusText}`
    if (typeof body.error === 'object' && (body.error as { message?: string })?.message) {
      message = (body.error as { message: string }).message
    } else if (typeof body.error === 'string') {
      message = body.error
    } else if (body.message) {
      message = body.message
    }

    const status = res.status
    if (status === 401) throw new ApiError(401, `Authentication failed: ${message}. Run \`fungies auth set --public-key pub_... --secret-key sec_...\` to authenticate.`)
    if (status === 404) throw new ApiError(404, `Not found: ${message}`)
    if (status === 422) throw new ApiError(422, `Validation error: ${message}`)
    if (status === 429) throw new ApiError(429, `Rate limited: ${message}. Please wait before retrying.`)
    if (status === 500 || isApiError) throw new ApiError(status, `API error: ${message}`)
    throw new ApiError(status, message)
  }

  return body as T
}

export class FungiesApiClient {
  private headers: Record<string, string>


  constructor(publicKey: string, secretKey?: string) {
    this.headers = {
      'x-fngs-public-key': publicKey,
      'Content-Type': 'application/json',
    }
    if (secretKey) {
      this.headers['x-fngs-secret-key'] = secretKey
    }
  }

  private getReadHeaders(): Record<string, string> {
    const h: Record<string, string> = { 'x-fngs-public-key': this.headers['x-fngs-public-key'] }
    if (this.headers['x-fngs-secret-key']) h['x-fngs-secret-key'] = this.headers['x-fngs-secret-key']
    return h
  }

  private async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = new URL(`${BASE_URL}${path}`)
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) url.searchParams.set(k, String(v))
      }
    }
    const res = await fetch(url.toString(), { headers: this.getReadHeaders() })
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

  private async getList<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<PagedResult<T>> {
    const raw = await this.get<Record<string, unknown>>(path, params)
    return extractList<T>(raw)
  }

  // Products
  listProducts(params?: { skip?: number; take?: number; termOrId?: string; statuses?: string }) {
    return this.getList<Product>('/products/list', params as Record<string, string | number | undefined>)
  }
  async getProduct(id: string) {
    const r = await this.get<{ data: Product }>(`/products/${id}`)
    return r.data ?? r as unknown as Product
  }
  createProduct(data: Partial<Product>) {
    return this.post<{ data: Product }>('/products/create', data)
  }
  updateProduct(id: string, data: Partial<Product>) {
    return this.patch<{ data: Product }>(`/products/${id}/update`, data)
  }
  archiveProduct(id: string) {
    return this.patch<{ data: Product }>(`/products/${id}/archive`, {})
  }
  duplicateProduct(id: string) {
    return this.post<{ data: Product }>(`/products/${id}/duplicate`)
  }

  // Offers
  listOffers(params?: { skip?: number; take?: number; product?: string; termOrId?: string }) {
    return this.getList<Offer>('/offers/list', params as Record<string, string | number | undefined>)
  }
  async getOffer(id: string) {
    const r = await this.get<{ data: Offer }>(`/offers/${id}`)
    return r.data ?? r as unknown as Offer
  }
  createOffer(data: Partial<Offer>) {
    return this.post<{ data: Offer }>('/offers/create', data)
  }
  updateOffer(id: string, data: Partial<Offer>) {
    return this.patch<{ data: Offer }>(`/offers/${id}/update`, data)
  }
  archiveOffer(id: string) {
    return this.patch<{ data: Offer }>(`/offers/${id}/archive`, {})
  }
  addKeys(offerId: string, keys: string[]) {
    return this.post<Record<string, unknown>>(`/offers/${offerId}/keys/add`, { keys })
  }
  removeKey(offerId: string, keyId: string) {
    return this.delete<Record<string, unknown>>(`/offers/${offerId}/keys/${keyId}/removeUnsold`)
  }
  removeAllUnsoldKeys(offerId: string) {
    return this.delete<Record<string, unknown>>(`/offers/${offerId}/keys/removeAllUnsold`)
  }

  // Discounts
  listDiscounts(params?: { status?: string; skip?: number; take?: number }) {
    return this.getList<Discount>('/discounts/list', params as Record<string, string | number | undefined>)
  }
  async getDiscount(id: string) {
    const r = await this.get<{ data: Discount }>(`/discounts/${id}`)
    return r.data ?? r as unknown as Discount
  }
  createDiscount(data: Partial<Discount>) {
    return this.post<{ data: Discount }>('/discounts/create', data)
  }
  updateDiscount(id: string, data: Partial<Discount>) {
    return this.patch<{ data: Discount }>(`/discounts/${id}/update`, data)
  }
  archiveDiscount(id: string) {
    return this.patch<{ data: Discount }>(`/discounts/${id}/archive`, {})
  }

  // Orders
  listOrders(params?: { statuses?: string; skip?: number; take?: number; createdFrom?: string }) {
    return this.getList<Order>('/orders/list', params as Record<string, string | number | undefined>)
  }
  async getOrder(id: string) {
    const r = await this.get<{ data: Order }>(`/orders/${id}`)
    return r.data ?? r as unknown as Order
  }
  cancelOrder(id: string) {
    return this.patch<{ data: Order }>(`/orders/${id}/cancel`, {})
  }
  updateOrder(id: string, data: Partial<Order>) {
    return this.patch<{ data: Order }>(`/orders/${id}/update`, data)
  }

  // Payments
  listPayments(params?: { skip?: number; take?: number; createdFrom?: string }) {
    return this.getList<Payment>('/payments/list', params as Record<string, string | number | undefined>)
  }
  async getPayment(id: string) {
    const r = await this.get<{ data: Payment }>(`/payments/${id}`)
    return r.data ?? r as unknown as Payment
  }

  // Subscriptions
  listSubscriptions(params?: { status?: string; skip?: number; take?: number }) {
    return this.getList<Subscription>('/subscriptions/list', params as Record<string, string | number | undefined>)
  }
  async getSubscription(id: string) {
    const r = await this.get<{ data: Subscription }>(`/subscriptions/${id}`)
    return r.data ?? r as unknown as Subscription
  }
  createSubscription(data: Record<string, unknown>) {
    return this.post<{ data: Subscription }>('/subscriptions/create', data)
  }
  updateSubscription(id: string, data: Record<string, unknown>) {
    return this.patch<{ data: Subscription }>(`/subscriptions/${id}/update`, data)
  }
  cancelSubscription(id: string, data?: { immediately?: boolean; refund?: boolean }) {
    return this.patch<{ data: Subscription }>(`/subscriptions/${id}/cancel`, data ?? {})
  }
  pauseSubscription(id: string, data?: Record<string, unknown>) {
    return this.patch<{ data: Subscription }>(`/subscriptions/${id}/pauseCollection`, data ?? {})
  }
  chargeSubscription(id: string, data: { amount: number; currency: string }) {
    return this.post<{ data: Payment }>(`/subscriptions/${id}/charge`, data)
  }

  // Users
  listUsers(params?: { term?: string; skip?: number; take?: number }) {
    return this.getList<User>('/users/list', params as Record<string, string | number | undefined>)
  }
  async getUser(id: string) {
    const r = await this.get<{ data: User }>(`/users/${id}`)
    return r.data ?? r as unknown as User
  }
  createUser(data: Partial<User>) {
    return this.post<{ data: User }>('/users/create', data)
  }
  updateUser(id: string, data: Partial<User>) {
    return this.patch<{ data: User }>(`/users/${id}/update`, data)
  }
  archiveUser(id: string) {
    return this.patch<{ data: User }>(`/users/${id}/archive`, {})
  }
  unarchiveUser(id: string) {
    return this.patch<{ data: User }>(`/users/${id}/unarchive`, {})
  }
  getUserInventory(id: string) {
    return this.get<Record<string, unknown>>(`/users/${id}/inventory`)
  }

  // Elements
  listElements() {
    return this.getList<CheckoutElement>('/elements/list')
  }
  createElement(data: Partial<CheckoutElement>) {
    return this.post<{ data: CheckoutElement }>('/elements/create', data)
  }
}
