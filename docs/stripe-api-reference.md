# Stripe API Reference — Knowledge Base

> Crawled from https://docs.stripe.com/api — 2026-03-30
> Version: 2026-03-25.dahlia (latest)

---

## Overview

- **Base URL:** `https://api.stripe.com`
- **Protocol:** REST, HTTPS only (HTTP calls fail)
- **Request format:** `application/x-www-form-urlencoded` (form-encoded) for POST; query params for GET
- **Response format:** JSON
- **No bulk updates** — one object per request
- **API versioning:** pinned per account, set via `Stripe-Version` header or dashboard setting

---

## Authentication

```bash
# HTTP Basic Auth — API key as username, no password
curl https://api.stripe.com/v1/charges \
  -u sk_test_YOURKEY:

# Bearer auth (for cross-origin)
-H "Authorization: Bearer sk_test_YOURKEY"
```

**Key prefixes:**
| Key | Prefix | Use |
|-----|--------|-----|
| Test secret | `sk_test_` | Development/testing — no real charges |
| Live secret | `sk_live_` | Production |
| Restricted | `rk_test_` / `rk_live_` | Scoped permissions |
| Publishable | `pk_test_` / `pk_live_` | Client-side (safe to expose) |

- Never expose secret keys in client-side code or version control
- Per-request key override supported on all SDK methods

---

## Errors

**HTTP status codes:**
| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request — missing required param |
| 401 | Unauthorized — invalid API key |
| 402 | Request Failed — params valid but request failed (e.g. card declined) |
| 403 | Forbidden — no permission |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests — rate limited |
| 500/502/503/504 | Stripe server error |

**Error object fields:**
- `type` — `api_error` | `card_error` | `idempotency_error` | `invalid_request_error`
- `code` — machine-readable error code (e.g. `card_declined`, `insufficient_funds`)
- `decline_code` — issuer decline reason (e.g. `do_not_honor`)
- `message` — human-readable description (safe to show users for card errors)
- `param` — which parameter caused the error
- `charge` — charge ID for card errors
- `payment_intent` — PaymentIntent object if error involved one
- `doc_url` — link to error docs

---

## Pagination

All list endpoints use **cursor-based pagination** (reverse chronological order).

**Parameters:**
- `limit` — 1–100, default 10
- `starting_after` — object ID to paginate forward (returns objects after this ID)
- `ending_before` — object ID to paginate backward

**Response shape:**
```json
{
  "object": "list",
  "data": [...],
  "has_more": true,
  "url": "/v1/customers"
}
```

Use `has_more` to detect more pages. SDK clients offer auto-pagination helpers.

---

## Idempotency Keys

Prevents duplicate operations on network retries.

```bash
curl https://api.stripe.com/v1/customers \
  -u sk_test_KEY: \
  -H "Idempotency-Key: KG5LxwFBepaKHyUD" \
  -d description="New customer"
```

- Only for `POST` requests (GET/DELETE are idempotent by nature)
- Use V4 UUIDs or random strings (up to 255 chars)
- Keys are cached for 24 hours then pruned
- Same key + same params = cached response returned
- Same key + different params = error

---

## Expanding Responses

By default, related objects return only their ID. Use `expand[]` to inline the full object:

```bash
curl https://api.stripe.com/v1/charges/ch_123 \
  -u sk_test_KEY: \
  -d "expand[]"=customer \
  -d "expand[]"="payment_intent.customer" \
  -G
```

- Supports dot notation for nested expansion: `expand[]=payment_intent.customer`
- Max depth: 4 levels
- On list endpoints prefix with `data.`: `expand[]=data.customer`

---

## Metadata

Attach custom key-value data to most Stripe objects:

```bash
-d "metadata[user_id]"="usr_abc123" \
-d "metadata[order_ref]"="ORD-9999"
```

