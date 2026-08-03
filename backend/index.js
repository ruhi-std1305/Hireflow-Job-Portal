import express         from "express";
import cookieParser     from "cookie-parser";
import cors             from "cors";
import dotenv           from "dotenv";
import connectDB        from "./utils/db.js";
import userRoute        from "./routes/user.route.js";
import jobRoute         from "./routes/job.route.js";
import companyRoute     from "./routes/company.route.js";
import applicationRoute from "./routes/application.route.js";
import savedJobRoute    from "./routes/savedJob.route.js";
import adminRoute       from "./routes/admin.route.js";

dotenv.config({});

const app = express();

// resume/company-logo base64 হিসেবে JSON body তে আসে, তাই default 100kb
// limit বাড়িয়ে দেওয়া লাগবে — নাহলে বড় ফাইল upload এ 413 error আসে
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

const corsOptions = {
  origin:      "http://localhost:5173",
  credentials: true,
  exposedHeaders: ["Content-Disposition"], // resume download filename পড়ার জন্য দরকার
};
app.use(cors(corsOptions));

const PORT = process.env.PORT || 5000;

app.use("/api/auth",         userRoute);
app.use("/api/jobs",         jobRoute);
app.use("/api/companies",    companyRoute);
app.use("/api/applications", applicationRoute);  
app.use("/api/saved-jobs",   savedJobRoute);
app.use("/api/admin",        adminRoute);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running at port ${PORT}`);
});