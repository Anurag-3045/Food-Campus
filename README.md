# Food Campus

Food Campus is a full-stack food ordering application with three parts:

- `frontend`: customer app (browse menu, cart, place order, Stripe checkout)
- `backend`: Node.js + Express API with MongoDB
- `admin`: admin panel (add/list/edit/delete food items, manage orders)

## Tech Stack

- Frontend/Admin: React + Vite
- Backend: Node.js, Express, Mongoose
- Database: MongoDB Atlas
- Payments: Stripe Checkout

## Project Structure

```text
Food-Campus/
  frontend/
  backend/
  admin/
```

## Prerequisites

- Node.js (v18+ recommended)
- npm
- MongoDB connection (Atlas/local)
- Stripe secret key (for payments)

## Environment Setup

Create the following files:

- `backend/.env`
  - `JWT_SECRET=your_jwt_secret`
  - `STRIPE_SECRET_KEY=your_stripe_secret_key`

- `admin/.env`
  - `VITE_API_URL=http://localhost:4000`

For frontend backend URL is currently set in `frontend/src/context/StoreContext.jsx`.

## Install Dependencies

From project root:

```bash
npm install
```

Also install app dependencies (if needed):

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

## Run the Project

### Run frontend + backend together (from root)

```bash
npm run dev
```

### Run admin panel separately

```bash
cd admin
npm run dev
```

## Features

- User signup/login
- Browse menu by categories
- Cart management
- Place order with Stripe checkout
- Order status tracking
- Admin food management (add/list/edit/delete)
- Admin order management with status updates

## API Base URL

- Local backend: `http://localhost:4000`

## Notes

- Do not commit `.env` files or secrets.
- If changing deployment domain/backend URL, update `VITE_API_URL` and frontend API URL accordingly.