- Up to 50 keys per object
- Keys: max 40 chars (no square brackets)
- Values: max 500 chars, stored as strings
- Not used by Stripe internally — purely for your own reference

Supported on: Account, Charge, Customer, PaymentIntent, Refund, Subscription, Transfer, Invoice, etc.

---

## Core Objects & Endpoints

### Charges
> Legacy. Use PaymentIntents for new integrations. Represents a single money movement attempt.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/charges` | POST | Create a charge |
| `/v1/charges/:id` | GET | Retrieve |
| `/v1/charges/:id` | POST | Update |
| `/v1/charges` | GET | List all |
| `/v1/charges/:id/capture` | POST | Capture (if capture_method=manual) |
| `/v1/charges/search` | GET | Search |

---

### Payment Intents ⭐ (recommended)
> The modern way to collect payments. One PI per order/session. Tracks the full payment lifecycle.

**Statuses:** `requires_payment_method` → `requires_confirmation` → `requires_action` → `processing` → `succeeded` / `canceled` / `requires_capture`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/payment_intents` | POST | Create |
| `/v1/payment_intents/:id` | POST | Update |
| `/v1/payment_intents/:id` | GET | Retrieve |
| `/v1/payment_intents` | GET | List all |
| `/v1/payment_intents/:id/confirm` | POST | Confirm |
| `/v1/payment_intents/:id/capture` | POST | Capture (manual capture) |
| `/v1/payment_intents/:id/cancel` | POST | Cancel |
| `/v1/payment_intents/:id/increment_authorization` | POST | Increment auth amount |
| `/v1/payment_intents/search` | GET | Search |

**Key create params:**
- `amount` — in smallest currency unit (cents)
- `currency` — ISO 4217 (e.g. `usd`)
- `customer` — Customer ID
- `payment_method` — PaymentMethod ID
- `confirm` — confirm immediately on create
- `capture_method` — `automatic` (default) or `manual`
- `setup_future_usage` — `off_session` | `on_session` to save PM to customer

---

### Setup Intents
> Save payment credentials without charging. Used for future off-session payments or subscription setup.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/setup_intents` | POST | Create |
| `/v1/setup_intents/:id` | POST | Update |
| `/v1/setup_intents/:id` | GET | Retrieve |
| `/v1/setup_intents` | GET | List all |
| `/v1/setup_intents/:id/confirm` | POST | Confirm |
| `/v1/setup_intents/:id/cancel` | POST | Cancel |
| `/v1/setup_intents/:id/verify_microdeposits` | POST | Verify bank |

---

### Customers
> Represents a customer. Used for recurring billing, storing payment methods, and tracking payments.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/customers` | POST | Create |
| `/v1/customers/:id` | POST | Update |
| `/v1/customers/:id` | GET | Retrieve |
| `/v1/customers` | GET | List all |
| `/v1/customers/:id` | DELETE | Delete |
| `/v1/customers/search` | GET | Search |

**Key fields:** `id`, `email`, `name`, `phone`, `address`, `balance`, `currency`, `default_source`, `delinquent`, `invoice_settings`, `metadata`, `subscriptions`

---

### Payment Methods
> Reusable payment instruments (cards, bank accounts, wallets). Attach to customers for future use.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/payment_methods` | POST | Create |
| `/v1/payment_methods/:id` | POST | Update |
| `/v1/payment_methods/:id` | GET | Retrieve |
| `/v1/payment_methods` | GET | List all |
| `/v1/customers/:id/payment_methods` | GET | List customer's PMs |
| `/v1/customers/:id/payment_methods/:id` | GET | Retrieve customer's PM |
| `/v1/payment_methods/:id/attach` | POST | Attach to customer |
| `/v1/payment_methods/:id/detach` | POST | Detach from customer |

**Types:** `card`, `us_bank_account`, `sepa_debit`, `ideal`, `klarna`, `paypal`, `link`, `cashapp`, etc.

---

### Products
> Goods or services you sell. Each product can have multiple Prices.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/products` | POST | Create |
| `/v1/products/:id` | POST | Update |
| `/v1/products/:id` | GET | Retrieve |
| `/v1/products` | GET | List all |
| `/v1/products/:id` | DELETE | Delete |
| `/v1/products/search` | GET | Search |

