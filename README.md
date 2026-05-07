# FrozenDelights 🍦

**Premium Ice Cream E-Commerce Platform**

An internship project at **Brainlybeans PVT. LTD** by **Raj Patel** (2026 Winter Internship)

---

## Overview

FrozenDelights is a full-stack e-commerce platform specialized in ice cream products. It provides a seamless shopping experience with real-time inventory management, secure payments, and an intuitive admin dashboard for business operations.

### Key Highlights

- 🛍️ **Product Browsing**: Explore 120+ ice cream products with multi-image galleries
- 🛒 **Shopping Cart**: Add items, manage quantities, and checkout securely
- 💳 **Razorpay Integration**: Secure payment processing with webhook reconciliation
- 👤 **User Authentication**: Email/password and Google OAuth authentication
- 📧 **Email Notifications**: Order confirmations, alerts, and password resets via Gmail SMTP
- 🖼️ **Image Management**: Cloudinary integration for optimized image storage and delivery
- 📊 **Admin Dashboard**: Analytics, order management, and product inventory control
- 🔐 **Role-Based Access**: Customer, Admin, and Guest role management
- ⚡ **Real-Time Updates**: Server-Sent Events (SSE) for live notifications
- 📱 **Responsive Design**: Mobile-first UI with React Bootstrap
- 🎨 **Theme Support**: Light and dark mode toggle with persistent preferences
- 🏪 **Admin Layout**: Dedicated admin interface with sidebar navigation and quick actions
- 📱 **Mobile Navigation**: Bottom navigation bar for easy mobile access
- 🚀 **Production Ready**: Deployed and live on DigitalOcean

---

## Recent Improvements (Weeks 13-16)

Following the core functionality completion at Week 12, the final 4 weeks focused on comprehensive UI/UX enhancements and production readiness:

### 🎨 Frontend Quality Uplift
- **Theme System**: Added light/dark mode toggle with localStorage persistence
- **Admin Layout**: Dedicated admin interface with sidebar navigation and content area separation
- **Mobile Navigation**: Bottom navigation bar (Home, Menu, Cart, Account) for improved mobile usability
- **Enhanced Navbar**: Improved desktop navigation with icons, profile dropdown, and offcanvas menu
- **Product Cards**: Premium design with better image handling, stock indicators, and hover effects
- **Checkout Polish**: Clearer order summaries, coupon display, and payment method cards
- **Order Tracking**: Enhanced live tracking with visual timelines and delivery status
- **Admin Dashboard**: Operational hierarchy with urgent queue, KPIs, and quick actions

### 🏪 Admin Operations Upgrade
- **Dashboard Improvements**: Better KPI tiles, urgent order queue, and operational insights
- **Product Management**: Enhanced CRUD interface with better form layouts and image previews
- **Coupon Management**: Improved promotional controls with usage tracking
- **Order Handling**: Streamlined status updates and intervention workflows

### 📱 User Experience Refinements
- **Customer Journey**: Smoother transitions from browsing to checkout to tracking
- **Notifications**: Real-time updates with unread count indicators
- **Profile Management**: Enhanced user profiles with picture upload capabilities
- **Consistency**: Unified visual language across all screens and interactions

