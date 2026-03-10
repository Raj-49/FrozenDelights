# 🍦 FrozenDelights — MERN Build Plan
### Vibe Coding Strategy: Maximum Output, Minimum Prompts

---

## 🧠 Core Strategy: "One Prompt Per Phase"

Each phase = **1 massive context-loaded prompt** to your AI IDE.  
Give it the schema + routes + folder structure upfront → let it scaffold entire modules at once.  
Never ask it to "add a field" or "fix one route" — always regenerate the whole file.

**Tools to use (Student Dev Pack):**
- **Cursor** (free tier) — primary IDE with inline AI
- **Codeium** — autocomplete fallback (free, unlimited)
- **GitHub Copilot** — if credits reset, use for test generation only
- **Claude** (this chat) — architecture decisions & debugging logic

---

## 📁 One-Time Setup Prompt (Run First in Cursor)

Paste this **once** to scaffold the entire folder structure + boilerplate:

```
Create a MERN stack project called FrozenDelights with this exact structure:

SERVER (server/):
  config/db.js — Mongoose connect to MONGO_URI from .env
  models/User.js — fields: name, email, password(select:false), role(enum:user|admin, default:user), timestamps
  models/Product.js — fields: name, category(enum:cone|cup|family pack|combo), flavor, size(enum:small|medium|large), price(min:0), stock(default:0,min:0), image(String), available(default:true), timestamps. Compound index: {category,available}. Index: {stock}
  models/Order.js — fields: userId(ref:User), items[{productId,name,flavor,size,price,quantity}], subtotal, tax, totalAmount, paymentStatus(enum:pending|paid|failed,default:pending), razorpayOrderId, razorpayPaymentId, orderStatus(enum:Placed|Confirmed|Preparing|Out for Delivery|Delivered|Cancelled,default:Placed), deliveryAddress, location(GeoJSON optional), invoiceSent(default:false), timestamps. Indexes: {userId,createdAt}, {orderStatus}, {createdAt}
  middleware/authMiddleware.js — verifyToken: extract Bearer token, verify JWT_SECRET, attach req.user
  middleware/adminMiddleware.js — requireAdmin: check req.user.role === 'admin', 403 if not
  middleware/errorHandler.js — global: return {success:false, message: err.message}, 500
  controllers/ — empty files: authController, productController, orderController, paymentController, analyticsController
  routes/ — authRoutes, productRoutes, orderRoutes, paymentRoutes, analyticsRoutes
  services/invoiceService.js — placeholder export generateInvoice(order, user)
  services/emailService.js — placeholder export sendInvoiceEmail(to, pdfBuffer, orderId)
  seed/seedData.js — 6 ice cream products + 1 admin {email:admin@frozen.com, password:Admin@123, role:admin}
  server.js — express app, cors, json middleware, mount all routes at /api/*, errorHandler last, listen PORT

CLIENT (client/) — Vite React app:
  src/api/axios.js — axios instance baseURL:/api, request interceptor adds Authorization: Bearer token from localStorage
  src/context/AuthContext.jsx — user state, login(), logout(), register() functions, loads user from localStorage on mount
  src/context/CartContext.jsx — cart array state, addToCart(), removeFromCart(), updateQuantity(), clearCart(), cartTotal, cartCount, persist to localStorage
  src/routes/ProtectedRoute.jsx — redirect /login if no user
  src/routes/AdminRoute.jsx — redirect / if user.role !== admin
  src/routes/GuestRoute.jsx — redirect / if user exists

Also create .env.example with: MONGO_URI, JWT_SECRET, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, EMAIL_USER, EMAIL_PASS, PORT=5000
And package.json for server with deps: express mongoose dotenv cors bcryptjs jsonwebtoken razorpay pdfkit nodemailer
And client/package.json deps: axios react-router-dom bootstrap react-bootstrap recharts

Standard API response format for ALL controllers:
  Success: res.status(2xx).json({ success: true, data: {}, message: '' })
  Error: next(new Error('message')) — let errorHandler catch it
```

---

## Phase 1 — Auth + Products (Foundation)

