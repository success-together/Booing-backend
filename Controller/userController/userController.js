const User = require("../../Model/userModel/User");
const bcrypt = require("bcryptjs");
const createToken = require("../../Helpers/createToken.js");
const { sendEmailRegister, sendMail } = require("../../Helpers/nodeMailer/Mailer");


// User Signup
const signup = async (req, res) => {
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
        const findUser = await User.findOne({ email })
        if (findUser) {
            return res.status(400).json({ msg: "This email already exists .", success: false });
        }
        //hash password 
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
        // Create a new User
        let code = Math.floor(Math.random() * 9000 + 1000);
        const user = new User({ name: name, email: email, phone: phone, password: hashPassword, code: code })

        // Save the New User into the Database
        await user.save().then(() => {
            //Return success message and the user
            let text ="This is an email to confirm your account created on <b>Booing</b> application. Copy the <b>code</b> below to continue your signup operation."
            sendMail(email, " Confirm your email adress. ", text, code)
            return res.status(200).json({ msg: "Code sent succussefuly, check your email .", success: true, data: user })
        })

    }
    catch (err) {
        //Return errors
        res.status(500).json({ msg: err.message, success: false });
    }

}

//User Signin
const signin = async (req, res) => {
    try {
        //get info
        const { email, password } = req.body

        //Check if the email exists in the database
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                msg: "This email doesn't exist .", success: false
            });
        }
        // check password
        const passwordCheck = await bcrypt.compare(password, user.password);
        if (!passwordCheck) {
            return res.status(400).json({ msg: "Incorrect password", success: false });
        }
        if (user.accountVerified === false) {
            return res.status(400).json({ msg: "Account not verified", success: false });
        }
        const signinToken = createToken.signinToken({ id: user._id })
        console.log(signinToken)
        user = await User.findOneAndUpdate({ email }, { last_login: Date.now() }).select("-password")
        // signing success
        return res.status(200).json({ msg: "User Singin does successuflly .", success: true, data: { user, signinToken } });
    }
    catch (err) {
        //Return errors
        res.status(500).json({ msg: err.message, success: false });
    }

}

// Code verification
const codeVerification = async (req, res) => {
    try {
        const { user_id, code, isSignup } = req.body

        let user = await User.findById(user_id)
        if (!user) {
            return res.status(400).json({ msg: "Signup error. please, try to create your account again.", success: false });
        }
        if (code === user.code && isSignup) {
            user = await User.findOneAndUpdate({ _id: user_id }, { accountVerified: true, code: 0 }, { new: true }).select("-password")
            return res.status(200).json({ msg: "Signup code matchs .", success: true, data: user });
        }
        else if (code === user.code && !isSignup){
            user = await User.findOneAndUpdate({ _id: user_id }, { code: 0 }, { new: true })
            return res.status(200).json({ msg: "Reset code matchs .", success: true, data: user });
        }
        return res.status(400).json({ msg: "Incorrect code", success: false });

    } catch (err) {
        //Return errors
        res.status(500).json({ msg: err.message, success: false });
    }
}

// update user profile
const updateProfile = async (req, res) => {
    try {
        // get new info
        const { name, phone,user_id } = req.body
        //update
        if (name || phone) {
            const user = await User.findByIdAndUpdate({ _id: user_id }, { name, phone }, { new: true }).select("-password")
            //success
            return res.status(200).json({ msg: "Profile updates does successfully.", success: true, data: user });
        }
        return res.status(400).json({ msg: "No data found. failed to update profile.", success: false });
    } catch (err) {
        return res.status(500).json({ msg: err.message, success: flase });
    }
}

//Update user password
const updatePassword = async (req, res) => {
    try {
        // get new password
        const { currentPassword, newPassword,user_id } = req.body;
        //get User
        const user = await User.findById(user_id)

        if (!user)
            return res.status(400).json({ msg: "User not found .", success: false })

        //check password
        const passwordCheck = await bcrypt.compare(currentPassword, user.password);
        if (!passwordCheck)
            return res.status(400).json({ msg: "Current password doesn't match.", success: false });

        // hash password
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(newPassword, salt);

        // update password
        await User.findOneAndUpdate({ _id: user_id }, { password: hashPassword })

        // update success
        return res.status(200).json({ msg: "password updated successfully", success: true });
    } catch (err) {
        return res.status(500).json({ msg: err.message, success: false });
    }
}

const forgotPassword = async (req, res) => {
    try {

        // get email
        const { email } = req.body;

        // check email
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ msg: "This email doesn't exist.", success: false })
        }
        let code = Math.floor(Math.random() * 9000 + 1000);
        //update user code
        user = await User.findOneAndUpdate({email: email}, {code: code}, {new: true}).select("-password")
        let text ="This is an email to confirm your request to reset your password on <b>Booing</b> application. Copy the <b>code</b> below to continue your reset operation."
        sendMail(email, " Reset Password. ", text, code)
        return res.status(200).json({ msg: "Code sent succussefuly, check your email .", success: true, data: user })

    }
    catch (err) {
        return res.status(500).json({ msg: err.message, success: false });
    }
}

module.exports = { signup, signin, codeVerification, updateProfile, updatePassword, forgotPassword }