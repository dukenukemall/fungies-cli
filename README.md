<p align="center">
  <img src="assets/banner.svg" alt="Fungies CLI" width="100%">
</p>

<h1 align="center">Fungies CLI</h1>

<p align="center">
  <a href="https://docs.fungies.io/api-reference/introduction"><img src="https://img.shields.io/badge/Docs-docs.fungies.io-8B5CF6?style=for-the-badge" alt="Documentation"></a>
  <a href="https://fungies.io"><img src="https://img.shields.io/badge/Website-fungies.io-E05A2A?style=for-the-badge" alt="Website"></a>
  <a href="https://discord.gg/yfH5ZyTZH4"><img src="https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://help.fungies.io"><img src="https://img.shields.io/badge/Help%20Center-help.fungies.io-C4399B?style=for-the-badge" alt="Help Center"></a>
  <a href="https://github.com/dukenukemall/fungies-cli/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge" alt="License: MIT"></a>
  <a href="https://www.npmjs.com/package/fungies"><img src="https://img.shields.io/npm/v/fungies?style=for-the-badge&color=CB3837&logo=npm&logoColor=white" alt="npm"></a>
</p>

---

Official command-line interface for the [Fungies](https://fungies.io) API.

## What is Fungies?

[Fungies](https://fungies.io) is a **Merchant of Record** platform built for digital product sellers — game developers, SaaS founders, and indie creators. It handles the entire payment infrastructure for you: checkout, tax calculation, invoicing, subscriptions, refunds, and global compliance — so you can sell digital products without setting up Stripe, dealing with VAT, or incorporating in every country.

With Fungies you can:
- Sell game keys, digital downloads, one-time products, and SaaS subscriptions
- Accept payments globally with automatic tax handling (VAT, GST, sales tax)
- Manage customers, orders, and subscription billing programmatically
- Embed checkout (overlay, hosted, or embedded) directly into your website or app
- Get paid via Stripe, PayPal, crypto/stablecoins, and more

**Full API docs:** [docs.fungies.io](https://docs.fungies.io) · **Help center:** [help.fungies.io](https://help.fungies.io)

---

## What is fungies-cli?

`fungies-cli` lets you manage your entire Fungies store from the terminal. Query orders, manage products and offers, handle subscriptions, export data, and automate workflows — without opening a browser.

Useful for:
- **Support workflows** — look up orders and customers by ID instantly
- **Data exports** — pipe to CSV for spreadsheets or analytics
- **Automation** — shell scripts for bulk key uploads, subscription management
- **Developers** — explore and test the API without writing code

---

## Installation

```bash
npm install -g fungies
```

Or run without installing:

```bash
npx fungies [command]
```

**Requirements:** Node.js 18+

---

## Quick Start

### 1. Get your API keys

Go to your [Fungies Dashboard](https://app.fungies.io/devs/api-keys) → **Developers → API Keys** and generate your keys.

| Key | Prefix | Required for |
|-----|--------|-------------|
| Public Key | `pub_` | All read operations |
| Secret Key | `sec_` | Write operations (create, update, archive) |

### 2. Authenticate

```bash
fungies auth set --public-key pub_your_key_here --secret-key sec_your_key_here
```

Read-only mode (no secret key):

```bash
fungies auth set --public-key pub_your_key_here
```

### 3. Verify the connection

```bash
fungies auth whoami
# ✓ Connected | Public: pub_****abc= | Secret: sec_****xyz=
```

---

## Commands

### Authentication

```bash
fungies auth set --public-key pub_... --secret-key sec_...
fungies auth whoami    # Verify connection
fungies auth clear     # Remove saved keys
```

---

### Products

In Fungies, a **Product** is the top-level item you sell. Products can have multiple **Variants** (configurations — e.g. Standard Edition, Deluxe Edition) and each variant can have multiple **Offers** (prices — e.g. €9.99 one-time, €2.99/month). Prices always live on Offers, never directly on Products or Variants.

**Product types:**
- `OneTimePayment` — standard one-time purchase
- `Subscription` — recurring billing (SaaS, memberships)
- `Membership` — access-based product
- `GameKey` — digital key distribution (Steam keys, etc.)

```bash
fungies products list
fungies products get <id>
fungies products create
fungies products update <id>
fungies products archive <id>       # Soft delete — reversible; also archives associated offers
fungies products duplicate <id>     # Copies product + variants (offers not duplicated)
```

> 📖 Help: [Add Game Keys](https://help.fungies.io/add-game-keys) · [Add Subscription Product](https://help.fungies.io/add-subscription-product) · [Variants](https://help.fungies.io/variants-of-the-product)

---

### Offers

An **Offer** defines exactly how a product can be purchased — price, currency, billing interval, and (for game keys) key inventory. A product must have at least one offer before customers can buy it.

Offer examples:
- `Starter Plan — $19/month`
- `Professional Plan — $299/year`
- `Game Key (Global) — €9.99 one-time`

```bash
fungies offers list
fungies offers list --product-id <product-id>    # Filter by product
fungies offers get <id>
fungies offers create
fungies offers update <id>
fungies offers archive <id>                       # Soft delete — existing subscriptions on this offer continue
```

**Managing license/game keys on an offer:**

```bash
fungies offers keys add <offer-id> --keys "KEY1,KEY2,KEY3"    # Add keys to inventory
fungies offers keys remove <offer-id> <key-id>                # Remove a specific unsold key
```

> **Note:** Keys are automatically assigned to customers at purchase. Only **unsold** keys can be removed — keys already delivered to customers are preserved.

> 📖 Help: [Add Game Keys](https://help.fungies.io/add-game-keys) · [Variants of the Product](https://help.fungies.io/variants-of-the-product)

---

### Orders

An **Order** is created when a customer completes a purchase — one-time buy, free claim, or first subscription payment. Recurring subscription renewal payments are tracked as separate **Payment** objects, not new orders.

```bash
fungies orders list
fungies orders list --status PAID         # PAID | PENDING | CANCELLED | REFUNDED | FAILED
fungies orders list --limit 50
fungies orders list --from 2025-01-01     # Filter by creation date
fungies orders get <id>
fungies orders get <order-number>         # Also accepts the short order number (e.g. 9XMrb9HkzBPcLIaJ)
fungies orders cancel <id>
```

> **Note:** Cancelling an order changes its status to `CANCELLED` but **does not automatically issue a refund**. To refund a paid order, use the [Fungies Dashboard](https://app.fungies.io) or process through your payment provider directly.

> 📖 Help: [Orders APIs](https://help.fungies.io/for-saas-developers/orders-apis) · [Cancel Order](https://help.fungies.io/for-saas-developers/orders-apis/cancel-order)

---

### Payments

A **Payment** represents an individual financial transaction — one-time purchases, subscription renewals, refunds, or extra charges. Each payment includes charge details, invoice info, and the customer who paid.

Payment types you'll see:
- `one_time` — single purchase
- `subscription_initial` — first payment of a new subscription
- `subscription_interval` — recurring subscription renewal
- `subscription_extra` — additional charge on top of subscription (usage-based billing)
- `claim_free` — free product claim

```bash
fungies payments list
fungies payments list --limit 50
fungies payments list --from 2025-01-01
fungies payments get <id>
```

---

### Subscriptions

Fungies handles the full subscription lifecycle: automated billing every interval, transactional emails, invoice generation, and management (pause, cancel, upgrade/downgrade). You can also charge customers extra on top of an existing subscription for usage-based billing (credits, API calls, storage, etc.).

```bash
fungies subscriptions list
fungies subscriptions list --status active    # active | canceled | all
fungies subscriptions get <id>
fungies subscriptions cancel <id>
fungies subscriptions pause <id>              # Pauses payment collection only — access is maintained
fungies subscriptions charge <id> --amount 200 --currency EUR   # Charge €2.00 on top of subscription
```

> **Note on `pause`:** Pausing a subscription stops payment collection but does NOT affect subscription periods or access to the product. The customer retains access while paused.

> **Note on `charge`:** Use this for usage-based billing — charge extra for credits, data, API calls, etc. on top of the customer's existing subscription. A separate invoice is generated for each charge.

> 📖 Help: [Managing Subscriptions via API](https://help.fungies.io/for-saas-developers/managing-subscriptions-through-api) · [Editing & Pausing Subscriptions](https://help.fungies.io/for-saas-developers/editing-and-pausing-subscriptions) · [Additional charges on top of Subscriptions](https://help.fungies.io/additional-charges-on-top-of-subscriptions) · [Upgrade/Downgrade Plans](https://help.fungies.io/upgrading-or-downgrading-plans-with-api)

---

### Discounts

Fungies supports two types of discounts:
- **Coupon codes** — customers enter a code at checkout (e.g. `SUMMER50`)
- **Sale discounts** — automatically applied based on configured conditions

Both support fixed amount and percentage reductions.

```bash
fungies discounts list
fungies discounts list --status active     # active | archived
fungies discounts get <id>
fungies discounts create
fungies discounts update <id>
fungies discounts archive <id>             # Soft delete — reversible
```

---

### Users

Users are the customers who have purchased from your store. The API lets you manage user accounts programmatically — create users, update billing details, look up purchase history, or archive accounts.

```bash
fungies users list
fungies users list --search user@example.com    # Filter by email
fungies users get <id>
fungies users create
fungies users update <id>
fungies users archive <id>                       # Soft delete — reversible
fungies users unarchive <id>                    # Restore archived user
fungies users inventory <id>                    # View all purchases: products, subscriptions, access items
```

> **Note on `users create`:** The email must be unique. If you provide `billingDetails`, ensure `countryCode` is valid and `postalCode` is included for US, CA, UA, and IN.

> 📖 Help: [Managing & Creating Users via API](https://help.fungies.io/for-saas-developers/managing-and-creating-users-through-api)

---

### Webhooks

Fungies sends webhook events to your server for real-time notifications — payments, subscription changes, refunds, and more.

**Supported events:**

| Event | Fires when |
|-------|-----------|
| `payment.success` | Payment successfully processed |
| `payment.refunded` | Payment or partial payment refunded |
| `payment.failed` | Payment attempt fails |
| `subscription.created` | New subscription created |
| `subscription.interval` | Subscription renewed successfully |
| `subscription.updated` | Subscription modified (upgrade/downgrade/pause) |
| `subscription.cancelled` | Subscription cancelled |

```bash
# Start a local webhook listener (like stripe listen)
fungies webhooks listen

# Listen on a custom port and path, with signature verification
fungies webhooks listen --port 3000 --path /webhooks/fungies --secret sec_your_key

# Only show specific events
fungies webhooks listen --filter-event payment.success --filter-event subscription.created

# List all supported event types
fungies webhooks events

# Verify a webhook signature (useful for debugging)
fungies webhooks verify --payload '{"event":"payment.success"}' \
  --signature <sig-from-header> \
  --secret sec_your_key
```

**Setting up local development with webhooks:**

1. Start the listener: `fungies webhooks listen --secret sec_your_key`
2. Expose it publicly: `ngrok http 4242`
3. Copy the ngrok HTTPS URL → paste into [Fungies Dashboard → Developers → Webhooks](https://app.fungies.io/devs/webhooks)
4. Events appear in your terminal as they fire

> 📖 Help: [Using Webhooks](https://help.fungies.io/for-saas-developers/using-webhooks) · [Webhook Event Types](https://help.fungies.io/for-saas-developers/types-of-webhooks)

---

### Checkout Elements

**Checkout Elements** are embeddable or hosted checkout experiences you can integrate into your website or app. They handle the full checkout flow: payment collection, tax calculation, and order creation. There are three types:

- **Overlay Checkout** — pop-up buy button you embed anywhere on a page
- **Hosted Checkout** — standalone checkout page hosted by Fungies
- **Embedded Checkout** — checkout embedded directly inside your app

```bash
fungies elements list
fungies elements create
fungies elements open <id>
```

> 📖 Help: [Overlay Checkout](https://help.fungies.io/getting-paid/checkout-choice/overlay-checkout) · [Hosted Checkout](https://help.fungies.io/getting-paid/checkout-choice/hosted-checkout) · [Embedded Checkout](https://help.fungies.io/getting-paid/checkout-choice/embedded-checkout)

---

## Output Formats

All list commands support `--format`:

```bash
fungies orders list --format table    # Default — human-readable table
fungies orders list --format json     # Raw JSON
fungies orders list --format csv      # CSV for spreadsheets
```

---

## Examples

### Look up an order by ID or order number

```bash
fungies orders get 2d448c93-5945-416c-916a-90aef8cea058
fungies orders get 9XMrb9HkzBPcLIaJ
```

### List all paid orders

```bash
fungies orders list --status PAID --limit 100
```

### Export all payments to CSV

```bash
fungies payments list --limit 100 --format csv > payments.csv
```

### Find a customer by email

```bash
fungies users list --search duke@fungies.io
```

### View everything a customer has purchased

```bash
fungies users inventory <user-id>
```

### List active subscriptions

```bash
fungies subscriptions list --status active
```

### Export subscriptions as JSON and filter with jq

```bash
fungies subscriptions list --format json | jq '.items[] | {id, status, userId}'
```

### Charge a customer extra on top of their subscription (usage billing)

```bash
# Charge €2.00 for API overage
fungies subscriptions charge <subscription-id> --amount 200 --currency EUR
```

### Add game keys to an offer in bulk

```bash
fungies offers keys add <offer-id> --keys "XXXX-YYYY-ZZZZ,AAAA-BBBB-CCCC"
```

### Check all offers for a specific product

```bash
fungies offers list --product-id <product-id>
```

### List all discount codes with usage stats

```bash
fungies discounts list --format table
```

### Archive an expired discount

```bash
fungies discounts archive <discount-id>
```

---

## Resources

- **Fungies website:** [fungies.io](https://fungies.io)
- **API documentation:** [docs.fungies.io](https://docs.fungies.io)
- **Help center:** [help.fungies.io](https://help.fungies.io)
- **Dashboard:** [app.fungies.io](https://app.fungies.io)
- **Getting started with the API:** [help.fungies.io/for-saas-developers/getting-started-with-the-api](https://help.fungies.io/for-saas-developers/getting-started-with-the-api)

---

## License

MIT
