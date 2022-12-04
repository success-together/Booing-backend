const Fragments = require('../Model/fragmentsModel/Fragments')
const SendFragments = async (newFrags,user_id) => {
    try{

        if (newFrags && user_id){
            console.log("Fragmentsto send : ",newFrags);
            const Frags = new Fragments({updates:newFrags,user_id : user_id}) 
            await Frags.save().then(() => {
                console.log("frags", Frags);
                console.log("Fragments sent successfully.")
            })
        }
        return("failed to send fragments, no fragments received!")
    }
    catch(err) {
        return err.message
    }
    

}

module.exports = SendFragments