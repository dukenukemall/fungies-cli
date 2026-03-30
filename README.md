# Fungies CLI

Official command-line interface for the [Fungies](https://fungies.io) Merchant of Record API.
Manage products, orders, subscriptions, users, discounts, and more — directly from your terminal.

## Installation

```bash
npm install -g fungies
```

Or use without installing:

```bash
npx fungies [command]
```

## Requirements

- Node.js 18+

## Quick Start

### 1. Get your API key

Go to your [Fungies Dashboard](https://app.fungies.io) → Settings → API Keys and copy your secret key.

### 2. Authenticate

```bash
fungies auth set --key sk_your_secret_key_here
```

### 3. Verify connection

```bash
fungies auth whoami
```

## Commands

### Authentication

```bash
fungies auth set --key <key>     # Save API key
fungies auth whoami              # Verify connection
fungies auth clear               # Remove saved key
```

### Products

```bash
fungies products list
fungies products list --type Subscription
fungies products get <id>
fungies products create
fungies products update <id> --name "New Name"
fungies products archive <id>
fungies products duplicate <id>
```

### Offers

```bash
fungies offers list [--product-id <id>]
fungies offers get <id>
fungies offers create
fungies offers archive <id>
fungies offers keys add <offer-id> --keys "KEY1,KEY2"
fungies offers keys add <offer-id> --file ./keys.txt
```

### Orders

```bash
fungies orders list [--status paid|pending|cancelled]
fungies orders get <id>
fungies orders cancel <id>
```

### Payments

```bash
fungies payments list [--limit 20]
fungies payments get <id>
```

### Subscriptions

```bash
fungies subscriptions list [--status active|cancelled|paused]
fungies subscriptions get <id>
fungies subscriptions cancel <id>
fungies subscriptions pause <id>
fungies subscriptions charge <id> --amount 999 --currency USD
```

### Discounts

```bash
fungies discounts list [--active]
fungies discounts get <id>
fungies discounts create
fungies discounts archive <id>
```

### Users

```bash
fungies users list [--search email@example.com]
fungies users get <id>
fungies users create
fungies users archive <id>
fungies users inventory <id>
```

### Checkout Elements

```bash
fungies elements list
fungies elements create
fungies elements open <id>
```

## Output Formats

All commands support `--format` flag:

```bash
fungies products list --format json    # JSON output
fungies products list --format csv     # CSV export
fungies products list --format table   # Human-readable table (default)
```

## Options

```
--api-key <key>    Override stored key for this command
--no-color         Disable colored output
--help             Show help
--version          Show version
```

## Examples

Export all active subscriptions to CSV:

```bash
fungies subscriptions list --status active --format csv > subscriptions.csv
```

Get order as JSON and pipe to jq:

```bash
fungies orders get ord_123 --format json | jq ".total"
```

Bulk add license keys from file:

```bash
fungies offers keys add off_abc --file ./license-keys.txt
```

## License

MIT
