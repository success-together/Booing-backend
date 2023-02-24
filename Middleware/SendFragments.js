const Fragments = require("../Model/fragmentsModel/Fragments");
const {getCategoryByType} = require("../Middleware/CheckMimetype");
const socket = require('./Socket');
const SendFragments = async (newFrags, user_id, type, size, filename) => {
  // try {
    if (newFrags && user_id && type && size) {
      // console.log("Fragments to send : ",newFrags);
      const category = getCategoryByType(type);
      const frag = newFrags.map((ele)=>{return {...ele, fragment: ''}})
      console.log(newFrags.length)
      const Frags = new Fragments({
        updates: frag,
        user_id: user_id,
        type: type, //dont need
        size: size,
        filename: filename,
        category: category
      });
      const { _id } = await Frags.save();
      console.log("Fragments ready to send");
      const state = await socket.sendFragment(newFrags);
      return {_id, frag};
    }
  //   throw new Error("failed to send fragments, no fragments received!");
  // } catch (err) {
  //   if (err.code === "ERR_OUT_OF_RANGE") {
  //     throw err;
  //   }

  //   throw Error("something went wrong");
  // }
};

module.exports = SendFragments;
