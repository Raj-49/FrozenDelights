# FrozenDelights Development Guide

## 🚀 Quick Start

### Option 1: One-Click Setup (Recommended)
```bash
# Run the setup script (first time only)
setup-project.bat

# Start development servers
start-dev.bat
```

### Option 2: Manual Setup
```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Setup environment files
copy .env.example server/.env

# Seed database
cd server && npm run seed

# Start servers
start-dev.bat
```

## 🛠️ Development Tools

### Available Batch Files

| File | Purpose |
|------|---------|
| `setup-project.bat` | Complete project setup (first time) |
| `start-dev.bat` | Start both frontend and backend servers |
| `stop-dev.bat` | Stop all running Node.js processes |
| `dev-tools.bat` | Interactive development tools menu |
| `README-DEV.md` | This development guide |

### Using dev-tools.bat
Run `dev-tools.bat` for an interactive menu with options:
- Start/Stop servers
- Install dependencies
- Seed database
- View logs
- Open project folder
- Git status

## 📁 Project Structure

```
FrozenDelights/
├── server/                 # Backend Node.js application
│   ├── config/             # Database and service configurations
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   ├── seed/              # Database seeding
│   ├── server.js          # Express server
│   └── .env               # Environment variables
├── client/                # Frontend React application
│   ├── src/
│   │   ├── api/          # Axios configuration
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React contexts
│   │   ├── pages/        # Page components
│   │   └── routes/       # Route guards
│   ├── package.json
│   └── vite.config.js
├── setup-project.bat      # Initial setup script
├── start-dev.bat         # Start development servers
├── stop-dev.bat          # Stop all servers
├── dev-tools.bat         # Development tools menu
└── README-DEV.md         # This guide
```

## 🔧 Environment Configuration

### Backend (.env)
```env
MONGO_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=FrozenDelights <your_email@gmail.com>
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🏃‍♂️ Development Workflow

### Daily Development
1. Run `start-dev.bat` to start both servers
2. Frontend: http://localhost:5173
3. Backend API: http://localhost:5000
4. API Health Check: http://localhost:5000/api/health

### Adding New Features
1. Create feature branch: `git checkout -b feature-name`
2. Make changes to relevant files
3. Test with `start-dev.bat`
4. Commit changes: `git add . && git commit -m "message"`
5. Push: `git push origin feature-name`

### Database Operations
```bash
# Seed database with initial data
cd server && npm run seed

# Clear and reseed (if needed)
# Delete all collections in MongoDB, then run seed
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Stop all Node processes
stop-dev.bat

# Or manually kill processes
taskkill /F /IM node.exe
```

#### MongoDB Connection Error
1. Check `.env` file for correct MONGO_URI
2. Ensure MongoDB is running (local or Atlas)
3. Verify network connectivity

#### Environment Variables Missing
1. Copy `.env.example` to `server/.env`
2. Fill in all required values
3. Restart servers with `start-dev.bat`

#### Frontend Not Loading
1. Check if backend is running on port 5000
2. Verify API URL in client `.env`
3. Check browser console for errors

### Getting Help
1. Check this README first
2. Look at error messages in terminal windows
3. Check browser console for frontend errors
4. Use `dev-tools.bat` → View Logs option

## 📦 Deployment Notes

### Before Deployment
1. Update all environment variables for production
2. Build frontend: `cd client && npm run build`
3. Test all functionality
4. Update database if needed

### Production Environment Variables
- Use production MongoDB URI
- Use production JWT secrets
- Update all API keys and secrets
- Set NODE_ENV=production

## 🔄 Updating This Guide

When adding new features or changing the project structure:
1. Update this README-DEV.md file
2. Update batch files if new commands are needed
3. Add new environment variables to the examples
4. Update troubleshooting section with common issues

## 🎯 Default Credentials

### Admin Account
- Email: `admin@frozen.com`
- Password: `Admin@123`

### Test Users
Create test accounts through the registration page or seed additional users in `seed/seedData.js`.

---

**Happy Coding! 🍦**
