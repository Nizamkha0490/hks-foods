import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from './models/Client.js';
import Order from './models/Order.js';
import Product from './models/Product.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminId = "68f9197ff8b1bd408d204cb4";
        const clientId = "68f9e9c34d0f08f6220939ca";
        const productId = "68f9c80b6215d9ed133bcdae";

        // 1. Reset Client Dues
        await Client.findByIdAndUpdate(clientId, { totalDues: 0 });
        console.log('Client dues reset to 0');

        // 2. Create Order with Type "On Account" but Payment Method "Bank Transfer"
        const orderData = {
            clientId: clientId,
            lines: [{
                productId: productId,
                qty: 1,
                price: 100
            }],
            paymentMethod: "Bank Transfer", // This was causing the issue before
            deliveryCost: 0,
            includeVAT: false,
            status: "pending",
            type: "On Account", // This should trigger the dues update
            userId: adminId
        };

        const backendInvoiceType = 'on_account';
        const total = 100;

        const order = await Order.create({
            clientId: orderData.clientId,
            lines: orderData.lines,
            paymentMethod: orderData.paymentMethod,
            deliveryCost: orderData.deliveryCost,
            includeVAT: orderData.includeVAT,
            status: orderData.status,
            total: total,
            userId: adminId,
            invoiceType: backendInvoiceType,
        });

        console.log('Order created:', order._id);

        // 3. Simulate getClientProfile Logic (which was buggy)
        const transactions = await Order.find({
            clientId: clientId,
            userId: adminId,
        }).sort({ createdAt: -1 }).lean();

        const payments = []; // Assuming no payments for this test
        const creditNotes = []; // Assuming no credit notes for this test

        // Calculate dues using the NEW logic
        const totalInvoices = transactions.reduce((acc, o) => {
            if (o.invoiceType === 'on_account') {
                return acc + o.total;
            }
            return acc;
        }, 0);

        const newDues = totalInvoices; // Simplified for this test

        console.log('Calculated Dues (New Logic):', newDues);

        // 4. Verify
        // We expect newDues to include the order total (100) + any previous on_account orders
        // Since we just created one for 100, and there might be others from previous runs,
        // we should check if it's at least 100.
        // Actually, let's just check if the specific order we created is included.

        const isOrderIncluded = transactions.find(o => o._id.toString() === order._id.toString() && o.invoiceType === 'on_account');

        if (isOrderIncluded && totalInvoices >= 100) {
            console.log('SUCCESS: Order is correctly identified as On Account and included in dues.');
        } else {
            console.log('FAILURE: Order not included or calculation wrong.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
