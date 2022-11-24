const {Router}= require('express');
const deviceController = require('../../Controller/deviceController/deviceController');
const Authentification = require('../../Middleware/Authentification');
const route = Router();

route.post(
  "/booing/logged-in-user/addDevice",
  Authentification,
  deviceController.addDevice
);

route.get(
  "/booing/logged-in-user/getDevices",
  Authentification,
  deviceController.getDevices
);

module.exports = route;