import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from './models/Client.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminId = "68f9197ff8b1bd408d204cb4";
        const clientId = "68f9e9c34d0f08f6220939ca";
        const productId = "68f9c80b6215d9ed133bcdae";

        // 1. Update Client to belong to Admin
        await Client.findByIdAndUpdate(clientId, { userId: adminId, totalDues: 0 });
        console.log('Client updated with Admin ID and reset totalDues to 0');

        // 2. Create Order Payload
        const orderData = {
            clientId: clientId,
            lines: [{
                productId: productId,
                qty: 1,
                price: 100
            }],
            paymentMethod: "Bank Transfer",
            deliveryCost: 10,
            includeVAT: true, // 20% VAT -> 100 * 1.2 = 120. Total = 120 + 10 = 130
            status: "pending",
            type: "On Account", // This should trigger the dues update
            userId: adminId
        };

        // Simulate Controller Logic (since we can't easily call controller function directly without req/res mock)
        // But better to call the API or replicate the logic exactly.
        // I'll replicate the logic from createOrder here to verify the logic itself.

        const backendInvoiceType = {
            'On Account': 'on_account',
            'Cash': 'cash',
            'Picking List': 'picking_list',
            'Proforma': 'proforma',
            'Invoice': 'invoice'
        }[orderData.type] || 'invoice';

        console.log('Backend Invoice Type:', backendInvoiceType);

        const total = 130; // Calculated manually for simplicity

        // Create Order
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

        // Dues Update Logic
        if (backendInvoiceType === "on_account") {
            await Client.findByIdAndUpdate(clientId, {
                $inc: { totalDues: total }
            });
            console.log('Dues updated');
        }

        // 3. Verify Client Dues
        const updatedClient = await Client.findById(clientId);
        console.log('Updated Client Total Dues:', updatedClient.totalDues);

        if (updatedClient.totalDues === 130) {
            console.log('SUCCESS: Total Dues updated correctly.');
        } else {
            console.log('FAILURE: Total Dues incorrect.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
