# TechStore Backend — Complete MERN E-Commerce API

> Node.js · Express 4 · MongoDB · Mongoose · JWT · Stripe · Cloudinary / Local Storage

Full backend REST API for the TechStore MERN e-commerce project.
Built phase by phase — all 7 phases complete.

---

## Quick Start

```bash
# 1. Unzip and enter project
unzip techstore-backend-phase7.zip
cd techstore-backend

# 2. Copy env and fill in your values
cp .env.example .env

# 3. Install dependencies
yarn install

# 4. Seed the database
yarn seed

# 5. Start dev server
yarn dev
# → http://localhost:8000
```

---

## Environment Variables

```bash
# Server
NODE_ENV=development
PORT=8000
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb://127.0.0.1:27017/techstore

# Auth
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=7d
COOKIE_EXPIRE_DAYS=7

# Image Storage — change ONE line to switch
IMAGE_STORAGE=local        # dev  → saves to /uploads/
IMAGE_STORAGE=cloudinary   # prod → saves to Cloudinary CDN

# Cloudinary (required when IMAGE_STORAGE=cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx

# Seeder
ADMIN_NAME=Admin User
[email protected]
ADMIN_PASSWORD=Admin@12345
```

---

## Scripts

```bash
yarn dev           # start dev server with nodemon
yarn start         # start production server
yarn seed          # seed DB (users + categories + products)
yarn seed:destroy  # wipe all seeded data
```

---

## Project Structure

```
src/
├── config/
│   ├── db.js                     # MongoDB connection
│   ├── cloudinary.js             # Cloudinary SDK (unused directly)
│   └── stripe.js                 # Stripe SDK init
│
├── models/
│   ├── User.model.js             # User + addresses schema
│   ├── Product.model.js          # Product + images + specs
│   ├── Category.model.js         # Category with parent support
│   ├── Cart.model.js             # Cart + items + coupon
│   ├── Coupon.model.js           # Coupon with validate() method
│   ├── Wishlist.model.js         # Wishlist product references
│   ├── Review.model.js           # Review + auto rating recalc
│   └── Order.model.js            # Order + payment + shipping
│
├── controllers/
│   ├── auth.controller.js        # register, login, logout, me
│   ├── user.controller.js        # profile, addresses
│   ├── product.controller.js     # CRUD + search + filter
│   ├── category.controller.js    # CRUD + image upload
│   ├── cart.controller.js        # cart + coupon
│   ├── wishlist.controller.js    # wishlist toggle
│   ├── review.controller.js      # create/update/delete review
│   ├── order.controller.js       # create order, my orders
│   ├── payment.controller.js     # Stripe intent + webhook
│   └── admin/
│       ├── adminDashboard.controller.js  # stats + charts
│       ├── adminOrder.controller.js      # all orders + status
│       ├── adminProduct.controller.js    # all products + stock
│       ├── adminUser.controller.js       # all users + role
│       └── adminCoupon.controller.js     # coupon CRUD
│
├── routes/
│   ├── index.js                  # mounts all routers
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── product.routes.js
│   ├── category.routes.js
│   ├── cart.routes.js
│   ├── wishlist.routes.js
│   ├── review.routes.js
│   ├── order.routes.js
│   ├── payment.routes.js
│   └── admin.routes.js
│
├── middleware/
│   ├── auth.middleware.js         # protect + authorize(role)
│   ├── error.middleware.js        # centralized error handler
│   ├── notFound.middleware.js     # 404 handler
│   ├── upload.middleware.js       # storage switcher (local/cloudinary)
│   ├── upload.local.js            # multer disk storage
│   ├── upload.cloudinary.js       # multer memory + Cloudinary
│   ├── validate.middleware.js     # express-validator result handler
│   └── rateLimiter.middleware.js  # auth + api + payment limiters
│
├── validators/
│   ├── auth.validator.js
│   ├── product.validator.js
│   ├── cart.validator.js
│   ├── order.validator.js
│   └── review.validator.js
│
├── utils/
│   ├── asyncHandler.js           # wraps async controllers
│   ├── ApiError.js               # custom error class
│   ├── ApiResponse.js            # standard success response
│   ├── generateToken.js          # JWT + httpOnly cookie
│   └── calculateOrderTotals.js   # items + shipping + tax + discount
│
├── seeder/
│   └── seed.js                   # 2 users + 6 categories + 12 products
│
├── app.js                        # Express app + middleware stack
└── server.js                     # HTTP server bootstrap
```

---

## Complete API Reference

### Auth — `/api/v1/auth`
| Method | Endpoint     | Access  | Description |
|--------|--------------|---------|-------------|
| POST   | /register    | Public  | Create account |
| POST   | /login       | Public  | Login + set cookie |
| POST   | /logout      | Private | Clear auth cookie |
| GET    | /me          | Private | Get current user |

### Users — `/api/v1/users`
| Method | Endpoint                    | Access  | Description |
|--------|-----------------------------|---------|-------------|
| PATCH  | /profile                    | Private | Update name/avatar |
| GET    | /addresses                  | Private | Get saved addresses |
| POST   | /addresses                  | Private | Add address (max 5) |
| PATCH  | /addresses/:addressId       | Private | Update address |
| DELETE | /addresses/:addressId       | Private | Delete address |

