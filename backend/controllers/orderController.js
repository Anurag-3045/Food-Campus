import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import { sendOrderPlacedEmail, sendOrderDeliveredEmail } from "../utils/emailService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)


// placing user order from frontend
const placeOrder = async (req, res) =>{

    const frontend_url = process.env.FRONTEND_URL || req.headers.origin || "http://localhost:5173";

    try {
        const newOrder = new orderModel({
            userId: req.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        })

        await newOrder.save();
        await userModel.findByIdAndUpdate(req.userId, {cartData: {}});

        const line_items = req.body.items.map((item)=> ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.name,
                },
                // Stripe expects amount in the smallest currency unit (paise for INR)
                unit_amount: Math.round(Number(item.price) * 100)
            },
            quantity: Number(item.quantity)
        }))

        const deliveryCharge = 0;
        if (deliveryCharge > 0) {
            line_items.push({
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: "Delivery Charges"
                    },
                    unit_amount: Math.round(deliveryCharge * 100)
                },
                quantity: 1
            });
        }

        const session = await stripe.checkout.sessions.create({
            line_items: line_items, 
            mode: 'payment',
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        })

        res.json({success: true, session_url: session.url})

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message || "Error"})
        
    }
}

const verifyOrder = async (req, res) => {
    const {orderId, success} = req.body;
    try {
        if (success == "true") {
            const paidOrder = await orderModel.findByIdAndUpdate(
                orderId,
                {payment: true},
                {new: true}
            );

            // Send order placed email only after successful payment
            if (paidOrder) {
                sendOrderPlacedEmail(paidOrder).catch((err) =>
                    console.log("Order placed email error:", err?.message)
                );
            }
            res.json({success: true, message: "Paid"})
        }
        else{
            await orderModel.findByIdAndDelete(orderId);
            res.json({success: false, message: "Not Paid"})
        }
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error"})
        
    }
}

// user orders for frontend
const userOrders = async (req, res) =>{
    try {
        const orders = await orderModel.find({userId: req.userId}).sort({ date: -1 });
        res.json({success: true, data: orders})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error"})
    }
}

// Listing orders for admin panel
const listOrders = async(req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ date: -1 });
        res.json({success: true, data:orders})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error"})
    }
}

// api for updating order status
const updateStatus = async (req, res) =>{
    try {
        const updatedOrder = await orderModel.findByIdAndUpdate(
            req.body.orderId,
            {status: req.body.status},
            {new: true}
        );

        if (updatedOrder && req.body.status === "Delivered") {
            sendOrderDeliveredEmail(updatedOrder).catch((err) =>
                console.log("Order delivered email error:", err?.message)
            );
        }

        res.json({success: true, message: "Status Updated"})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error"})
    }
}

export {placeOrder, verifyOrder, userOrders, listOrders, updateStatus}