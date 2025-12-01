import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from './models/Client.js';
import Product from './models/Product.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const client = await Client.findOne();
        const product = await Product.findOne();

        if (client) {
            console.log('Client ID:', client._id);
            console.log('Client Name:', client.name);
            console.log('Client Total Dues:', client.totalDues);
            console.log('Client User ID:', client.userId);
        } else {
            console.log('No client found');
        }

        if (product) {
            console.log('Product ID:', product._id);
            console.log('Product Name:', product.name);
            console.log('Product Stock:', product.stock);
            console.log('Product Price:', product.sellingPrice);
        } else {
            console.log('No product found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
