# Getting Started with Fungies CLI

The Fungies CLI lets you manage your entire store from the terminal — query orders, look up customers, manage subscriptions, export data, and automate workflows without opening the dashboard.

---

## Requirements

- **Node.js 18 or higher** — [download here](https://nodejs.org)
- A Fungies account — [register here](https://app.fungies.io/register)

---

## Step 1 — Install the CLI

Open your terminal and run:

```bash
npm install -g fungies
```

Verify the installation:

```bash
fungies --version
```

You should see something like `fungies/0.4.2 ...`

---

## Step 2 — Get your API Keys

Go to your [Fungies Dashboard](https://app.fungies.io/devs/api-keys) → **Developers → API Keys** and generate your keys.

You'll get two types:

| Key | Prefix | Used for |
|-----|--------|----------|
| **Public Key** | `pub_...` | All read operations (list, get) |
| **Secret Key** | `sec_...` | Write operations (create, update, archive) |

> ⚠️ Keep your Secret Key private. Never share it or commit it to version control.

---

## Step 3 — Authenticate

Run the following command and paste in your keys:

```bash
fungies auth set --public-key pub_YOUR_KEY_HERE --secret-key sec_YOUR_KEY_HERE
```

If you only need read access (no writes), you can omit the secret key:

```bash
fungies auth set --public-key pub_YOUR_KEY_HERE
```

### First-run wizard

If this is your first time running any CLI command, you'll be guided through setup automatically:

```
  Welcome to Fungies CLI! 🍄
  Let's get you connected to your store.

  Get your API keys at: https://app.fungies.io/devs/api-keys

┌  Quick Setup
│
◆  Public Key
│  pub_...
│
◆  Secret Key (press Enter to skip)
│  sec_...
│
└  ✓ Connected! Run `fungies auth whoami` to verify
```

---

## Step 4 — Verify the connection

```bash
fungies auth whoami
```

Expected output:

```
✓ Connected | Public: pub_****abc= | Secret: sec_****xyz=
```

---

## Your first commands

### List your orders

```bash
fungies orders list
```

### List your payments

```bash
fungies payments list
```

### Find a customer by email

```bash
fungies users list --search customer@example.com
```

### View a customer's purchase history

```bash
fungies users inventory <user-id>
```

### List active subscriptions

```bash
fungies subscriptions list --status active
```

### List discount codes

```bash
fungies discounts list
```

---

## Output formats

All list commands support the `--format` flag for different output types:

```bash
fungies orders list --format table    # Default — human-readable table
fungies orders list --format json     # Raw JSON output
fungies orders list --format csv      # CSV — pipe to a file for export
```

**Export example:**

```bash
fungies payments list --limit 100 --format csv > payments.csv
```

---

## Available commands

| Area | Commands |
|------|----------|
| **Auth** | `auth set`, `auth whoami`, `auth clear` |
| **Orders** | `orders list`, `orders get`, `orders cancel` |
| **Payments** | `payments list`, `payments get` |
| **Products** | `products list`, `products get`, `products create`, `products update`, `products archive`, `products duplicate` |
| **Offers** | `offers list`, `offers get`, `offers create`, `offers update`, `offers archive`, `offers keys add`, `offers keys remove` |
| **Subscriptions** | `subscriptions list`, `subscriptions get`, `subscriptions cancel`, `subscriptions pause`, `subscriptions charge` |
| **Discounts** | `discounts list`, `discounts get`, `discounts create`, `discounts update`, `discounts archive` |
| **Users** | `users list`, `users get`, `users create`, `users update`, `users archive`, `users unarchive`, `users inventory` |
| **Elements** | `elements list`, `elements create`, `elements open` |

Run `fungies --help` to see all commands, or `fungies <command> --help` for details on a specific one.

---

## Managing keys

### Update your keys

```bash
fungies auth set --public-key pub_NEW_KEY --secret-key sec_NEW_KEY
```

### Remove saved keys

```bash
fungies auth clear
```

---

## Troubleshooting

### `Not authenticated` error

Your keys aren't saved. Run:

```bash
fungies auth set --public-key pub_... --secret-key sec_...
```

### `Authentication failed`

Double-check your keys in the [dashboard](https://app.fungies.io/devs/api-keys). Make sure you're using the correct prefix (`pub_` for public, `sec_` for secret).

### `command not found: fungies`

Node.js global bin isn't in your PATH. Try:

```bash
npx fungies --version
```

Or reinstall with:

```bash
npm install -g fungies
```

---

## Need help?

- 📖 **API Reference:** [docs.fungies.io](https://docs.fungies.io/api-reference/introduction)
- 💬 **Discord:** [discord.gg/yfH5ZyTZH4](https://discord.gg/yfH5ZyTZH4)
- 🛠️ **Issues:** [github.com/dukenukemall/fungies-cli](https://github.com/dukenukemall/fungies-cli)
