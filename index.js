import express, { json } from "express"
import cors from 'cors'
import connectDB from "./config/db.js"
import dotenv from "dotenv";
import router from "./routes/studymaterial.route.js";
import projectRoutes from "./routes/project.routes.js"
import path from "./routes/student.routes.js"
import eventRoutes from "./routes/event.routes.js";
dotenv.config();

const PORT = process.env.PORT || 3000

const app = express()
app.get('/', (req,res)=>{
    res.send('Hello World!')
})

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use("/public", express.static("public"));

//routes
app.use("/notes", router);
app.use("/projects", projectRoutes);
app.use("/events",eventRoutes)

//middleware
app.use(cors())
app.use(json())

//Student Routes
app.use("/student",path)
connectDB()

app.listen(PORT,()=>{
    console.log(`Server runing on http://localhost:${PORT}`);
    
})