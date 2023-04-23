const Fragments = require("../Model/fragmentsModel/Fragments");
const User = require("../Model/userModel/User");
const File = require("../Model/fileModel/File");
const socket = require('./Socket');
const SendFragments = async (newFrags, user_id, type, size, filename, thumbnail, category) => {
  if (newFrags && user_id && type && size) {
    // try {
      //send fragment to devices
      console.log("Fragments ready to send, fragments length is ", newFrags.length);
      const space = await socket.sendFragment(newFrags, user_id);

      //increase occpyCloud space
      console.log("+occupy_cloud -> ", space)
      for (let key in space) {
        User.findOneAndUpdate({_id: key}, {$inc:{used_occupycloud: space[key], traffic_cloud: space[key]}}).then(user => {
          const fullRate = user['used_occupycloud']/(user['occupy_cloud']*1000000000);
          if (fullRate > 0.9) {
            socket.sendMoreSpaceOffer(user['_id'], Math.round(fullRate*100));
          }
        })
      }

      //increase myCloud space
      User.findOneAndUpdate({_id: user_id}, {$inc: {used_mycloud: size}}).then(user => {
        console.log("used total mycloud, ", user.used_mycloud);
      });

      const frag = newFrags.map((ele)=>{return {...ele, fragment: ''}})
      const Frags = new Fragments({
        updates: frag,
        user_id: user_id,
        thumbnail: thumbnail,
        size: size,
        type: type,
        filename: filename,
        category: category,
        openedAt: Date.now()
      });

      //save fragments info to database
      const files = await File.insertMany(frag);
      const updates = [];
      for (var i = 0; i < files.length; i++) {
        updates.push(files[i]['_id']);
      }
      Frags['updates'] = updates;
      const { _id } = await Frags.save();
      console.log(_id, 'ddd')
      return {_id, frag};
    // }
  }
};

module.exports = SendFragments;
