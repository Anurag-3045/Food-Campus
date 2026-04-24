import nodemailer from "nodemailer";
import userModel from "../models/userModel.js";

let transporterPromise = null;

const createTransporter = async () => {
    // Prefer real SMTP from env (production-ready)
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: Number(process.env.EMAIL_PORT) === 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    // Dev-friendly fallback: Ethereal test SMTP (no real inbox delivery)
    const testAccount = await nodemailer.createTestAccount();
    console.log("SMTP not configured. Using Ethereal test account for emails.");
    console.log("Ethereal user:", testAccount.user);

    return nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};

const getTransporter = async () => {
    if (!transporterPromise) {
        transporterPromise = createTransporter();
    }
    return transporterPromise;
};

const resolveOrderEmail = async (order) => {
    if (order?.userId) {
        const user = await userModel.findById(order.userId).lean();
        if (user?.email) return user.email;
    }
    return null;
};

const formatOrderItemsText = (items = []) =>
    items
        .map(
            (item) =>
                `${item.name || "Item"} x ${item.quantity ?? 1} - ₹${item.price ?? 0}`
        )
        .join("\n");

export const sendOrderPlacedEmail = async (order) => {
    try {
        const transporter = await getTransporter();
        const to = await resolveOrderEmail(order);
        if (!to) return;

        const orderDate = new Date(order.date || Date.now()).toLocaleString();
        const itemsText = formatOrderItemsText(order.items);

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "Food Campus <no-reply@food-campus.local>",
            to,
            subject: `Your Food Campus order ${order._id} has been placed`,
            text: [
                `Hi,`,
                ``,
                `Thank you for your order on Food Campus.`,
                ``,
                `Order ID: ${order._id}`,
                `Placed at: ${orderDate}`,
                `Amount: ₹${order.amount}.00`,
                ``,
                `Items:`,
                itemsText,
                ``,
                `Current status: ${order.status}`,
                ``,
                `You can track this order in the app under "My Orders".`,
                ``,
                `Regards,`,
                `Food Campus`,
            ].join("\n"),
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) console.log("Order placed email preview:", previewUrl);
    } catch (err) {
        console.log("Error sending order placed email:", err.message);
    }
};

export const sendOrderDeliveredEmail = async (order) => {
    try {
        const transporter = await getTransporter();
        const to = await resolveOrderEmail(order);
        if (!to) return;

        const orderDate = new Date(order.date || Date.now()).toLocaleString();
        const itemsText = formatOrderItemsText(order.items);

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "Food Campus <no-reply@food-campus.local>",
            to,
            subject: `Your Food Campus order ${order._id} has been delivered`,
            text: [
                `Hi,`,
                ``,
                `Good news! Your order on Food Campus has been delivered.`,
                ``,
                `Order ID: ${order._id}`,
                `Placed at: ${orderDate}`,
                `Amount: ₹${order.amount}.00`,
                ``,
                `Items:`,
                itemsText,
                ``,
                `Status: Delivered`,
                ``,
                `Thank you for ordering with Food Campus!`,
                ``,
                `Regards,`,
                `Food Campus`,
            ].join("\n"),
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) console.log("Order delivered email preview:", previewUrl);
    } catch (err) {
        console.log("Error sending order delivered email:", err.message);
    }
};

