const express = require('express')
const mongoose = require('mongoose')
const app = express();

const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path")

const corsOptions = {
    exposedHeaders: "Authorization",
};

//Get Routes

const userRoutes = require("./Routes/userRoutes/userRoutes")


//Dotenv configuration
const dotenv = require("dotenv");
dotenv.config();

//Connect to atlas cluster database
mongoose.connect(
    process.env.DB_CONNECTION,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (err) => {
        console.log("Successufully connected to database .");

        const PORT = 3001;
        app.listen(PORT, () => {
            console.log("Server is active .");
        });
    }
)


app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

//Use Routes
app.use(userRoutes)


//Use body parser
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(bodyParser.json({ limit: "10mb", extended: true }));