**Key fields:** `id`, `name`, `description`, `active`, `images`, `metadata`, `type` (`service`/`good`), `unit_label`

---

### Prices
> Define cost, currency, and billing cycle for a Product. Can be one-time or recurring.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/prices` | POST | Create |
| `/v1/prices/:id` | POST | Update (limited — use new price for changes) |
| `/v1/prices/:id` | GET | Retrieve |
| `/v1/prices` | GET | List all |
| `/v1/prices/search` | GET | Search |

**Key fields:** `id`, `product`, `currency`, `unit_amount`, `unit_amount_decimal`, `recurring` (`interval`, `interval_count`, `trial_period_days`), `type` (`one_time`/`recurring`), `active`, `billing_scheme`, `tiers_mode`

**Billing schemes:** `per_unit` | `tiered`

---

### Subscriptions ⭐
> Recurring billing. Stripe handles invoicing, retries, and lifecycle automatically.

**Statuses:** `incomplete` → `incomplete_expired` | `trialing` → `active` → `past_due` → `canceled` | `unpaid` | `paused`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/subscriptions` | POST | Create |
| `/v1/subscriptions/:id` | POST | Update |
| `/v1/subscriptions/:id` | GET | Retrieve |
| `/v1/subscriptions` | GET | List all |
| `/v1/subscriptions/:id` | DELETE | Cancel |
| `/v1/subscriptions/:id/resume` | POST | Resume paused subscription |
| `/v1/subscriptions/:id/migrate` | POST | Migrate to new price |
| `/v1/subscriptions/search` | GET | Search |

**Key create params:**
- `customer` — Customer ID (required)
- `items[0][price]` — Price ID
- `trial_period_days` — free trial days
- `cancel_at_period_end` — cancel gracefully at end of period
- `default_payment_method` — PM for renewals
- `payment_behavior` — `default_incomplete` | `allow_incomplete` | `error_if_incomplete`
- `proration_behavior` — `create_prorations` | `none` | `always_invoice`

---

### Invoices ⭐
> Statements of amounts owed. Generated automatically for subscriptions or created manually.

**Statuses:** `draft` → `open` → `paid` | `void` | `uncollectible`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/invoices` | POST | Create |
| `/v1/invoices/:id` | POST | Update |
| `/v1/invoices/:id` | GET | Retrieve |
| `/v1/invoices` | GET | List all |
| `/v1/invoices/:id` | DELETE | Delete draft |
| `/v1/invoices/:id/finalize` | POST | Finalize (draft → open) |
| `/v1/invoices/:id/pay` | POST | Attempt payment |
| `/v1/invoices/:id/send` | POST | Email to customer |
| `/v1/invoices/:id/void` | POST | Void |
| `/v1/invoices/:id/mark_uncollectible` | POST | Write off |
| `/v1/invoices/create_preview` | POST | Preview upcoming invoice |
| `/v1/invoices/search` | GET | Search |

**Key fields:** `id`, `customer`, `subscription`, `status`, `amount_due`, `amount_paid`, `amount_remaining`, `currency`, `lines`, `payment_intent`, `hosted_invoice_url`, `invoice_pdf`, `due_date`, `period_start`, `period_end`

---

### Refunds
> Refund a previously successful charge. Funds returned to original payment method.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/refunds` | POST | Create |
| `/v1/refunds/:id` | POST | Update |
| `/v1/refunds/:id` | GET | Retrieve |
| `/v1/refunds` | GET | List all |
| `/v1/refunds/:id/cancel` | POST | Cancel pending refund |

