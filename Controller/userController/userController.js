const User = require("../../Model/userModel/User");
const bcrypt = require("bcryptjs");
const createToken = require("../../Helpers/createToken");


// User Signup
const signup = async(req, res) => {
    try {
        // get info
        const { name,
            email,
            phone,
            password,
            last_login,
            role,   
        } = req.body;

        // check fields
        if (!name || !email || !phone || !password || !role) {
            return res.status(400).json({ msg: "Fill in all the fields please ." });
        }

        //hash password 
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
        // Create a new User
        const user = new User({name: name, email: email, phone: phone , password: hashPassword, last_login: last_login, role: role})

        // Save the New User into the Database
        await user.save().then(() => {
            //Return success message and the user
            res.status(200).json({msg : "User signup does successfully .", success: true, data: user})
        })
        
    }
    catch(err) {
        //Return errors
        res.status(500).json({ msg: err, success: false });
    }

}

//User Signin
const signin = async(req,res) => {
    try {
        //get info
        const {email, password} = req.body
        
        //Check if the email exists in the database
        const user = await User.findOne({email})
        if(!user) {
            return res.status(400).json({
                 msg: "This email doesn't existe .", success: false });
        }
        // check password
      const passwordCheck = await bcrypt.compare(password, user.password);
      if (!passwordCheck)
      {
        return res.status(400).json({ msg: "Incorrect password", success: false });
      }
      const signinToken= createToken.signinToken({id: user._id})
      console.log(signinToken)
       // signing success
       return res.status(200).json({ msg: "User Singin does successuflly .", success: true, data: {user, signinToken } });
    }
    catch(err){
         //Return errors
         res.status(500).json({ msg: err, success: false });
    }

}

module.exports = {signup, signin}