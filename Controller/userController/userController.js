const User = require("../../Model/userModel/User");
const bcrypt = require("bcryptjs");
const createToken = require("../../Helpers/createToken");
const { sendEmailRegister, sendMail } = require("../../Helpers/nodeMailer/Mailer");


// User Signup
const signup = async(req, res) => {
    try {
        // get info
        const { name,
            email,
            phone,
            password,  
        } = req.body;
        // check fields
        if (!name || !email || !phone || !password) {          
            return res.status(400).json({ msg: "Fill in all the fields please .", success: false });
        }
        //Check if the email already exists
        const findUser = await User.findOne({email})
        if(findUser)
        {
            return res.status(400).json({ msg: "This email already exists .", success: false });
        }
        //hash password 
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
        // Create a new User
        let code = Math.floor(Math.random() * 9000 + 1000);
        const user = new User({name: name, email: email, phone: phone , password: hashPassword, code: code})

        // Save the New User into the Database
        await user.save().then(() => {
            //Return success message and the user
              sendMail(email," Confirm your email adress. ", code)
              return res.status(200).json({msg : "Code sent succussefuly, check your email .", success: true, data: user})
        })
        
    }
    catch(err) {
        //Return errors
        res.status(500).json({ msg: err.message, success: false });
    }

}

//User Signin
const signin = async(req,res) => {
    try {
        //get info
        const {email, password} = req.body
        
        //Check if the email exists in the database
        let user = await User.findOne({email})
        if(!user) {
            return res.status(400).json({
                 msg: "This email doesn't exist .", success: false });
        }
        // check password
      const passwordCheck = await bcrypt.compare(password, user.password);
      if (!passwordCheck)
      {
        return res.status(400).json({ msg: "Incorrect password", success: false });
      }
      if (user.accountVerified === false)
      {
        return res.status(400).json({ msg: "Account not verified", success: false });
      }
      const signinToken= createToken.signinToken({id: user._id})
      console.log(signinToken)
      user = await User.findOneAndUpdate({email},{last_login:Date.now()})
       // signing success
       return res.status(200).json({ msg: "User Singin does successuflly .", success: true, data: {user, signinToken } });
    }
    catch(err){
         //Return errors
         res.status(500).json({ msg: err.message, success: false });
    }

}

// Code verification
const codeVerification = async (req,res) =>{
try{
    const {user_id, code} = req.body
    
    let user = await User.findById(user_id)
    if(!user)
    {
        return res.status(400).json({ msg: "Signup error. please, try to create your account again.", success: false });
    }
    
        user = await User.findOneAndUpdate({_id:user_id},{accountVerified:true, code:0 }, {new: true})
        return res.status(200).json({ msg: "Code matchs .", success: true, data: user });
   
    return res.status(400).json({ msg: "Incorrect code", success: false });

} catch(err) {
     //Return errors
     res.status(500).json({ msg: err.message, success: false });
}
}

module.exports = {signup, signin, codeVerification}