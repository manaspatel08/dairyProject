import express from 'express'
import dotenv from 'dotenv'
import connectDb from './app/dbconfig/dbconfig.js'
import setUpRoutes from './app/routes/index.js';
import cors from 'cors';
import "./app/cron/subscriptionCron.js";
import path from 'path'

dotenv.config();

const app=express();

const PORT = process.env.PORT || '5000'
const HOST = process.env.HOST || '0.0.0.0'  

app.use(express.json());
 
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://dairy-project-cj2e.vercel.app",
  "https://dairy-project-kohl.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
}));

// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// app.use( express.static('uploads'));
connectDb()
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
setUpRoutes(app);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running at :${PORT}`);
});