import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://anurag:9370272066@cluster0.vymousg.mongodb.net/food-del').then(()=>console.log("DB Connected"));
}