### Single Prompt for Phase 1:

```
Fill in these files completely for FrozenDelights MERN app.

=== server/controllers/authController.js ===
Implement 3 functions:
- register: hash password with bcrypt(10), create User, sign JWT {id,role,name,email} expires 7d, return {success:true, data:{token, user(no password)}}
- login: find user by email with +password, compare bcrypt, sign JWT same payload, return same shape. Admin can login here too.
- getMe: return req.user populated from DB (no password field)

=== server/routes/authRoutes.js ===
POST /register → register (public)
POST /login → login (public)  
GET /me → verifyToken → getMe

=== server/controllers/productController.js ===
Implement all 7 functions:
- getProducts: find where available:true, sort by createdAt desc
- getProductById: findById, 404 if not found
- getAllProductsAdmin: find all (no filter)
- createProduct: create from req.body
- updateProduct: findByIdAndUpdate with {new:true}
- toggleAvailable: flip the available boolean
- deleteProduct: findByIdAndDelete

=== server/routes/productRoutes.js ===
GET / → getProducts (public)
GET /admin/all → verifyToken, requireAdmin → getAllProductsAdmin
GET /:id → getProductById (public)
POST / → verifyToken, requireAdmin → createProduct
PUT /:id → verifyToken, requireAdmin → updateProduct
PATCH /:id/toggle → verifyToken, requireAdmin → toggleAvailable
DELETE /:id → verifyToken, requireAdmin → deleteProduct

=== client/src/pages/auth/Login.jsx ===
Form with email+password, calls POST /api/auth/login via AuthContext.login(), stores token+user in localStorage, redirects to / on success. Show error message on fail.

=== client/src/pages/auth/Register.jsx ===
Form with name+email+password, calls POST /api/auth/register, auto-login after register.

=== client/src/pages/user/Home.jsx ===
Fetch GET /api/products on mount. Show category filter tabs (All | Cone | Cup | Family Pack | Combo). Render ProductCard grid. Show loading spinner while fetching.

=== client/src/components/ProductCard.jsx ===
Card showing product image (or placeholder), name, flavor, size, price in ₹, Add to Cart button (calls CartContext.addToCart). If stock===0, show "Out of Stock" disabled button.

=== client/src/components/Navbar.jsx ===
Brand "🍦 FrozenDelights". Links: Home, Cart (with badge showing cartCount), My Orders. If not logged in: Login/Register. If admin: Admin Dashboard. Logout button if logged in.

=== seed/seedData.js ===
Complete seed script that clears and re-inserts:
- 6 products: {name:"Mango Delight",category:"cone",flavor:"Mango",size:"medium",price:60,stock:25,available:true}, {name:"Choco Blast",category:"cup",flavor:"Chocolate",size:"large",price:80,stock:15,available:true}, {name:"Strawberry Swirl",category:"cone",flavor:"Strawberry",size:"small",price:40,stock:30,available:true}, {name:"Family Vanilla Pack",category:"family pack",flavor:"Vanilla",size:"large",price:220,stock:8,available:true}, {name:"Rainbow Combo",category:"combo",flavor:"Mixed",size:"medium",price:150,stock:12,available:true}, {name:"Butterscotch Cup",category:"cup",flavor:"Butterscotch",size:"medium",price:70,stock:20,available:true}
- 1 admin: hash password "Admin@123", email:"admin@frozen.com", role:"admin", name:"Admin"
Run with: node seed/seedData.js
```

---

## Phase 2 — Cart + Orders

### Single Prompt for Phase 2:

