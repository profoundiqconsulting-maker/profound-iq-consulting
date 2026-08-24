# Payment reconciliation notes

Paystack officially supports webhook delivery for payment events. Incoming events include the `x-paystack-signature` header, which is an HMAC-SHA512 signature of the raw event payload using the Paystack secret key. The signature must be validated before processing the payload. Paystack expects a `200 OK`; otherwise webhook deliveries are retried for up to 72 hours in live mode.

Paystack documents `charge.success` as the successful-payment webhook event. The verification API remains the server-side source for checking a reference and includes transaction status, amount, currency, and reference fields. Paystack notes that webhooks are currently sent only for successful transactions, so failed, abandoned, pending, and reversed states must be represented from initialization/verification outcomes and admin reconciliation actions rather than expecting a failure webhook.

Implementation implications: preserve the raw request body for signature verification; make event processing idempotent by unique event ID/reference; validate stage amount, currency, reference, and enrollment ownership before granting access; and keep a durable event/status history for admin review. Official sources: https://paystack.com/docs/payments/webhooks/ and https://paystack.com/docs/payments/verify-payments/.
