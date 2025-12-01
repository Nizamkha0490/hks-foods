import Counter from "../models/Counter.js";
import Payment from "../models/Payment.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// Cleanup old counter documents and rebuild
export const cleanupCounters = asyncHandler(async (req, res) => {
    if (!req.admin || !req.admin._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        // Drop the old index on 'key' field
        try {
            await Counter.collection.dropIndex("key_1");
            console.log("Dropped old key_1 index");
        } catch (error) {
            console.log("key_1 index doesn't exist or already dropped");
        }

        // Delete all old counter documents with key field
        const deleteResult = await Counter.deleteMany({ key: { $exists: true } });
        console.log(`Deleted ${deleteResult.deletedCount} old counter documents`);

        // Also delete any documents with null userId
        const deleteNullUserId = await Counter.deleteMany({ userId: null });
        console.log(`Deleted ${deleteNullUserId.deletedCount} counter documents with null userId`);

        // Find the highest payment number for this user
        const lastPayment = await Payment.findOne({ userId: req.admin._id })
            .sort({ createdAt: -1 })
            .select('paymentNo');

        let startSeq = 0;
        if (lastPayment && lastPayment.paymentNo) {
            // Extract number from PAY0001 format
            const match = lastPayment.paymentNo.match(/PAY(\d+)/);
            if (match) {
                startSeq = parseInt(match[1], 10);
                console.log(`Found last payment: ${lastPayment.paymentNo}, starting from ${startSeq + 1}`);
            }
        }

        // Set or update the payment counter for this user
        await Counter.findOneAndUpdate(
            { name: "paymentNo", userId: req.admin._id },
            { $set: { seq: startSeq } },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: "Counter cleanup completed successfully",
            deletedOld: deleteResult.deletedCount,
            deletedNullUserId: deleteNullUserId.deletedCount,
            paymentCounterSet: startSeq
        });
    } catch (error) {
        console.error("Cleanup error:", error);
        res.status(500).json({
            success: false,
            message: "Error during cleanup: " + error.message
        });
    }
});
