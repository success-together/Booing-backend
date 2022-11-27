const express = require("express");
const mongoose = require("mongoose");
const app = express();

const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");

const corsOptions = {
  exposedHeaders: "Authorization",
};

//Get Routes
const userRoutes = require("./Routes/userRoutes/userRoutes");
const uploadFileRoutes = require("./Routes/uploadRoutes/uploadRoutes");
const deviceRoutes = require("./Routes/deviceRoutes/DeviceRoutes");

//Dotenv configuration
const dotenv = require("dotenv");
dotenv.config();

//Connect to atlas cluster database

const schedule = require("node-schedule");
const Device = require("./Model/deviceModel/Device");

schedule.scheduleJob("* * * * *", async () => {
  let date = new Date();

  await Device.updateMany(
    { updated_at: { $lte: date.setHours(date.getHours() - 1) } },
    // { updated_at: { $lte: Date.now() } },

    { status: 0 }
  ).then((res) => console.log(res));
});

mongoose.connect(
  process.env.DB_CONNECTION,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("Successufully connected to database .");
    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => {
      console.log(`Server is active on port ${PORT} .`);
    });
  }
);

app.use(cors(corsOptions));
app.use(cors());

app.use(express.json());
app.use(cookieParser());

//Use Routes
app.use(userRoutes);
app.use(uploadFileRoutes);
app.use(deviceRoutes);
//Use body parser
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));