**Key params:** `charge` or `payment_intent`, `amount` (partial refund if omitted = full), `reason` (`duplicate`/`fraudulent`/`requested_by_customer`)

---

### Disputes
> Chargebacks raised by customer with their bank. Respond with evidence within the deadline.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/disputes/:id` | GET | Retrieve |
| `/v1/disputes` | GET | List all |
| `/v1/disputes/:id` | POST | Update (submit evidence) |
| `/v1/disputes/:id/close` | POST | Accept/close dispute |

**Statuses:** `warning_needs_response` | `needs_response` | `under_review` | `charge_refunded` | `won` | `lost`

---

### Events (Webhooks)
> Stripe sends Events when objects change state. Configure webhooks in the dashboard or via API.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/events/:id` | GET | Retrieve |
| `/v1/events` | GET | List all (accessible for 30 days) |

**Key webhook event types:**
```
# Payments
payment_intent.succeeded
payment_intent.payment_failed
payment_intent.created
charge.succeeded
charge.failed
charge.refunded
charge.dispute.created
charge.dispute.funds_withdrawn

# Subscriptions / Billing
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
customer.subscription.trial_will_end
invoice.created
invoice.finalized
invoice.payment_succeeded
invoice.payment_failed
invoice.upcoming

# Customers
customer.created
customer.updated
customer.deleted

# Payment methods
payment_method.attached
payment_method.detached
setup_intent.succeeded
```

**Webhook signature verification:**
```javascript
const event = stripe.webhooks.constructEvent(
  req.body,    // raw body buffer
  req.headers['stripe-signature'],
  endpointSecret
);
```

---

### Balance & Payouts

**Balance:** Available and pending funds in your Stripe account.
- `GET /v1/balance` — retrieve current balance
- `GET /v1/balance_transactions` — list all transactions

**Payouts:** Funds sent to your bank account.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/payouts` | POST | Create manual payout |
| `/v1/payouts/:id` | GET | Retrieve |
| `/v1/payouts` | GET | List all |
| `/v1/payouts/:id/cancel` | POST | Cancel |
| `/v1/payouts/:id/reverse` | POST | Reverse |

---

### Coupons & Discounts

**Coupons** — percent-off or amount-off discount objects. Apply to subscriptions, invoices, checkout.
- NOT applicable to one-off charges or PaymentIntents directly.

| Endpoint | Method |
|----------|--------|
| `POST /v1/coupons` | Create |
| `GET /v1/coupons/:id` | Retrieve |
| `POST /v1/coupons/:id` | Update |
| `GET /v1/coupons` | List |
| `DELETE /v1/coupons/:id` | Delete |

**Promotion Codes** — customer-facing redemption codes for coupons.
- `POST /v1/promotion_codes`
- `GET /v1/promotion_codes`

---

## Connect (Platform API)

Connect lets platforms manage payments on behalf of connected accounts (merchants/sellers).

### Account Types
- **Standard** — Stripe manages onboarding, dashboard access
- **Express** — Stripe-hosted onboarding, limited dashboard
- **Custom** — Full control, you own the experience, most responsibility

### Connected Accounts

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/accounts` | POST | Create connected account |
| `/v1/accounts/:id` | GET | Retrieve |
| `/v1/accounts/:id` | POST | Update |
| `/v1/accounts` | GET | List all connected |
| `/v1/accounts/:id` | DELETE | Delete |
| `/v1/accounts/:id/reject` | POST | Reject account |

> ⚠️ New integrations: use Accounts v2 API (`/v2/core/accounts`)

### Transfers — move funds to connected accounts

| Endpoint | Method |
|----------|--------|
| `POST /v1/transfers` | Create transfer |
| `GET /v1/transfers/:id` | Retrieve |
| `GET /v1/transfers` | List all |

### Making requests on behalf of connected accounts