### Products — `/api/v1/products`
| Method | Endpoint     | Access  | Description |
|--------|--------------|---------|-------------|
| GET    | /            | Public  | Paginated + filtered list |
| GET    | /featured    | Public  | Featured products |
| GET    | /:id         | Public  | Single product (id or slug) |
| POST   | /            | Admin   | Create product (up to 5 images) |
| PUT    | /:id         | Admin   | Update product |
| DELETE | /:id         | Admin   | Delete product + images |

### Categories — `/api/v1/categories`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET    | /        | Public | All categories |
| GET    | /:id     | Public | Single category |
| POST   | /        | Admin  | Create category |
| PUT    | /:id     | Admin  | Update category |
| DELETE | /:id     | Admin  | Delete category |

### Cart — `/api/v1/cart`
| Method | Endpoint          | Access  | Description |
|--------|-------------------|---------|-------------|
| GET    | /                 | Private | Get cart with totals |
| DELETE | /                 | Private | Clear cart |
| POST   | /items            | Private | Add item |
| PATCH  | /items/:itemId    | Private | Update quantity |
| DELETE | /items/:itemId    | Private | Remove item |
| POST   | /apply-coupon     | Private | Apply coupon code |
| DELETE | /coupon           | Private | Remove coupon |

### Wishlist — `/api/v1/wishlist`
| Method | Endpoint       | Access  | Description |
|--------|----------------|---------|-------------|
| GET    | /              | Private | Get wishlist |
| POST   | /:productId    | Private | Add to wishlist |
| DELETE | /:productId    | Private | Remove from wishlist |

### Reviews — `/api/v1/products/:productId/reviews`
| Method | Endpoint     | Access  | Description |
|--------|--------------|---------|-------------|
| GET    | /            | Public  | Get all reviews |
| POST   | /            | Private | Create or update review |
| DELETE | /:reviewId   | Private | Delete review (owner/admin) |

### Orders — `/api/v1/orders`
| Method | Endpoint | Access  | Description |
|--------|----------|---------|-------------|
| POST   | /        | Private | Create order from cart |
| GET    | /my      | Private | My order history |
| GET    | /:id     | Private | Single order (owner/admin) |

### Payments — `/api/v1/payments`
| Method | Endpoint                 | Access         | Description |
|--------|--------------------------|----------------|-------------|
| POST   | /create-payment-intent   | Private        | Create Stripe PaymentIntent |
| POST   | /webhook                 | Stripe-signed  | Handle payment events |

### Admin — `/api/v1/admin`
| Method | Endpoint                  | Access | Description |
|--------|---------------------------|--------|-------------|
| GET    | /dashboard/stats          | Admin  | Revenue + charts + top products |
| GET    | /orders                   | Admin  | All orders (paginated + filtered) |
| PATCH  | /orders/:id/status        | Admin  | Update order status |
| GET    | /products                 | Admin  | All products (incl. out of stock) |
| GET    | /users                    | Admin  | All users |
| PATCH  | /users/:id/role           | Admin  | Promote/demote user |
| GET    | /coupons                  | Admin  | All coupons |
| POST   | /coupons                  | Admin  | Create coupon |
| PATCH  | /coupons/:id              | Admin  | Update coupon |
| DELETE | /coupons/:id              | Admin  | Delete coupon |

---

## Standard Response Shape

```json
// Success
{
  "success": true,
  "statusCode": 200,
  "message": "Products fetched",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Product not found",
  "stack": "...only in development"
}
```

---

## Seeded Accounts

| Role     | Email              | Password     |
|----------|--------------------|--------------|
| admin    | [email protected]  | Admin@12345  |
| customer | [email protected] | Customer@123 |

---

## Frontend Integration (RTK Query)

In `baseApi.js`:
```js
fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL, // http://localhost:8000/api/v1
  credentials: "include",                      // sends httpOnly cookie
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
})
```

---

## Order Total Calculation

```
itemsPrice    = sum(price × qty)
shippingPrice = $0 if itemsPrice >= $100, else $10
taxPrice      = 15% of itemsPrice
discount      = coupon discount amount
totalPrice    = itemsPrice + shippingPrice + taxPrice - discount
```

---

## Rate Limiting

| Route            | Limit              |
|------------------|--------------------|
| POST /auth/*     | 10 req / 15 min    |
| POST /payments/* | 20 req / 1 hour    |
| All /api/*       | 300 req / 15 min   |

---

## Deployment on Vercel

```bash
# .env on Vercel
NODE_ENV=production
IMAGE_STORAGE=cloudinary   # ← required on Vercel (no persistent filesystem)
MONGO_URI=mongodb+srv://...  # MongoDB Atlas connection string
CLIENT_URL=https://your-frontend.vercel.app
```

Vercel does not have a persistent filesystem — always use
`IMAGE_STORAGE=cloudinary` in production.
