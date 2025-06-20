# 🛒 Cart, Payment, and Order Workflow

## 1. User Adds Product to Cart
- **Endpoint:** `POST /api/Cart/add`
- **Controller:** `CartController.addToCart`
- **Action:** Adds or updates an item in the `CartItem` table.

---

## 2. User Views Cart
- **Endpoint:** `GET /api/Cart`
- **Controller:** `CartController.getCart`
- **Action:** Returns cart items, including product information and live stock status.

---

## 3. User Proceeds to Checkout (Apply Coupon & Get Total)
- **Endpoint:** `POST /api/orders/create-payment-intent`
- **Request Body Example:**
    ```json
    {
        "couponCode": "FOOD50"
    }
    ```
- **Controller:** `OrderController.createStripePaymentIntent`
- **Actions:**
    - Validates coupon (if provided).
    - Calculates total price and discount.
    - Creates a Stripe PaymentIntent.
    - Returns the client secret, amount, and discount amount.
        ```json
        {
            "clientSecret": "...",
            "amount": 500,
            "discountAmount": 100
        }
        ```

---

## 4. Frontend: Stripe Payment
- **Action:** Calls `stripe.confirmCardPayment(clientSecret, { ...card details... })`
- **Result:** Stripe returns a `paymentIntent.id` (e.g., `"pi_123456..."`).

---

## 5. Frontend Confirms Order with PaymentIntent ID
- **Endpoint:** `POST /api/orders/confirm`
- **Request Body Example:**
    ```json
    {
        "paymentIntentId": "pi_123456...",
        "deliveryAddress": "123 Street",
        "deliveryType": "Instant",
        "couponCode": "FOOD50",
        "scheduledTime": "...",
        "userInstructions": "Leave at door"
    }
    ```
- **Controller:** `OrderController.confirmStripeOrder`
- **Actions:**
    - Verifies the paymentIntent with Stripe.
    - Recalculates total and discount for security.
    - Creates the Order and OrderItems.
    - Decreases stock in the Product table.
    - Marks the coupon as redeemed.
    - Clears the user's cart.
    - Returns order confirmation.