```
Implement Cart and Order modules for FrozenDelights.

=== server/controllers/orderController.js ===
Implement 6 functions:

createOrder:
- req.body: { items:[{productId, quantity}], deliveryAddress }
- Validate all products exist and have enough stock
- If any product fails stock check: return 400 error listing which items failed
- Calculate: subtotal = sum(product.price * qty), tax = subtotal * 0.05, totalAmount = subtotal + tax
- Create Order with items snapshot (embed: name, flavor, size, price at time of order from product doc)
- Bulk update stock: Product.bulkWrite([{updateOne: {filter:{_id}, update:{$inc:{stock:-qty}}}}])
- Return created order

getMyOrders: find {userId: req.user.id}, sort {createdAt:-1}, populate items.productId minimally
getOrderById: findById, populate userId(name,email). Check req.user.id === order.userId OR req.user.role==='admin'
getAllOrders: find all, populate userId(name,email), sort newest first
updateOrderStatus:
  - Valid transitions: Placed→Confirmed, Confirmed→Preparing, Preparing→Out for Delivery, Out for Delivery→Delivered
  - Cancelled allowed only from Confirmed
  - Reject invalid transitions with 400
cancelOrder: set orderStatus to Cancelled, only if current status is Confirmed

=== server/routes/orderRoutes.js ===
POST / → verifyToken → createOrder
GET /my → verifyToken → getMyOrders
GET / → verifyToken, requireAdmin → getAllOrders
GET /:id → verifyToken → getOrderById
PATCH /:id/status → verifyToken, requireAdmin → updateOrderStatus
POST /:id/cancel → verifyToken, requireAdmin → cancelOrder

=== client/src/pages/user/Cart.jsx ===
Read from CartContext. Show each item with image, name, flavor, size, unit price, quantity stepper (+/-), remove button, line total. Show cart subtotal. "Proceed to Checkout" button → /checkout. "Continue Shopping" link.

=== client/src/pages/user/Checkout.jsx ===
Left: address textarea (required). Right: Order Summary (items list, subtotal, GST 5%, total in ₹).
"Place Order" button: calls POST /api/orders first, gets orderId back, then immediately calls POST /api/payment/create-order with {orderId, amount}. On response opens Razorpay checkout popup with these options:
  key: VITE_RAZORPAY_KEY_ID, amount, currency:"INR", name:"FrozenDelights", description:"Ice Cream Order"
  handler: async(response) => { verify payment via POST /api/payment/verify; if success → clearCart(); navigate(/order/${orderId}/success) }
  prefill: {name: user.name, email: user.email}
Load Razorpay script dynamically if not loaded.

=== client/src/pages/user/OrderHistory.jsx ===
Fetch GET /api/orders/my. Show list of OrderCards: order date, order ID (last 6 chars), status badge (color-coded), total amount, item count. Each card links to /order/:id/track.

=== client/src/pages/user/TrackOrder.jsx ===
Fetch GET /api/orders/:id. Show StatusTimeline component + order items list + delivery address + total.

=== client/src/components/StatusTimeline.jsx ===
Visual vertical timeline showing: Placed → Confirmed → Preparing → Out for Delivery → Delivered
Highlight completed steps in green, current step in blue, future steps in gray.
Handle Cancelled state separately (show red cancelled badge).
```

---

## Phase 3 — Payment + Invoice

### Single Prompt for Phase 3:

