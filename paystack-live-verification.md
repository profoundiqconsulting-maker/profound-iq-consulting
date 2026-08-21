# Paystack Live Verification

The Paystack integration initializes KES 200 transactions with the callback pattern:

`{published-origin}/assessment?payment=success&reference={paystack-reference}`

The server verifies the returned reference against Paystack, confirms `success` status, KES 200 amount, and KES currency, then persists the report and unlocks it. The webhook endpoint is `/api/paystack/webhook` and validates Paystack’s HMAC signature before idempotently marking a pending attempt as paid.

The site owner confirmed in chat that Paystack was verified on the published domain and is working perfectly. This confirmation is recorded as the live verification result for the published checkout and report flow.
