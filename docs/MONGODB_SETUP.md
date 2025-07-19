# MongoDB Setup Guide for Singlespine

This guide will help you set up MongoDB for the Singlespine application, which uses MongoDB with Prisma ORM.

## 🗄️ Database Schema Overview

The application uses MongoDB with the following key collections:
- **Users** - Authentication and user management
- **Products** - African-inspired gift catalog
- **Cart Items** - Shopping cart functionality
- **Orders** - Order management and tracking
- **Payments** - Payment processing with Stripe
- **Addresses** - Delivery addresses in Ghana

## 🚀 Quick Setup Options

### Option 1: MongoDB Atlas (Recommended for Production)

1. **Create MongoDB Atlas Account**
   ```bash
   # Visit https://cloud.mongodb.com/
   # Sign up for a free account
   ```

2. **Create a Cluster**
   - Choose "M0 Sandbox" for free tier
   - Select a region close to Ghana (Europe recommended)
   - Create cluster

3. **Configure Database Access**
   - Go to "Database Access" → "Add New Database User"
   - Choose username/password authentication
   - Give user "Read and write to any database" role

4. **Configure Network Access**
   - Go to "Network Access" → "Add IP Address"
   - For development: Add "0.0.0.0/0" (allow from anywhere)
   - For production: Add specific IP addresses

5. **Get Connection String**
   ```bash
   # Format: mongodb+srv://username:password@cluster.mongodb.net/singlespine_db?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB Installation

1. **Install MongoDB Community Edition**
   ```bash
   # macOS with Homebrew
   brew tap mongodb/brew
   brew install mongodb-community

   # Ubuntu/Debian
   sudo apt-get install -y mongodb

   # Windows - Download from mongodb.com
   ```

2. **Start MongoDB Service**
   ```bash
   # macOS
   brew services start mongodb/brew/mongodb-community

   # Ubuntu/Debian
   sudo systemctl start mongod

   # Windows
   net start MongoDB
   ```

3. **Create Database**
   ```bash
   mongosh
   use singlespine_db
   ```

## ⚙️ Environment Configuration

1. **Copy Environment File**
   ```bash
   cp .env.example .env
   ```

2. **Update DATABASE_URL**
   ```env
   # For MongoDB Atlas
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/singlespine_db?retryWrites=true&w=majority"

   # For Local MongoDB
   DATABASE_URL="mongodb://localhost:27017/singlespine_db"

   # For Local MongoDB with Auth
   DATABASE_URL="mongodb://username:password@localhost:27017/singlespine_db"
   ```

## 🔧 Prisma Setup

1. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

2. **Push Schema to Database**
   ```bash
   npm run db:push
   ```

3. **Test Database Connection**
   ```bash
   npm run tsx lib/test-db.ts
   ```

## 🌱 Seed Database with African Products

1. **Run Seeding Script**
   ```bash
   npm run db:seed
   ```

2. **Verify Data**
   ```bash
   # Check in MongoDB Compass or mongosh
   mongosh
   use singlespine_db
   db.products.countDocuments()
   db.users.findOne({role: "ADMIN"})
   ```

## 📊 MongoDB Schema Specifics

### Key Differences from PostgreSQL

1. **Object IDs**: Uses MongoDB ObjectIds instead of UUIDs
   ```typescript
   id: String @id @default(auto()) @map("_id") @db.ObjectId
   ```

2. **No Foreign Key Constraints**: MongoDB doesn't enforce foreign keys
   ```typescript
   userId: String @db.ObjectId
   ```

3. **Array Fields**: Native support for arrays
   ```typescript
   images: String[]
   tags: String[]
   ```

4. **JSON Fields**: Native support for embedded documents
   ```typescript
   dimensions: Json?
   metadata: Json?
   ```

### Collections Structure

```javascript
// Users Collection
{
  _id: ObjectId,
  name: "John Doe",
  email: "john@example.com",
  role: "USER",
  createdAt: ISODate,
  updatedAt: ISODate
}