```
Implement Payment and Billing for FrozenDelights.

=== server/controllers/paymentController.js ===

createRazorpayOrder:
- req.body: { orderId, amount }
- Verify Order belongs to req.user.id
- Create Razorpay order: new Razorpay({key_id, key_secret}).orders.create({amount: amount*100, currency:'INR', receipt: orderId})
- Save razorpayOrderId to Order document
- Return { razorpayOrderId, amount, currency }

verifyPayment:
- req.body: { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId }
- Verify: crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(razorpayOrderId+'|'+razorpayPaymentId).digest('hex')
- If signature mismatch: update order paymentStatus:'failed', return 400
- If valid: update order {paymentStatus:'paid', razorpayPaymentId, orderStatus:'Confirmed'}
- Fetch order with userId populated (for email)
- Call invoiceService.generateInvoice(order) → pdfBuffer
- Call emailService.sendInvoiceEmail(user.email, pdfBuffer, order._id) 
- Update order invoiceSent:true
- Return {success:true, orderId}

=== server/routes/paymentRoutes.js ===
POST /create-order → verifyToken → createRazorpayOrder
POST /verify → verifyToken → verifyPayment

=== server/services/invoiceService.js ===
Using pdfkit, generate invoice PDF buffer with:
- Header: "FrozenDelights 🍦" large, "TAX INVOICE" subtitle
- Invoice #: INV-{orderId.slice(-6).toUpperCase()}, Date: formatted createdAt
- Bill To: customer name, email, delivery address
- Items table: columns [Item, Flavor, Size, Qty, Unit Price, Total] — draw borders with doc.rect
- Subtotal row, GST 5% row, TOTAL row (bold)
- Footer: "Payment ID: " + razorpayPaymentId, "Status: PAID" in green
- Return as Buffer (use doc.pipe to collect chunks, resolve on 'end' event)

=== server/services/emailService.js ===
Using nodemailer with Gmail SMTP (EMAIL_USER, EMAIL_PASS from .env):
- sendInvoiceEmail(to, pdfBuffer, orderId): send email with subject "Your FrozenDelights Invoice - INV-{id}", HTML body thanking customer, PDF attached as "invoice-{id}.pdf"

=== server/controllers/orderController.js — ADD THIS FUNCTION ===
getInvoice:
- findById(req.params.id).populate('userId', 'name email')
- Auth check: req.user.id === order.userId._id.toString() OR req.user.role === 'admin'
- Call invoiceService.generateInvoice(order, order.userId) → pdfBuffer
- res.set({'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="invoice-${order._id}.pdf"`})
- res.send(pdfBuffer)

Add to server/routes/orderRoutes.js:
GET /:id/invoice → verifyToken → getInvoice

=== client/src/pages/user/OrderConfirmation.jsx ===
Fetch GET /api/orders/:id from URL param. Show:
- Big green checkmark ✅ animation
- "Order Placed Successfully!" heading
- Order ID, Total Amount, Estimated delivery message
- InvoiceDownloadBtn component
- "Track Your Order" button → /order/:id/track
- "Continue Shopping" button → /

=== client/src/components/InvoiceDownloadBtn.jsx ===
Button "📄 Download Invoice" — on click: fetch GET /api/orders/:id/invoice with auth header, receive blob, create object URL, trigger download. Show loading state while fetching.
```

---

## Phase 4 — Admin Panel

### Single Prompt for Phase 4:

```
Implement the full Admin Panel for FrozenDelights.

=== client/src/pages/admin/ManageProducts.jsx ===
Fetch GET /api/products/admin/all. Show table: image thumbnail, name, category, flavor, size, price ₹, stock, available toggle (PATCH /:id/toggle), Edit button (opens modal), Delete button (confirm then DELETE /:id).
"Add Product" button opens AddProductModal.
AddProductModal: form fields for all product schema fields, POST /api/products on submit.
EditProductModal: pre-fill form, PUT /api/products/:id on submit.
Show low stock (stock < 10) rows in yellow highlight.

=== client/src/pages/admin/OrdersPanel.jsx ===
Fetch GET /api/orders. Show table: Order ID (last 6), Customer name, Date, Items count, Total ₹, Payment status badge, Order status dropdown.
Status dropdown options change based on current status (enforce state machine on frontend too):
  Placed → [Confirmed, Cancelled]
  Confirmed → [Preparing, Cancelled]
  Preparing → [Out for Delivery]
  Out for Delivery → [Delivered]
  Delivered/Cancelled → disabled
On dropdown change: PATCH /api/orders/:id/status. Show success toast on update.
Click row → opens OrderDetailModal showing full items list + delivery address + payment info.

=== client/src/pages/admin/BillingPanel.jsx ===
Fetch GET /api/orders, filter client-side where paymentStatus === 'paid'.
Table: Invoice #(INV-last6), Customer, Date, Amount ₹, Payment ID (truncated), Download button.
Download button: InvoiceDownloadBtn component with orderId.
Summary at top: Total Revenue (sum all paid), Total Invoices count.

=== client/src/pages/admin/ManageUsers.jsx ===
Fetch GET /api/users (add this admin-only endpoint: find all users where role:'user', return name/email/createdAt, no passwords).
Table: name, email, registered date, total orders count (optional: add to aggregation).
Delete button: DELETE /api/users/:id (add endpoint, prevent deleting admin).

