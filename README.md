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

Go to your [Fungies Dashboard](https://app.fungies.io) → **Developers → API Keys** and copy both your public and secret keys.

You'll get two keys:
- **Public key** (`pub_...`) — required for all requests
- **Secret key** (`sec_...`) — required for write operations (create, update, archive)

### 2. Authenticate

```bash
fungies auth set --public-key pub_your_key_here --secret-key sec_your_key_here
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

### Products

```bash
fungies products list
fungies products get <id>
fungies products create
fungies products update <id> --name "New Name"
fungies products archive <id>
fungies products duplicate <id>
```

### Offers

Offers define how a product can be purchased — price, currency, and billing interval.

```bash
fungies offers list
fungies offers list --product-id <product-id>
fungies offers get <id>
fungies offers create
fungies offers update <id>
fungies offers archive <id>
fungies offers keys add <offer-id> --keys "KEY1,KEY2,KEY3"   # Add license/game keys
fungies offers keys remove <offer-id> <key-id>               # Remove a specific key
```

### Orders

```bash
fungies orders list
fungies orders list --status PAID
fungies orders list --limit 50
fungies orders get <id>
fungies orders cancel <id>
```

### Payments

```bash
fungies payments list
fungies payments list --limit 50
fungies payments get <id>
```

### Subscriptions

```bash
fungies subscriptions list
fungies subscriptions list --status active
fungies subscriptions get <id>
fungies subscriptions cancel <id>
fungies subscriptions pause <id>
fungies subscriptions charge <id> --amount 999 --currency EUR
```

### Discounts

```bash
fungies discounts list
fungies discounts get <id>
fungies discounts create
fungies discounts update <id>
fungies discounts archive <id>
```

### Users

```bash
fungies users list
fungies users list --search user@example.com
fungies users get <id>
fungies users create
fungies users update <id>
fungies users archive <id>
fungies users unarchive <id>
fungies users inventory <id>
```

### Checkout Elements

Checkout Elements are embeddable or hosted checkout experiences you can integrate into your website.

```bash
fungies elements list
fungies elements create
fungies elements open <id>
```

---

## Output Formats

All list commands support a `--format` flag:

```bash
fungies orders list --format table    # Default — human-readable table
fungies orders list --format json     # Raw JSON
fungies orders list --format csv      # CSV for spreadsheets
```

---

## Examples

### Look up a specific order

```bash
fungies orders get 2d448c93-5945-416c-916a-90aef8cea058
```

### Find all paid orders from a date range

```bash
fungies orders list --status PAID --from 2025-01-01 --format table
```

### Export all payments to CSV

```bash
fungies payments list --limit 100 --format csv > payments.csv
```

### Search for a customer by email

```bash
fungies users list --search duke@fungies.io
```

### Check what a customer has purchased

```bash
fungies users inventory <user-id>
```

### List all active subscriptions

```bash
fungies subscriptions list --status active
```

### Export subscriptions as JSON and pipe to jq

```bash
fungies subscriptions list --format json | jq '.items[] | {id, status, userId}'
```

### Add game keys to an offer in bulk

```bash
fungies offers keys add <offer-id> --keys "XXXX-YYYY-ZZZZ,AAAA-BBBB-CCCC"
```

### List all discount codes and their usage

```bash
fungies discounts list --format table
```

### Archive an expired discount

```bash
fungies discounts archive <discount-id>
```

### Check offers for a specific product

```bash
fungies offers list --product-id <product-id>
```

---

## Resources

- **Fungies website:** [fungies.io](https://fungies.io)
- **API documentation:** [docs.fungies.io](https://docs.fungies.io)
- **Dashboard:** [app.fungies.io](https://app.fungies.io)
- **Authentication guide:** [docs.fungies.io/api-reference/authentication](https://docs.fungies.io/api-reference/authentication)

---

## License

MIT