```bash
# Add Stripe-Account header
curl https://api.stripe.com/v1/charges \
  -u sk_test_PLATFORM_KEY: \
  -H "Stripe-Account: acct_CONNECTED_ACCOUNT_ID" \
  -d amount=1000 \
  -d currency=usd
```

### Charge types
- **Direct charges** — charge on connected account directly
- **Destination charges** — charge on platform, transfer portion to connected account
- **Separate charges + transfers** — charge on platform, transfer manually

---

## Billing Subscription Lifecycle

```
1. Create Product + Price
2. Create Customer (with payment method)
3. Create Subscription → triggers invoice creation
4. Invoice auto-finalizes after ~1 hour
5. PaymentIntent created for the invoice
6. Stripe attempts payment
7. On success: subscription becomes `active`, invoice becomes `paid`
8. On failure: retries per smart retries schedule, eventually `past_due` or `canceled`
9. On renewal: new invoice created automatically
```

**Proration:** When upgrading/downgrading mid-period, Stripe calculates prorated credits/charges automatically.

**Trial periods:** `trial_period_days` on subscription or `trial_end` timestamp.

**Cancellation options:**
- Immediately: `cancel_at_period_end=false` + DELETE
- At period end: `cancel_at_period_end=true`
- At specific date: `cancel_at=timestamp`

---

## Key Patterns & Best Practices

### Accepting a one-time payment (PaymentIntents flow)
```
1. Server: Create PaymentIntent → returns client_secret
2. Client: Stripe.js confirmPayment(clientSecret, {payment_method: ...})
3. Handle redirect/3DS if required
4. Server: Listen for payment_intent.succeeded webhook
```

### Saving a card for future use
```
1. Create SetupIntent (or use setup_future_usage on PaymentIntent)
2. Confirm via Stripe.js (handles 3DS/authentication)
3. SetupIntent.succeeded → payment_method attached to customer
4. Future: Create PaymentIntent with customer + payment_method, confirm=true, off_session=true
```

### Subscription with trial
```javascript
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  trial_period_days: 14,
  payment_behavior: 'default_incomplete',
  expand: ['latest_invoice.payment_intent'],
});
```

### Idempotent charge with metadata
```bash
curl https://api.stripe.com/v1/payment_intents \
  -u sk_test_KEY: \
  -H "Idempotency-Key: order_12345_attempt_1" \
  -d amount=2000 \
  -d currency=usd \
  -d customer=cus_abc \
  -d "metadata[order_id]"="12345"
```

### Webhook handler pattern
```javascript
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      // fulfill order
      break;
    case 'invoice.payment_failed':
      // notify customer, retry logic
      break;
    case 'customer.subscription.deleted':
      // revoke access
      break;
  }

  res.json({received: true});
});
```

---

## Radar (Fraud Prevention)

Stripe Radar uses ML to score transactions for fraud risk. Available rules:
- **Block** — decline high-risk payments
- **Review** — flag for manual review
- **Allow** — whitelist trusted customers

Access via Dashboard → Radar. Rules written in a simple domain-specific language:
```
# Block if risk score >= 75
Block if :risk_score: >= 75

# Block cards from certain countries
Block if :card_country: = 'XX'
```

---

## Useful Search Query Syntax

Stripe supports a unified search API for Customers, Charges, PaymentIntents, Invoices, Subscriptions, and Products.

```bash
# Search customers by email
GET /v1/customers/search?query=email:"user@example.com"

# Search charges by metadata
GET /v1/charges/search?query=metadata["order_id"]:"12345"

# Search paid invoices over $100
GET /v1/invoices/search?query=status:"paid" AND amount_due>10000
```

---

## Rate Limits

- **Live mode:** 100 read requests/second, 100 write requests/second per account
- **Test mode:** Same limits
- Response header `Stripe-Ratelimit-Remaining` shows remaining calls
- `429` = rate limited. Retry with exponential backoff.

---

## Source: https://docs.stripe.com/api
## Crawled: 2026-03-30