Add these endpoints to server:
GET /api/users → verifyToken, requireAdmin → find({role:'user'}).select('-password')
DELETE /api/users/:id → verifyToken, requireAdmin → findByIdAndDelete (error if trying to delete admin)

=== client/src/pages/admin/Dashboard.jsx — shell only ===
Import and layout placeholders for: SummaryCards, RevenueChart, LowStockAlert, RecentOrders.
Fetch GET /api/analytics/summary on mount. Pass data to child components.
(Analytics implementation in Phase 5)

=== client/src/App.jsx ===
Complete React Router setup with ALL routes:
Public: / → Home, /products/:id → ProductDetail, /login → GuestRoute(Login), /register → GuestRoute(Register)
Protected (user): /cart → Cart, /checkout → Checkout, /order/:id/success → OrderConfirmation, /order/:id/track → TrackOrder, /my-orders → OrderHistory, /profile → Profile
Admin: /admin → AdminRoute(Dashboard), /admin/products → AdminRoute(ManageProducts), /admin/orders → AdminRoute(OrdersPanel), /admin/billing → AdminRoute(BillingPanel), /admin/users → AdminRoute(ManageUsers)
Wrap entire app in AuthProvider then CartProvider.

=== client/src/pages/user/ProductDetail.jsx ===
Fetch GET /api/products/:id. Show large product image, name, category badge, flavor, size, price ₹, stock count ("Only X left!" if < 10), description if exists, Add to Cart button. Breadcrumb: Home > ProductName.
```

---

## Phase 5 — Analytics + Polish

### Single Prompt for Phase 5:

```
Implement Analytics dashboard and final UI polish for FrozenDelights.

=== server/controllers/analyticsController.js ===
Implement using MongoDB Aggregation:

getSummary (GET /api/analytics/summary):
Run these 6 aggregations in parallel with Promise.all:
1. todayRevenue: match {paymentStatus:'paid', createdAt: {$gte: startOfDay}}, group sum totalAmount
2. weeklyRevenue: match paid + last 7 days, group by dayOfWeek, sum totalAmount → array of {day, revenue}
3. todayOrders: count orders created today
4. popularFlavors: unwind items, group by items.flavor, sum count, sort desc, limit 5
5. lowStock: find products where stock < 10 and available:true, return name+stock
6. orderStatusBreakdown: group by orderStatus, count each
Return all as single object.

getRevenue (GET /api/analytics/revenue):
Last 30 days: group by date (dayOfMonth+month), sum totalAmount for paid orders.
Return array [{date: 'DD/MM', revenue: Number}] sorted ascending.

getLowStock (GET /api/analytics/low-stock):
Return products where stock < 10, available:true, sorted by stock asc.

=== server/routes/analyticsRoutes.js ===
GET /summary → verifyToken, requireAdmin → getSummary
GET /revenue → verifyToken, requireAdmin → getRevenue
GET /low-stock → verifyToken, requireAdmin → getLowStock

=== client/src/pages/admin/Dashboard.jsx — COMPLETE IMPLEMENTATION ===
Layout: 2-column grid on desktop, stack on mobile.
Top row — 4 SummaryCards: Today's Revenue (₹), Today's Orders, Weekly Revenue (₹), Low Stock Items count. Each card has icon, value, label.
Revenue Chart: recharts LineChart or AreaChart, fetch GET /api/analytics/revenue, X-axis dates, Y-axis ₹.
Popular Flavors: recharts BarChart, horizontal bars, top 5 flavors by order count.
Low Stock Alert: table/list of products with stock < 10 — red badge if < 5, yellow if < 10. Link to manage products.
Order Status Breakdown: recharts PieChart with status distribution.
Recent Orders: last 5 orders table with link to orders panel.

