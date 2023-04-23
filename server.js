const express = require("express");
const mongoose = require("mongoose");
const app = express();
const { createServer } = require('http');
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
const downloadRoutes = require("./Routes/downloadRouter/downloadRouter");
const directoriesRoutes = require("./Routes/directoriesRoutes/directoriesRoutes");
const walletRoutes = require('./Routes/walletRoutes/walletRoutes')

const socketServer = require('./Middleware/Socket');
const User = require('./Model/userModel/User');
const Fragments = require('./Model/fragmentsModel/Fragments');
//Dotenv configuration
const dotenv = require("dotenv");
dotenv.config();

//Connect to atlas cluster database

// const schedule = require("node-schedule");
// const Device = require("./Model/deviceModel/Device");

// schedule.scheduleJob("* * * * *", async () => {
//   let date = new Date();

//   await Device.updateMany(
//     { updated_at: { $lte: date.setHours(date.getHours() - 1) } },
//     // { updated_at: { $lte: Date.now() } },

//     { status: 0 }
//   ).then((res) => console.log(res));
// });

mongoose.connect(
  process.env.DB_CONNECTION,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    // console.log("Successufully connected to database .");
    // Fragments.find({'updates.devices.device_id': '640f882ff4ba6d7236a3cd24'}).then(result=> {
    //   console.log(result)
    // })
    const PORT = process.env.PORT || 3002;
    const httpServer = createServer(app);
    socketServer.init(httpServer);
    const server = httpServer.listen(PORT, (sss) => {
      console.log(`Express is running on port ${server.address().port}`);
    });
  }
);

app.use(cors(corsOptions));
app.use(cors());
app.use("*" , (req, res, next) => {
  console.log('new request: ', req.baseUrl, req.body)
  next();
})
// app.get("/files/:filename", function(req, res){
//     res.sendFile(path.join(__dirname, 'uploadedFiles') + "/" + req.params.filename);
// });
app.use("/files", express.static(path.join(__dirname, "uploadedFiles")));
app.use(express.json());
app.use(cookieParser());

//Use Routes
app.use(userRoutes);
app.use(uploadFileRoutes);
app.use(deviceRoutes);
app.use(downloadRoutes);
app.use(directoriesRoutes);
app.use(walletRoutes);

//Use body parser
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(bodyParser.json());


//////////////////////CRON JOB/////////////////////////
// var CronJob = require('cron').CronJob;
// var job = new CronJob(
//   '* 0 * * *',
//   function() {
       // Fragments.updateMany( {isDirectory: false, isDeleted: false},{$inc:{weight: -100}}).then(success => {
       //  Fragments.find({weight: {$lt: 1}}).then(files => {
            // files.map(async (file) => {
            //   const sended = await socketServer.sendDeleteOffer({
            //     user_id: file.user_id,
            //     _id: file._id, 
            //     filename: file.filename, 
            //     updated_at: file.updated_at, 
            //     category: file.category               
            //   })
            //   if (sended) {
            //     file.weight = 1000;
            //     file.save();
            //   }
            // })
       //    socketServer.sendDeleteOffer(res);
       //  })
       // })
//     console.log('You will see this message every day 00:00:00');
//   },
//   null,
//   true,
//   'America/Los_Angeles'
// );
// Use this if the 4th param is default value(false)
// job.start()