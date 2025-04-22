
# StockSavvy Backend

This is the backend for StockSavvy, a stock management app using Firebase Authentication and PostgreSQL.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a Firebase project and download the service account key to `serviceAccountKey.json` in the backend directory
4. Set up PostgreSQL database
5. Create a `.env` file with your database URL:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/stocksavvy
   PORT=3000
   ```
6. Initialize the database with the schema:
   ```bash
   psql -U username -d stocksavvy -f db/schema.sql
   ```
7. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
All endpoints require Firebase authentication token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

### User Endpoints
- `GET /api/users/me` - Get current user profile

### Products Endpoints
- `GET /api/products` - List products (filtered by user role)
- `POST /api/products` - Create a new product
- `GET /api/products/:id` - Get a specific product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Stores Endpoints
- `GET /api/stores` - List stores (filtered by user role)
- `POST /api/stores` - Create a new store
- `POST /api/invite-worker` - Invite a worker to a store
