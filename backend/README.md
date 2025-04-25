
# StockSavvy Backend

This is the backend for StockSavvy, a stock management app using Firebase Authentication and MongoDB.

## Technology Stack

- **Next.js**: API routes for serverless functions
- **Firebase Admin SDK**: User authentication and verification
- **MongoDB**: Database for product and inventory management
- **Mongoose**: MongoDB object modeling

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a Firebase project and download the service account key
4. Set up MongoDB Atlas cluster
5. Create a `.env.local` file with your configuration:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stocksavvy
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY="your-private-key-with-newlines"
   ```
6. Start the development server:
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
- `PUT /api/users/me` - Update user profile

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

## Database Schema

### User
- `firebase_uid`: String (unique)
- `email`: String
- `name`: String
- `role`: String (admin, owner, worker)
- `photo_url`: String
- `created_at`: Date

### Store
- `name`: String
- `owner_id`: User reference
- `created_at`: Date

### Product
- `name`: String
- `description`: String
- `barcode`: String
- `sku`: String
- `category`: String
- `price`: Number
- `quantity`: Number
- `store_id`: Store reference
- `created_by`: User reference
- `created_at`: Date
- `updated_at`: Date

### UserStoreAccess
- `user_id`: User reference
- `store_id`: Store reference
- `role`: String (owner, worker)
- `created_at`: Date
