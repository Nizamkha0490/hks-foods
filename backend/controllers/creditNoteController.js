import CreditNote from "../models/CreditNote.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// GET CREDIT NOTES BY CLIENT
export const getCreditNotesByClient = asyncHandler(async (req, res) => {
    if (!req.admin || !req.admin._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const creditNotes = await CreditNote.find({
            clientId: req.params.clientId,
            userId: req.admin._id,
            isDeleted: false
        })
            .populate("items.productId", "name")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            creditNotes,
        });
    } catch (error) {
        console.error("Error fetching credit notes:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching credit notes",
        });
    }
});

// CREATE CREDIT NOTE (Manual Return)
export const createCreditNote = asyncHandler(async (req, res) => {
    if (!req.admin || !req.admin._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const { clientId, items, totalAmount, type, orderId } = req.body;

        // Import Product and Client models
        const Product = (await import("../models/Product.js")).default;
        const Client = (await import("../models/Client.js")).default;
        const Order = (await import("../models/Order.js")).default;

        let orderNo = "";
        if (orderId) {
            const order = await Order.findById(orderId);
            if (order) {
                orderNo = order.orderNo;
            }
        }

        // Restock products for returned items
        if (items && items.length > 0) {
            for (const item of items) {
                if (item.productId && item.qty) {
                    await Product.findByIdAndUpdate(item.productId, {
                        $inc: { stock: item.qty }
                    });
                }
            }
        }

        // Deduct amount from customer's totalDues
        if (clientId && totalAmount) {
            await Client.findByIdAndUpdate(clientId, {
                $inc: { totalDues: -totalAmount }
            });
        }

        const creditNote = await CreditNote.create({
            clientId,
            type: type || "return",
            items,
            totalAmount,
            userId: req.admin._id,
            status: "pending",
            orderId,
            orderNo
        });

        res.status(201).json({
            success: true,
            message: "Credit Note created successfully",
            creditNote,
        });
    } catch (error) {
        console.error("Error creating credit note:", error);
        res.status(500).json({
            success: false,
            message: "Error creating credit note",
        });
    }
});

// UPDATE CREDIT NOTE STATUS
export const updateCreditNoteStatus = asyncHandler(async (req, res) => {
    if (!req.admin || !req.admin._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const { status } = req.body;
        const creditNote = await CreditNote.findOneAndUpdate(
            { _id: req.params.id, userId: req.admin._id },
            { status },
            { new: true }
        );

        if (!creditNote) {
            return res.status(404).json({ success: false, message: "Credit Note not found" });
        }

        res.json({
            success: true,
            message: "Credit Note status updated",
            creditNote,
        });
    } catch (error) {
        console.error("Error updating credit note status:", error);
        res.status(500).json({
            success: false,
            message: "Error updating credit note status",
        });
    }
});

// UPDATE CREDIT NOTE (Items and Amount)
export const updateCreditNote = asyncHandler(async (req, res) => {
    if (!req.admin || !req.admin._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const { items, totalAmount } = req.body;

        // Fetch existing credit note
        const existingCreditNote = await CreditNote.findOne({
            _id: req.params.id,
            userId: req.admin._id
        });

        if (!existingCreditNote) {
            return res.status(404).json({ success: false, message: "Credit Note not found" });
        }

        // Import Product and Client models
        const Product = (await import("../models/Product.js")).default;
        const Client = (await import("../models/Client.js")).default;

        // Handle Stock Updates if items are changing
        if (items !== undefined) {
            // Reverse old stock changes
            if (existingCreditNote.items && existingCreditNote.items.length > 0) {
                for (const item of existingCreditNote.items) {
                    if (item.productId && item.qty) {
                        await Product.findByIdAndUpdate(item.productId, {
                            $inc: { stock: -item.qty }  // Reverse the old increase
                        });
                    }
                }
            }

            // Apply new stock changes
            if (items && items.length > 0) {
                for (const item of items) {
                    if (item.productId && item.qty) {
                        await Product.findByIdAndUpdate(item.productId, {
                            $inc: { stock: item.qty }  // Apply new increase
                        });
                    }
                }
            }
        }

        // Handle Amount Updates if totalAmount is changing
        if (totalAmount !== undefined) {
            // Reverse old amount change
            if (existingCreditNote.clientId && existingCreditNote.totalAmount) {
                await Client.findByIdAndUpdate(existingCreditNote.clientId, {
                    $inc: { totalDues: existingCreditNote.totalAmount }  // Add back old amount
                });
            }

            // Apply new amount change
            if (existingCreditNote.clientId) {
                await Client.findByIdAndUpdate(existingCreditNote.clientId, {
                    $inc: { totalDues: -totalAmount }  // Deduct new amount
                });
            }
        }

        // Update the credit note
        const updatedCreditNote = await CreditNote.findByIdAndUpdate(
            req.params.id,
            { items, totalAmount },
            { new: true }
        ).populate("items.productId", "name");

        res.json({
            success: true,
            message: "Credit Note updated successfully",
            creditNote: updatedCreditNote,
        });
    } catch (error) {
        console.error("Error updating credit note:", error);
        res.status(500).json({
            success: false,
            message: "Error updating credit note",
        });
    }
});

// DELETE CREDIT NOTE (Soft Delete with Reversal)
export const deleteCreditNote = asyncHandler(async (req, res) => {
    if (!req.admin || !req.admin._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        // First, fetch the credit note to get its details before deletion
        const creditNote = await CreditNote.findOne({
            _id: req.params.id,
            userId: req.admin._id
        });

        if (!creditNote) {
            return res.status(404).json({ success: false, message: "Credit Note not found" });
        }

        // Import Product and Client models
        const Product = (await import("../models/Product.js")).default;
        const Client = (await import("../models/Client.js")).default;

        // Reverse stock changes - decrease stock by returned quantities
        if (creditNote.items && creditNote.items.length > 0) {
            for (const item of creditNote.items) {
                if (item.productId && item.qty) {
                    await Product.findByIdAndUpdate(item.productId, {
                        $inc: { stock: -item.qty }  // Decrease stock (reverse the increase)
                    });
                }
            }
        }

        // Reverse amount changes - increase totalDues back
        if (creditNote.clientId && creditNote.totalAmount) {
            await Client.findByIdAndUpdate(creditNote.clientId, {
                $inc: { totalDues: creditNote.totalAmount }  // Add back to dues
            });
        }

        // Now soft delete the credit note
        await CreditNote.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true }
        );

        res.json({
            success: true,
            message: "Credit Note deleted successfully and changes reversed",
        });
    } catch (error) {
        console.error("Error deleting credit note:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting credit note",
        });
    }
});
