# fungies-cli

Official command-line interface for the [Fungies](https://fungies.io) API.

## What is Fungies?

[Fungies](https://fungies.io) is a **Merchant of Record** platform built for digital product sellers — game developers, SaaS founders, and indie creators. It handles the entire payment infrastructure for you: checkout, tax calculation, invoicing, subscriptions, refunds, and global compliance — so you can sell digital products without setting up Stripe, dealing with VAT, or incorporating in every country.

With Fungies you can:
- Sell one-time digital products, game keys, and subscriptions
- Accept payments globally with automatic tax handling
- Manage customers, orders, and subscription billing
- Embed checkout flows directly into your website or app

**Full API docs:** [docs.fungies.io](https://docs.fungies.io)

---

## What is fungies-cli?

`fungies-cli` lets you manage your entire Fungies store from the terminal. Query orders, manage products and offers, handle subscriptions, export data, and automate workflows — without opening a browser.

Useful for:
- **Support workflows** — look up orders and customers by ID instantly
- **Data exports** — pipe to CSV for spreadsheets or analytics
- **Automation** — shell scripts for bulk operations
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

You'll get two types:

| Key | Prefix | Required for |
|-----|--------|-------------|
| Public Key | `pub_` | All API requests (read) |
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
fungies auth set --public-key pub_... --secret-key sec_...   # Save API keys
fungies auth whoami                                           # Verify connection
fungies auth clear                                            # Remove saved keys
```

---

### Products

Products are the core items available for sale. Each product can have multiple variants (configurations) and offers (pricing options).

**Product types:** `OneTimePayment` · `Subscription` · `Membership` · `GameKey`

```bash
fungies products list
fungies products get <id>
fungies products create
fungies products update <id>
fungies products archive <id>       # Soft delete — reversible
fungies products duplicate <id>     # Copies product + variants (offers not duplicated)
```

> **Note:** Products also support variants and plans (subscription tiers). See [docs.fungies.io](https://docs.fungies.io/api-reference/products/add-a-variant-to-a-product.md) for full details.

---

### Offers

Offers define how a product is purchased — price, currency, billing interval, and key inventory.

```bash
fungies offers list
fungies offers list --product-id <product-id>
fungies offers get <id>
fungies offers create
fungies offers update <id>
fungies offers archive <id>          # Soft delete — existing subscriptions continue
```

**Managing license/game keys:**

```bash
fungies offers keys add <offer-id> --keys "KEY1,KEY2,KEY3"   # Add keys to inventory
fungies offers keys remove <offer-id> <key-id>               # Remove a specific unsold key
```

> **Note:** Only **unsold** keys can be removed. Keys already assigned to customers are preserved for record-keeping.

---

### Orders

Orders represent customer purchases — one-time buys, subscription initiations, and free claims. Subscription renewal payments appear as separate **Payment** objects, not orders.

```bash
fungies orders list
fungies orders list --status PAID         # PAID | PENDING | CANCELLED | REFUNDED
fungies orders list --limit 50
fungies orders list --from 2025-01-01     # Filter by creation date
fungies orders get <id>
fungies orders get <order-number>         # Also accepts order number (e.g. 9XMrb9HkzBPcLIaJ)
fungies orders cancel <id>
```

> **Note:** Cancelling an order changes its status to `CANCELLED` but **does not automatically process a refund**. To refund a paid order, use the dashboard or your payment provider directly.

---

### Payments

Payments represent individual transactions — one-time purchases, subscription renewals, and refunds.

```bash
fungies payments list
fungies payments list --limit 50
fungies payments list --from 2025-01-01
fungies payments get <id>
```

---

### Subscriptions

```bash
fungies subscriptions list
fungies subscriptions list --status active    # active | canceled | paused | past_due
fungies subscriptions get <id>
fungies subscriptions cancel <id>
fungies subscriptions pause <id>             # Pauses billing; access is maintained
fungies subscriptions charge <id> --amount 999 --currency EUR   # Extra charge in cents
```

> **Note:** Creating a subscription requires the user to have a valid payment provider customer ID already set on their account.

---

### Discounts

Discounts come in two types:
- **Coupon codes** — customers enter a code at checkout
- **Sale discounts** — automatically applied based on conditions

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

```bash
fungies users list
fungies users list --search user@example.com
fungies users get <id>
fungies users create
fungies users update <id>
fungies users archive <id>                 # Soft delete — reversible
fungies users unarchive <id>              # Restore an archived user
fungies users inventory <id>             # View all purchased items for this user
```

---

### Checkout Elements

Checkout Elements are embeddable or hosted checkout experiences you can integrate into your website. They handle the full checkout flow including payment, tax calculation, and order creation.

```bash
fungies elements list
fungies elements create
fungies elements open <id>
```

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

### Look up a specific order by ID or number

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

### See everything a customer has purchased

```bash
fungies users inventory <user-id>
```

### List all active subscriptions

```bash
fungies subscriptions list --status active
```

### Export subscriptions as JSON and filter with jq

```bash
fungies subscriptions list --format json | jq '.items[] | {id, status, userId}'
```

### Add game keys to an offer

```bash
fungies offers keys add <offer-id> --keys "XXXX-YYYY-ZZZZ,AAAA-BBBB-CCCC"
```

### List all discount codes with usage stats

```bash
fungies discounts list --format table
```

### Archive an expired discount

```bash
fungies discounts archive <discount-id>
```

### Check all offers for a specific product

```bash
fungies offers list --product-id <product-id>
```

---

## Resources

- **Fungies website:** [fungies.io](https://fungies.io)
- **API documentation:** [docs.fungies.io](https://docs.fungies.io)
- **Dashboard:** [app.fungies.io](https://app.fungies.io)
- **Authentication:** [docs.fungies.io/api-reference/authentication](https://docs.fungies.io/api-reference/authentication.md)

---

## License

MIT
