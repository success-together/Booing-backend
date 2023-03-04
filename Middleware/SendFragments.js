const Fragments = require("../Model/fragmentsModel/Fragments");
const User = require("../Model/userModel/User");
const socket = require('./Socket');
const SendFragments = async (newFrags, user_id, type, size, filename, thumbnail, category) => {
  // try {
    if (newFrags && user_id && type && size) {
      const frag = newFrags.map((ele)=>{return {...ele, fragment: ''}})
      console.log(newFrags.length)
      const Frags = new Fragments({
        updates: frag,
        user_id: user_id,
        thumbnail: thumbnail,
        size: size,
        type: type, //dont need
        filename: filename,
        category: category
      });
      const { _id } = await Frags.save();
      console.log("Fragments ready to send");
      const space = await socket.sendFragment(newFrags, user_id);
      
      //increase occpyCloud space
      for (let key in space) {
        User.updateOne({_id: key}, {$inc:{used_occupycloud: space[key]}}).then(res => {
          console.log(true)
        })
      }      
      //increase myCloud space
      const user = await User.findOneAndUpdate({_id: user_id}, {$inc: {used_mycloud: size}});
      return {_id, frag};
    }
};

module.exports = SendFragments;