// Products Collection
{
  _id: ObjectId,
  name: "Premium Ghanaian Cocoa Powder",
  slug: "premium-ghanaian-cocoa-powder",
  price: 45.00,
  images: ["image1.jpg", "image2.jpg"],
  category: "food-beverages",
  tags: ["cocoa", "ghanaian", "premium"],
  origin: "Ghana",
  vendor: "Kuapa Kokoo Cooperative"
}
```

## 🔍 Database Operations

### Common Queries

```javascript
// Find all products from Ghana
db.products.find({origin: "Ghana"})

// Find products by category
db.products.find({category: "food-beverages"})

// Find user's cart items
db.cart_items.find({userId: ObjectId("...")})

// Find orders by status
db.orders.find({status: "PENDING"})
```

### Indexes for Performance

```javascript
// Create indexes for better performance
db.products.createIndex({category: 1})
db.products.createIndex({origin: 1})
db.products.createIndex({slug: 1}, {unique: true})
db.users.createIndex({email: 1}, {unique: true})
db.orders.createIndex({userId: 1})
db.cart_items.createIndex({userId: 1})
```

## 🛠️ Development Tools

### MongoDB Compass (GUI)
- Download from: https://www.mongodb.com/products/compass
- Connect using your DATABASE_URL

### mongosh (CLI)
```bash
# Install
npm install -g mongosh

# Connect
mongosh "mongodb://localhost:27017/singlespine_db"
# or
mongosh "mongodb+srv://username:password@cluster.mongodb.net/singlespine_db"
```

### VS Code Extensions
- MongoDB for VS Code
- Prisma

## 🚨 Troubleshooting

### Common Issues

1. **Connection Timeout**
   ```bash
   # Check network access in MongoDB Atlas
   # Verify IP whitelist includes your IP
   ```

2. **Authentication Failed**
   ```bash
   # Verify username/password in Atlas
   # Check DATABASE_URL format
   ```

3. **Prisma Client Not Generated**
   ```bash
   npm run db:generate
   # or
   npx prisma generate
   ```

4. **Schema Push Fails**
   ```bash
   # Check DATABASE_URL is correct
   # Verify MongoDB is running (local)
   # Check Atlas cluster status
   ```

### Debug Commands

```bash
# Test database connection
npm run tsx lib/test-db.ts

# Check Prisma schema
npx prisma validate

# View generated client
npx prisma generate --help

# Reset database (careful!)
# npx prisma db push --force-reset
```

## 🔐 Security Considerations

### Production Checklist

- [ ] Use strong passwords for database users
- [ ] Enable MongoDB authentication
- [ ] Restrict network access to specific IPs
- [ ] Use TLS/SSL connections
- [ ] Regular database backups
- [ ] Monitor database performance
- [ ] Implement rate limiting
- [ ] Validate all user inputs

### Environment Variables Security

```bash
# Never commit .env files
echo ".env" >> .gitignore

# Use different databases for different environments
DATABASE_URL_DEV="mongodb://localhost:27017/singlespine_dev"
DATABASE_URL_PROD="mongodb+srv://prod-user:password@prod-cluster.mongodb.net/singlespine_prod"
```

## 📈 Performance Optimization

### Indexing Strategy

```javascript
// Essential indexes for Singlespine
db.products.createIndex({category: 1, origin: 1})
db.products.createIndex({isFeatured: 1, isActive: 1})
db.products.createIndex({tags: 1})
db.orders.createIndex({userId: 1, createdAt: -1})
db.cart_items.createIndex({userId: 1, productId: 1})
```

### Query Optimization

```typescript
// Use projection to limit returned fields
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
    images: true
  }
})

// Use pagination for large datasets
const products = await prisma.product.findMany({
  skip: (page - 1) * limit,
  take: limit
})
```

## 🌍 Ghana-Specific Considerations

### Regional Settings
- Database timezone: UTC (convert to Ghana Standard Time in application)
- Currency: Ghana Cedis (GHS)
- Address format: Support for Ghana Post GPS codes

### Data Localization
- Product origins across Ghana regions
- Local vendor information
- Ghana-specific shipping zones
- Mobile Money integration preparation

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Prisma MongoDB Guide](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review application logs
3. Test database connection independently
4. Check MongoDB Atlas status (if using Atlas)
5. Verify all environment variables are set correctly

---

**Happy coding! 🇬🇭❤️**