### 🚀 Deployment & Production
- **Live Deployment**: Successfully deployed on DigitalOcean droplet
- **Production URL**: [xxx.app](https://xxx.app) (placeholder - update with actual URL)
- **Validation**: End-to-end testing confirmed stable operation in live environment
- **Optimization**: Final performance tuning and reliability improvements

These improvements transformed the platform from a functional prototype to a polished, production-ready e-commerce solution.

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: React Bootstrap, CSS
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js (Google OAuth 2.0, JWT)
- **Image Storage**: Cloudinary v2 API
- **Payment Gateway**: Razorpay
- **Email Service**: Nodemailer with Gmail SMTP
- **Real-Time**: Server-Sent Events (SSE)

### DevOps & Tools
- **Package Manager**: npm
- **Build Tool**: Vite
- **Tunneling**: ngrok
- **Environment Management**: dotenv
- **Database Seeding**: Custom seed scripts

---

## Project Structure

```
FrozenDelights/
├── client/                              # React frontend
│   ├── src/
│   │   ├── App.jsx                     # Main app component
│   │   ├── main.jsx                    # Entry point
│   │   ├── api/
│   │   │   └── axios.js                # Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Enhanced navigation with theme toggle and mobile menu
│   │   │   ├── Footer.jsx              # Theme-aware footer component
│   │   │   ├── ProductCard.jsx         # Premium product display with stock indicators
│   │   │   ├── ProductViewerModal.jsx  # Product detail modal with carousel
│   │   │   ├── AdminLayout.jsx         # Dedicated admin shell with sidebar
│   │   │   ├── ThemeToggle.jsx         # Light/dark mode toggle button
│   │   │   └── InvoiceDownloadBtn.jsx  # Invoice download component
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # User authentication state
│   │   │   ├── CartContext.jsx         # Shopping cart state
│   │   │   └── ThemeContext.jsx        # Theme management (light/dark mode)
│   │   ├── pages/
│   │   │   ├── user/
│   │   │   │   └── Home.jsx            # Home page
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   ├── ResetPassword.jsx
│   │   │   │   ├── VerifyEmail.jsx
│   │   │   │   └── GoogleSuccess.jsx
│   │   │   ├── admin/
│   │   │   │   └── AdminLogin.jsx
│   │   │   ├── Menu.jsx                # Product catalog with filters
│   │   │   ├── Cart.jsx                # Shopping cart page
│   │   │   ├── Checkout.jsx            # Checkout flow
│   │   │   ├── OrderSuccess.jsx        # Order confirmation
│   │   │   └── Profile.jsx             # User profile management
│   │   └── routes/
│   │       ├── ProtectedRoute.jsx      # Auth guard for user pages
│   │       ├── AdminRoute.jsx          # Auth guard for admin pages
│   │       └── GuestRoute.jsx          # Redirect if already logged in
│   ├── styles/
│   │   └── app.css                     # Global theme-aware styles and layout
│   ├── .env.example                    # Frontend env template
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── server/                              # Express backend
│   ├── config/
│   │   ├── db.js                       # MongoDB connection
│   │   ├── cloudinary.js               # Cloudinary & multer setup
│   │   └── passport.js                 # Passport.js authentication
│   ├── controllers/
│   │   ├── authController.js           # Auth endpoints (register, login, OAuth)
│   │   ├── productController.js        # Product CRUD & image handling
│   │   ├── orderController.js          # Order creation & management
│   │   ├── paymentController.js        # Razorpay payment processing
│   │   └── analyticsController.js      # Sales & analytics data
│   ├── models/
│   │   ├── User.js                     # User schema
│   │   ├── Product.js                  # Product schema (with multi-image support)
│   │   ├── Order.js                    # Order schema
│   │   ├── Coupon.js                   # Discount coupon schema
│   │   ├── Notification.js             # User notification schema
│   │   └── PaymentWebhookEvent.js      # Webhook event tracking
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT verification
│   │   ├── adminMiddleware.js          # Admin role check
│   │   └── errorHandler.js             # Global error handling
│   ├── routes/
│   │   ├── authRoutes.js               # Auth endpoints
│   │   ├── productRoutes.js            # Product endpoints
│   │   ├── orderRoutes.js              # Order endpoints
│   │   ├── paymentRoutes.js            # Payment & webhook endpoints
│   │   ├── analyticsRoutes.js          # Analytics endpoints
│   │   └── streamRoutes.js             # SSE endpoints
│   ├── services/
│   │   ├── emailService.js             # Nodemailer email sending
│   │   ├── invoiceService.js           # Invoice generation
│   │   └── realtimeService.js          # SSE client management
│   ├── seed/
│   │   ├── seedData.js                 # Initial product data
│   │   ├── generateCloudinaryCatalogImages.js  # SVG image generation
│   │   └── migrateProductImagesToCloudinary.js # Cloudinary image upload
│   ├── .env.example                    # Backend env template
│   ├── server.js                       # Express app entry point
│   └── package.json
│
├── .gitignore
├── .env.example                        # Root env reference
└── README.md                           # This file
```

---

## Installation & Setup

### Prerequisites

- **Node.js** v16+ with npm
- **MongoDB** (local or MongoDB Atlas)
- **Cloudinary** account (for image hosting)
- **Razorpay** account (for payments)
- **Gmail account** with app password (for emails)
- **Google OAuth credentials** (for social login)

### Step 1: Clone Repository

```bash
git clone https://github.com/Raj-49/FrozenDelights.git
cd FrozenDelights
```

### Step 2: Frontend Setup

```bash
cd client
npm install
cp .env.example .env
```

Update `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Backend Setup

```bash
cd ../server
npm install
cp .env.example .env
```

Update `server/.env` with your credentials:

```env
# Database
MONGO_URI=mongodb://localhost:27017/frozendelights

# JWT (keep SECRET strong in production)
JWT_SECRET=your-very-secure-secret-key-min-32-chars
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Razorpay (get from https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx
PAYMENT_RECONCILE_INTERVAL_MS=300000
PAYMENT_RECONCILE_LOOKBACK_HOURS=48

# Gmail SMTP (use app password, not account password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=FrozenDelights <your-email@gmail.com>
SEND_SIGNIN_ALERTS=true

# Google OAuth (get from https://console.cloud.google.com)
GOOGLE_CLIENT_ID=xxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxx
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
ADMIN_EMAIL=admin@frozendelights.com

# Cloudinary (get from https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=xxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxx

# URLs
CLIENT_URL=http://localhost:5173
PORT=5000

# SLA Timings (in minutes)
SLA_PREP_MINUTES=20
SLA_DELIVERY_MINUTES=25
```

### Step 4: Database Seeding

```bash
cd server
npm run seed
```

This will populate the database with 120 ice cream products across 4 categories (Cone, Cup, Family Pack, Combo).

### Step 5: Run Application

**Terminal 1** - Start backend:
```bash
cd server
npm run dev
```

**Terminal 2** - Start frontend:
```bash
cd client
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

## Configuration Details

### Environment Variables

#### Client (`.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

#### Server (`.env`)
| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `RAZORPAY_KEY_ID` | Razorpay merchant key |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook verification secret |
| `SMTP_USER`, `SMTP_PASS` | Gmail credentials |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `CLOUDINARY_*` | Cloudinary image service credentials |
| `ADMIN_EMAIL` | Admin email for notifications |

---

## API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /register` - Create new user account
- `POST /login` - Login with email/password
- `POST /google/callback` - Google OAuth callback
- `POST /refresh` - Refresh JWT token
- `POST /logout` - Logout user
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `POST /verify-email` - Verify email address

### Products (`/api/products`)
- `GET /` - List all products with filters
- `GET /:id` - Get product details
- `POST /` - Create product (Admin)
- `PUT /:id` - Update product (Admin)
- `DELETE /:id` - Delete product (Admin)

### Orders (`/api/orders`)
- `POST /` - Create order
- `GET /` - List user's orders
- `GET /:id` - Get order details
- `PUT /:id` - Update order status (Admin)
- `GET /user` - Get all user orders

### Payments (`/api/payments`)
- `POST /initialize` - Initialize Razorpay payment
- `POST /verify` - Verify payment signature
- `POST /webhook` - Razorpay webhook endpoint
- `GET /status/:orderId` - Check payment status

### Analytics (`/api/analytics`)
- `GET /sales` - Sales metrics (Admin)
- `GET /orders` - Order statistics (Admin)
- `GET /revenue` - Revenue data (Admin)

---

## Database Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  address: String,
  city: String,
  googleId: String,
  isAdmin: Boolean,
  emailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema
```javascript
{
  name: String,
  category: String (cone, cup, family pack, combo),
  flavor: String,
  description: String,
  price: Number,
  stock: Number,
  images: [String] (max 4 images from Cloudinary),
  image: String (primary image),
  size: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```javascript
{
  userId: ObjectId (reference to User),
  items: [
    {
      productId: ObjectId,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  paymentStatus: String (pending, completed, failed),
  orderStatus: String (placed, confirmed, preparing, out_for_delivery, delivered, cancelled),
  deliveryAddress: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Coupon Schema
```javascript
{
  code: String (unique),
  discountType: String (percentage, fixed),
  discountValue: Number,
  maxUses: Number,
  usedCount: Number,
  expiresAt: Date,
  isActive: Boolean,
  createdAt: Date
}
```

---

## Key Features

### 🛍️ Product Management
- Multi-image support (up to 4 images per product)
- Product filtering by category, flavor, and size
- Stock management and availability tracking
- Search functionality
- Premium product card design with hover effects

### 🛒 Shopping Experience
- Real-time cart management with React Context
- Product viewer modal with carousel and thumbnails
- Persistent cart storage (localStorage)
- Quantity management and price calculation
- Enhanced checkout flow with coupon support

### 💳 Payments
- Razorpay integration for secure payments
- Payment status tracking and reconciliation
- Webhook verification and idempotency
- Order confirmation emails
- Invoice generation and download

### 👤 User Management
- Email/password authentication with bcrypt
- Google OAuth 2.0 integration
- Email verification flow
- Password reset functionality
- User profile management with picture upload
- Theme preference persistence

### 📧 Notifications
- Order confirmation emails
- Payment notifications
- Delivery status alerts
- Sign-in alerts (optional)
- Server-Sent Events for real-time updates
- Notification center with unread indicators

### 🖼️ Image Management
- Cloudinary integration for scalable image hosting
- Automatic image optimization and transformation
- Fallback image handling
- Batch image upload support

### 📊 Analytics & Admin Dashboard
- Sales metrics and revenue tracking
- Order management interface
- Product inventory control
- User activity analytics
- Payment reconciliation dashboard
- Urgent order queue and operational insights

### 🎨 UI/UX Enhancements
- Light and dark mode theme toggle
- Mobile-first responsive design with bottom navigation
- Dedicated admin layout with sidebar navigation
- Consistent visual hierarchy across all screens
- Enhanced accessibility and user confidence

---

## Development

### Running Tests
```bash
# Frontend tests
cd client
npm run test

# Backend tests
cd ../server
npm run test
```

### Build for Production

**Frontend**:
```bash
cd client
npm run build
# Output: dist/
```

**Backend**: No build needed; run with Node.js directly

### Deployment

The application is deployed and live on DigitalOcean at **xxx.app** (update with actual domain).

For production deployment:
1. Build the frontend: `cd client && npm run build`
2. Set production environment variables in server/.env
3. Start the server: `cd server && npm start`
4. Configure reverse proxy (nginx) for static file serving
5. Set up SSL certificates for HTTPS

### Using ngrok for External Testing

To test webhooks or mobile clients:

```bash
ngrok http 5000
# Use the provided HTTPS URL as your external API endpoint
```

Update `RAZORPAY_WEBHOOK_SECRET` and `GOOGLE_CALLBACK_URL` if needed.

---

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or Atlas cluster is accessible
- Check `MONGO_URI` format and credentials

### Image Upload Fails
- Verify Cloudinary credentials in `.env`
- Check folder structure: `frozendelights/products`
- Ensure API keys have upload permissions

### Payment Webhook Not Triggering
- Use ngrok to expose local server to internet
- Update webhook URL in Razorpay dashboard
- Verify webhook secret matches

### Email Not Sending
- Use Gmail app passwords, not account password
- Enable "Less secure app access" if still issues
- Check SMTP credentials and port (587 for TLS)

### Google OAuth Fails
- Ensure redirect URI matches exactly in Google Console
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

---

## Performance Optimization

- **Frontend**: Vite for fast bundling and HMR
- **Images**: Cloudinary transformations for responsive images
- **Database**: MongoDB indexes on frequently queried fields
- **Caching**: Browser caching for static assets
- **API**: Response compression and pagination

---

## Security Best Practices

✅ JWT token expiration (15 minutes)  
✅ Password hashing with bcrypt  
✅ CORS enabled only for frontend origin  
✅ Input validation and sanitization  
✅ SQL/NoSQL injection prevention  
✅ XSS protection headers  
✅ HTTPS in production  
✅ Environment variables for secrets  
✅ Admin middleware for protected routes  
✅ Razorpay signature verification  

---

## Contributing

To contribute to this internship project:

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes and test thoroughly
3. Commit with clear messages: `git commit -m "Add feature description"`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request with detailed description

---

## Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
# Set VITE_API_URL to production API URL
```

### Backend (Heroku/Railway/Render)
```bash
git push heroku main
# Set environment variables in platform dashboard
```

### Database
- Use MongoDB Atlas for managed cloud database
- Enable IP whitelist security
- Set up automated backups

---

## License

This project is part of the 2026 Winter Internship at Brainlybeans PVT. LTD.

---

## Contact & Support

**Project Lead**: Raj Patel  
**Internship**: Brainlybeans PVT. LTD (2026 Winter)

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team

---

**Last Updated**: April 2026  
**Version**: 1.0.0
