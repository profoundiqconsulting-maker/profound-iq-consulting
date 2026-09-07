# Paystack Test and Live Keys

## Overview

The Paystack integration supports both test and live modes. Test mode uses Paystack's sandbox environment with test card numbers and does not move real money. Live mode processes real transactions.

## Environment Variables

Set these in `.env`:

```env
# Server-side secret key
PAYSTACK_SECRET_KEY=sk_test_xxxxx

# Client-side public key (exposed via Vite)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
```

## Switching to Live Mode

1. Log in to your Paystack dashboard at https://dashboard.paystack.com
2. Go to **Settings > API Keys & Webhooks**
3. Copy the **Live Secret Key** (`sk_live_...`) and **Live Public Key** (`pk_live_...`)
4. Update `.env`:
   ```env
   PAYSTACK_SECRET_KEY=sk_live_xxxxx
   VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
   ```
5. Restart the server and rebuild the client:
   ```bash
   npm run build
   npm start
   ```

## Webhook URL

Update your Paystack webhook URL in the dashboard to point to your production endpoint:

```
https://your-domain.com/api/paystack/webhook
```

The webhook handler validates the `x-paystack-signature` HMAC-SHA512 header using `PAYSTACK_SECRET_KEY`.

## Test Card Numbers

Use these cards in test mode:

| Card Number         | Expiry          | CVV          | Type       |
| ------------------- | --------------- | ------------ | ---------- |
| 4084084084084081    | Any future date | Any 3 digits | Visa       |
| 5060666666666666666 | Any future date | Any 3 digits | Mastercard |
| 2533336758079359    | Any future date | Any 3 digits | Verve      |

## Inline Modal vs Redirect

The app supports two checkout flows:

- **Inline modal**: `initializeStageInlinePayment` returns an `accessCode` and opens Paystack's inline checkout inside the page. This is the default for assessment, CareerPath, and course stage payments.
- **Redirect**: `initializeStagePayment` returns an `authorizationUrl` and redirects the user to Paystack's hosted checkout page.

Both flows verify payment server-side using the same Paystack verification API.

## Receipt Emails

After successful payment verification (via webhook or browser callback), the server sends a receipt email using the configured `RESEND_API_KEY`. The email includes transaction details and any attached artifacts (PDF reports, coaching visuals, etc.).

## Testing Checklist

- [ ] Use `sk_test_...` and `pk_test_...` keys in `.env`
- [ ] Run `npm test` to verify webhook and payment unit tests pass
- [ ] Complete a test payment using one of the test card numbers above
- [ ] Confirm receipt email is delivered to the configured `EMAIL_FROM` address
- [ ] Check Paystack dashboard > Transactions to see the test transaction
- [ ] Switch to live keys and rebuild before deploying to production

## Security Notes

- Never commit `PAYSTACK_SECRET_KEY` or `VITE_PAYSTACK_PUBLIC_KEY` to version control
- In production, store these values in your hosting provider's secret management system
- The webhook endpoint rejects requests with invalid signatures with a `401 Unauthorized` response
