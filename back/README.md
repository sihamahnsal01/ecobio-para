# Eco&Bio - para / Backend

Node.js + Express + Mongoose REST API for the storefront.

## Setup

```bash
cd kend
npm install
cp .env.example .env
# edit .env — set MONGO_URI, JWT_SECRET, CLIENT_ORIGIN

npm run seed   # populate sample products (optional, but recommended)
npm run dev    # starts on http://localhost:5000 with nodemon
```

## Project structure
```
backend/
  config/db.js            MongoDB connection
  models/                 Mongoose schemas (User, Product, Order, ContactMessage)
  controllers/             Route handler logic
  routes/                  Express routers, mounted in server.js
  middleware/
    auth.js                protect (JWT check) + adminOnly
    errorHandler.js         notFound + centralized error formatting
  utils/
    asyncHandler.js         wraps async controllers so errors reach errorHandler
    generateToken.js        signs JWTs
    seed.js                 npm run seed — populates sample products
  server.js                app entry point
```

## API reference

All routes are prefixed with `/api`.

### Auth — `/api/auth`
| Method | Route      | Access  | Body                              |
|--------|------------|---------|------------------------------------|
| POST   | /register  | Public  | `{ name, email, password, phone }` |
| POST   | /login     | Public  | `{ email, password }`              |
| GET    | /me        | Private | —                                   |

Successful register/login returns `{ _id, name, email, role, token }`.
Send the token on subsequent requests: `Authorization: Bearer <token>`.

### Products — `/api/products`
| Method | Route | Access       | Notes |
|--------|-------|--------------|-------|
| GET    | /     | Public       | Query params: `category`, `maxPrice`, `tag`, `sort` (`price_asc`/`price_desc`/`top_rated`), `search` |
| GET    | /:id  | Public       | |
| POST   | /     | Admin only   | Create product |
| PUT    | /:id  | Admin only   | Update product |
| DELETE | /:id  | Admin only   | Delete product |

This maps directly onto the filters in `Products.jsx` (category sidebar,
price slider, product-type pills, sort dropdown) — swap the mock
`PRODUCTS` array in that component for a `fetch('/api/products?...')` call.

### Orders — `/api/orders`
| Method | Route        | Access     | Notes |
|--------|--------------|------------|-------|
| POST   | /            | Private    | `{ items: [{ productId, qty }], shippingAddress }` — prices are re-fetched server-side, never trusted from the client |
| GET    | /my          | Private    | Current user's orders |
| GET    | /:id         | Private    | Owner or admin only |
| GET    | /            | Admin only | All orders |
| PUT    | /:id/status  | Admin only | `{ status }` — one of `pending, paid, shipped, delivered, cancelled` |

Free delivery threshold and fee live in `orderController.js`
(`FREE_DELIVERY_THRESHOLD`, `DELIVERY_FEE`) — matches the same
`DH50` / `DH4.99` numbers used in `CartPanel.jsx`. Keep them in sync,
or better: have the frontend fetch these from a `/api/settings`
endpoint instead of hardcoding them in two places.

### Contact — `/api/contact`
| Method | Route        | Access     | Body |
|--------|--------------|------------|------|
| POST   | /            | Public     | `{ name, email, phone, subject, message }` — matches `Contact.jsx`'s form fields exactly |
| GET    | /            | Admin only | List all submissions |
| PUT    | /:id/status  | Admin only | `{ status }` — `new, in_progress, resolved` |

## Connecting the frontend

In your React app, set an API base URL (e.g. via Vite env var
`VITE_API_URL=http://localhost:5000/api`) and replace:

- The mock `PRODUCTS` array in `Products.jsx` with a `fetch`/`axios`
  call to `GET /api/products`.
- `CartContext.jsx`'s checkout flow with `POST /api/orders`, sending
  the current `cartItems` mapped to `{ productId, qty }`.
- `Contact.jsx`'s `handleSubmit` with `POST /api/contact`.

## Security notes

- Passwords are hashed with bcrypt before saving (`User.js` pre-save hook) — never stored in plaintext.
- JWTs expire based on `JWT_EXPIRES_IN` in `.env` (default 7 days).
- Order totals are always recalculated server-side from the database,
  never taken from the client request body, so a tampered cart total
  can't be submitted.
- `.env` is git-ignored — never commit real secrets. Rotate
  `JWT_SECRET` if it's ever exposed.
