# FrozenDelights - Ice Cream Shop MERN Application

A full-stack ice cream shop application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- User authentication (login/register)
- Product management (ice creams with categories, flavors, sizes)
- Shopping cart functionality
- Order management with Razorpay payment integration
- Invoice generation and email notifications
- Admin dashboard with analytics
- Responsive design with Bootstrap

## Project Structure

```
FrozenDelights/
├── server/                 # Backend Node.js application
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── services/         # Business logic services
│   ├── seed/             # Database seeding
│   ├── server.js         # Express server
│   └── package.json
├── client/               # Frontend React application
│   ├── src/
│   │   ├── api/         # Axios configuration
│   │   ├── context/     # React contexts
│   │   ├── routes/      # Protected route components
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── .env.example          # Environment variables template
└── README.md
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file from .env.example and fill in your environment variables:
```bash
cp ../.env.example .env
```

4. Start the server:
```bash
npm run dev
```

### Database Seeding

To seed the database with initial products and admin user:
```bash
npm run seed
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
MONGO_URI=mongodb://localhost:27017/frozendelights
JWT_SECRET=your_jwt_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=5000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment

### Analytics
- `GET /api/analytics/sales` - Get sales data (admin only)
- `GET /api/analytics/products` - Get product analytics (admin only)
- `GET /api/analytics/revenue` - Get revenue data (admin only)

## Default Admin Account

After seeding the database, you can use the following admin account:
- Email: admin@frozen.com
- Password: Admin@123

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Razorpay for payments
- PDFKit for invoice generation
- Nodemailer for email services

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Bootstrap & React Bootstrap for styling
- Recharts for analytics charts
- Vite for build tooling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.
