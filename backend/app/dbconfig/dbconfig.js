import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config();

const connectDb = async(req,res)=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("mongoDB connected successfully")
        
    }catch(error){
        console.log("error connecting database ", error)
        process.exit(1);
    }
};

export default connectDb;