# Checkout (sample)

- `checkout-api` owns cart and order placement.
- Depends on `inventory-service` for reservations and `payments-api` for capture.
- Gateway routes live in `edge-gateway-config`.
