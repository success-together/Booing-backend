const Fragments = require("../Model/fragmentsModel/Fragments");
const SendFragments = async (newFrags, user_id, type, size) => {
  try {
    if (newFrags && user_id && type && size) {
      console.log(type);
      // console.log("Fragments to send : ",newFrags);
      const Frags = new Fragments({
        updates: newFrags,
        user_id: user_id,
        type: type,
        size: size,
      });
      const { _id } = await Frags.save();
      console.log("Fragments ready to send");
      console.log("Sending fragments to the devices...");
      console.log("fragments sent successfully.");
      return _id;
    }
    throw new Error("failed to send fragments, no fragments received!");
  } catch (err) {
    if (err.code === "ERR_OUT_OF_RANGE") {
      throw err;
    }

    throw Error("something went wrong");
  }
};

module.exports = SendFragments;
