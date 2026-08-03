import express from 'express'
import cors from 'cors' 
import 'dotenv/config'
import DbConnectionSql from './db/index.js'
import { ConnectionMongoDB } from './db/mdb/index.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')))

// Import routes SQL
import userRoutes from './routes/user.routes.js'
import categoryRoutes from './routes/catagorie.routes.js'
import productRoutes from './routes/product.routes.js'
import wishlistRoutes from './routes/wishlist.routes.js'
import cartRoutes from './routes/cart.routes.js'
import addressRoutes from './routes/address.routes.js'
import orderRoutes from './routes/order.routes.js'
app.use('/api/users', userRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/orders', orderRoutes)



if (process.env.DATA_BASE_TYPE === 'sql') {
    console.log('Using SQL database');
    // Use SQL database connection and routes

try {
    DbConnectionSql().then(() => {
        app.listen(5000, () => {
            console.log('Server is running on port 5000');
        });
    }).catch(error => {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    });
} catch (error) {
    console.error('Unexpected error during database connection:', error);
}
} else if (process.env.DATA_BASE_TYPE === 'mongodb') {
    console.log('Using MongoDB database');
    // Use MongoDB connection and routes
    try {
        ConnectionMongoDB().then(() => {
            app.listen(5000, () => {
                console.log('Server is running on port 5000');
            });
        }).catch(error => {
            console.error('Failed to connect to MongoDB:', error);
            process.exit(1);
        });
    } catch (error) {
        console.error('Unexpected error during MongoDB connection:', error);
        process.exit(1);
    }
} else {
    console.error('Invalid DATA_BASE_TYPE specified in environment variables. Please set it to either "sql" or "mongodb".');
    process.exit(1);
}
    