=== UI Polish — apply to ALL customer-facing pages ===
1. Add Bootstrap 5 toast notifications (react-bootstrap Toast) for: add to cart success, order placed, login success/error
2. Add loading skeletons (CSS animated placeholder divs) for ProductGrid while fetching
3. Make Navbar sticky with shadow on scroll (useEffect + scroll listener)
4. ProductCard: add hover scale transform (CSS transition: transform 0.2s), subtle box-shadow
5. Home page: add simple hero banner above ProductGrid — gradient background (pink to purple), "🍦 Fresh & Frozen" headline, "Order ice cream delivered to your door" subtext, CTA button
6. Cart badge in Navbar: animate scale pulse when item is added (CSS keyframe)
7. All forms: show inline validation errors (required, email format, password min 6 chars)
8. 404 page: fun ice-cream themed "Oops! This page melted 🍦" with back to home button
9. Mobile responsive: test all pages at 375px — fix any overflow issues

=== Final .env.example ===
MONGO_URI=mongodb://localhost:27017/frozendelights
JWT_SECRET=your_super_secret_jwt_key_here
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_gmail_app_password
PORT=5000

Client .env:
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
VITE_API_URL=http://localhost:5000
```

---

## 🐛 Debugging Prompts (Use When Stuck)

These are surgical, credit-efficient prompts for common MERN issues:

**Razorpay popup not opening:**
```
In client/src/pages/user/Checkout.jsx, the Razorpay popup is not opening.
Here is my current handler: [paste 20 lines].
The script loads at: [paste loadScript fn].
Error in console: [paste error].
Fix only the payment handler function, don't rewrite the whole component.
```

**JWT not attaching:**
```
My axios interceptor in src/api/axios.js is not adding the Authorization header.
Current interceptor code: [paste].
The token is stored in localStorage as 'token'.
Show me only the corrected interceptor.
```

**MongoDB aggregation wrong:**
```
This MongoDB aggregation for daily revenue is returning empty array:
[paste pipeline]
Collection name: orders. Sample document: [paste one doc].
Fix only the $match stage.
```

**Stock deduction race condition:**
```
In orderController.js createOrder, concurrent orders can oversell stock.
Current logic: [paste].
Add optimistic locking using findOneAndUpdate with $inc and $gte check in a single atomic operation.
```

---

## ✅ Testing Checklist (Per Phase)

**Phase 1:** `curl -X POST /api/auth/register` → get token → `curl /api/products` with token  
**Phase 2:** Place order via Postman, check stock decremented in MongoDB  
**Phase 3:** Use Razorpay test card `4111 1111 1111 1111`, verify PDF received in email  
**Phase 4:** Login as admin@frozen.com / Admin@123, test all CRUD operations  
**Phase 5:** Check analytics queries return data, test on mobile viewport  

---

## 📦 Deployment (DigitalOcean — Student Pack)

**Backend on DigitalOcean Droplet ($200 free credit):**
```bash
# On droplet (Ubuntu 22.04):
git clone your-repo && cd server
npm install
pm2 start server.js --name frozendelights
pm2 save && pm2 startup
# Set up nginx reverse proxy to port 5000
```

**Frontend on Vercel (free):**
```bash
cd client
vercel --prod
# Set env var: VITE_API_URL=https://your-droplet-ip
```

**MongoDB Atlas (free M0 tier):**  
Create cluster → get connection string → set as MONGO_URI in .env

---

## 💡 Token-Saving Rules

| ❌ Wasteful | ✅ Efficient |
|---|---|
| "Add a field to the product schema" | Always give full schema, ask to regenerate whole model file |
| "Why is this not working?" | Paste exact error + relevant 20 lines + ask for specific fix |
| "Make the UI look better" | Specify: "Add hover animation to ProductCard, CSS only, show only the new CSS block" |
| One prompt per endpoint | One prompt for entire controller file |
| Asking for explanation | Ask for code only: "no explanation, just the fixed function" |
| Fixing bugs one by one | "List all issues in this file, then fix them all at once" |

**Prompt Template to reuse:**
```
Context: FrozenDelights MERN app. Stack: React+Vite, Express, MongoDB, JWT auth, Razorpay, Bootstrap 5.
File: [filename]
Current code: [paste]
Problem: [one sentence]
Fix: [what you want changed]
Output: Only the corrected file/function. No explanation.
```
