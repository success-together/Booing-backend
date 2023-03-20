const User = require("../../Model/userModel/User");
const bcrypt = require("bcryptjs");
const multer = require('multer')
const createToken = require("../../Helpers/createToken.js");
const {
  // sendEmailRegister,
  sendMail,
} = require("../../Helpers/nodeMailer/Mailer");
const Wallet = require("../../Model/WalletModel/Wallet");
const imageThumbnail = require('image-thumbnail');

// User Signup
const signup = async (req, res) => {
  try {
    // get info
    const { name, email, phone, password } = req.body;
    // check fields
    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ msg: "Fill in all the fields please .", success: false });
    }
    //Check if the email already exists
    const findUser = await User.findOne({ email });
    if (findUser) {
      return res
        .status(400)
        .json({ msg: "This email already exists .", success: false });
    }
    //hash password
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    // Create a new User
    let code = Math.floor(Math.random() * 9000 + 1000);
    const user = new User({
      name: name,
      email: email,
      phone: phone,
      password: hashPassword,
      code: code,
    });

    // Save the New User into the Database
    const savedUser = await user.save();
    //Return success message and the user
    let text =
      "This is an email to confirm your account created on <b>Booing</b> application. Copy the <b>code</b> below to continue your signup operation.";
    sendMail(email, " Confirm your email adress. ", text, code);
    console.log(code)
    // CREATE NEW USER WALLET
    const wallet = new Wallet({ user_id: savedUser._id });
    await wallet.save();
    return res.status(200).json({
      msg: "Code sent succussefuly, check your email .",
      success: true,
      data: user,
    });
  } catch (err) {
    //Return errors
    res.status(500).json({ msg: err.message, success: false });
  }
};

// Social Media Signup
const socialMediaSignup = async (req, res) => {
  try {
    // get info
    const { name, email, socialMedia_ID } = req.body;
    // check fields
    if (!name || !email || !socialMedia_ID) {
      return res
        .status(400)
        .json({ msg: "Fill in all the fields please .", success: false });
    }
    // Initiate User information
    const user = new User({
      name: name,
      email: email,
      phone: "0",
      socialMedia_ID: socialMedia_ID,
      password: "0",
      code: 0,
    });
    //Check if the email already exists
    const findUser = await User.findOne({ email });
    if (!findUser) {
      // return res.status(400).json({ msg: "This email already exists .", success: false });

      //hash password
      // const salt = await bcrypt.genSalt();
      // const hashPassword = await bcrypt.hash(password, salt);
      // Create a new User
      // let code = Math.floor(Math.random() * 9000 + 1000);

      // Save the New User into the Database
      await user.save().then(() => {

        // CREATE NEW USER WALLET
        const wallet = new Wallet({ user_id: user._id });
        wallet.save();

        //Return success message and the user
        // let text = "This is an email to confirm your account created on <b>Booing</b> application. Copy the <b>code</b> below to continue your signup operation."
        // sendMail(email, " Confirm your email adress. ", text, code)
        const signinToken = createToken.signinToken({ id: user._id });
        return res.status(200).json({
          msg: "User Login does successfully.",
          success: true,
          data: { user, signinToken },
        });
      });
    } else {
      const signinToken = createToken.signinToken({ id: findUser._id });
      return res.status(200).json({
        msg: "User already exist. Login does successfully.",
        data: { user: findUser, signinToken },
        success: true,
      });
    }
  } catch (err) {
    //Return errors
    return res.status(500).json({ msg: err.message, success: false });
  }
};

//User Signin
const signin = async (req, res) => {
  try {
    //get info
    const { email, password } = req.body;

    //Check if the email exists in the database
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        msg: "This email doesn't exist .",
        success: false,
      });
    }
    // check password
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return res
        .status(400)
        .json({ msg: "Incorrect password", success: false });
    }
    if (user.accountVerified === false) {
      return res
        .status(400)
        .json({ msg: "Account not verified", success: false });
    }
    const signinToken = createToken.signinToken({ id: user._id });
    user = await User.findOneAndUpdate(
      { email },
      { last_login: Date.now() }
    ).select("-password");
    // signing success
    return res.status(200).json({
      msg: "User Singin does successuflly .",
      success: true,
      data: { user, signinToken },
    });
  } catch (err) {
    //Return errors
    res.status(500).json({ msg: err.message, success: false });
  }
};

// Code verification
const codeVerification = async (req, res) => {
  try {
    const { user_id, code, isSignup } = req.body;
    let user = await User.findById(user_id);
    if (!user) {
      return res.status(400).json({
        msg: "Signup error. please, try to create your account again.",
        success: false,
      });
    }
    if (code === user.code && isSignup) {
      user = await User.findOneAndUpdate(
        { _id: user_id },
        { accountVerified: true, code: 0 },
        { new: true }
      ).select("-password");
      return res
        .status(200)
        .json({ msg: "Signup code matchs .", success: true, data: user });
    } else if (code === user.code && !isSignup) {
      user = await User.findOneAndUpdate(
        { _id: user_id },
        { code: 0 },
        { new: true }
      );
      return res
        .status(200)
        .json({ msg: "Reset code matchs .", success: true, data: user });
    }
    return res.status(400).json({ msg: "Incorrect code", success: false });
  } catch (err) {
    //Return errors
    res.status(500).json({ msg: err?.message, success: false });
  }
};

// update user profile
const updateProfile = async (req, res) => {
  try {
    // get new info
    const { name, phone, address, birth, user_id } = req.body;
    //update
    if (name || phone) {
      const user = await User.findByIdAndUpdate(
        { _id: user_id },
        { name, phone, address, birth },
        { new: true }
      ).select("-password");
      //success
      return res.status(200).json({
        msg: "Profile updates does successfully.",
        success: true,
        data: user,
      });
    }
    return res.status(400).json({
      msg: "No data found. failed to update profile.",
      success: false,
    });
  } catch (err) {
    console.log(err?.message)
    return res.status(500).json({ msg: err?.message, success: false });
  }
};

const updateProfilePic = async (req, res) => {
  const user_id = req.params.user_id;
  try {
    console.log(req.file)
    const encodedFile64 = req.file.buffer.toString("base64");
    const options = { width: 100, responseType: 'base64', fit: 'cover' }  
    let thumbnail = await imageThumbnail(encodedFile64, options);
    thumbnail = `data:${req.file.mimetype};base64,${thumbnail}`;
    User.findOneAndUpdate({_id: user_id}, {$set: {avatar: thumbnail}}).then(user => {
      res.json({
        success: true,
        msg: 'success',
        thumbnail: thumbnail
      })
    }).catch((err) => {
      res.status(400).json({
        success: false,
        msg: err,
      })
    })
  } catch {
      res.status(400).json({
        success: false,
        msg: "Something went to wrong!",
      })
  }
}

//Update user password
const updatePassword = async (req, res) => {
  try {
    // get new password
    const { currentPassword, newPassword, user_id, isForgotPassword } =
      req.body;
    //get User
    const user = await User.findById(user_id);

    if (!user)
      return res.status(400).json({ msg: "User not found .", success: false });

    if (!isForgotPassword) {
      //check password
      const passwordCheck = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!passwordCheck)
        return res
          .status(400)
          .json({ msg: "Current password doesn't match.", success: false });
    }

    // hash password
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(newPassword, salt);

    // update password
    await User.findOneAndUpdate({ _id: user_id }, { password: hashPassword });

    // update success
    return res
      .status(200)
      .json({ msg: "password updated successfully", success: true });
  } catch (err) {
    return res.status(500).json({ msg: err?.message, success: false });
  }
};

const forgotPassword = async (req, res) => {
  try {
    // get email
    const { email } = req.body;

    // check email
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "This email doesn't exist.", success: false });
    }
    let code = Math.floor(Math.random() * 9000 + 1000);
    //update user code
    user = await User.findOneAndUpdate(
      { email: email },
      { code: code },
      { new: true }
    ).select("-password");
    let text =
      "This is an email to confirm your request to reset your password on <b>Booing</b> application. Copy the <b>code</b> below to continue your reset operation.";
    sendMail(email, " Reset Password. ", text, code);
    return res.status(200).json({
      msg: "Code sent succussefuly, check your email .",
      success: true,
      data: user,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message, success: false });
  }
};

const getMembership = async (req, res) => {
  try {
    const { user_id } = req.params;

    let user = await User.findOne({ _id: user_id });
    if (!user) {
      return res.status(400).json({ 
        msg: "You must be logined.", 
        success: false 
      });
    }
    const now = new Date();
    const expire = new Date(user.mermbership.expire?user.mermbership.expire:Date.now());
    const leftMonth = (expire.getFullYear()-now.getFullYear())*12 + expire.getMonth()-now.getMonth()-1;
    if (leftMonth < 0) leftMonth = 0
    const result = Object.assign({}, user.mermbership);
    result.left = leftMonth;
    console.log(result)
    return res.status(200).json({
      msg: "Success getting Membership .",
      success: true,
      data: result,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message, success: false });
  }
}
const purchaseMembership = async (req, res) => {
  try {
    const { m_id, quantity, isMonth, user_id, offer, amount } = req.body; 
    let user = await User.findOne({ _id: user_id });
    if (!user) {
      return res.status(400).json({ 
        msg: "You must be logined.", 
        success: false 
      });
    }
    let space = 1;
    if (m_id === 'Pluse-100G') space = 100;
    if (m_id === 'Pluse-500G') space = 500;
    if (m_id === 'Pluse-1T') space = 1000;
    if (m_id === 'Pluse-5T') space = 5000;
    if (m_id === 'Pluse-10T') space = 10000;
    if (m_id === 'Pluse-50T') space = 50000;
    if (m_id === '2TB-Booing-Space') space = 2000;
    console.log(space)
    user.my_cloud = space
    user.mermbership.m_id = m_id;
    user.mermbership.start = Date.now();
    if (offer) {

    } else {
      //get expire date
        let now = new Date();
        let day = now.getDate();
        let month = now.getMonth() + 1;
        let year = now.getFullYear();
        //next date
        let nmonth = 0;
        let nyear = 0;
        if (isMonth) {
          let temp = month*1 + quantity;
          nyear = year*1 + Math.trunc(temp/12);
          nmonth = temp%12;
          if (nmonth < 10)  nmonth = `0${nmonth}`; 
        } else {
          nyear = year*1 + quantity;
          nmonth = month;
        }
      //end get expire date

      user.mermbership.expire = new Date(`${nyear}-${nmonth}-${day}`).getTime();
      user.mermbership.isMonth = isMonth;
      user.mermbership.quantity = quantity;
    }
    console.log(user)
    user.save().then( async success => {
        await Wallet.findOne({user_id: user_id}).then(wallet => {
          if (wallet) {
            wallet.transactions.push({
              status: 4,
              amount: amount*50000000,
              before: wallet.amount,
              after: wallet.amount,
              info: "",
            });
            wallet.updated_at = Date.now();
            wallet.save().then(async success => {
              return res.json({
                msg: `Purchase completed!`,
                success: true,
              })
            }).catch(err => {
              return res.json({
                msg: 'faild buying space',
                success: false,
              })
            })
          } else {
            return res.json({
              msg: 'faild buying space',
              success: false,
            })
          }
        })      
      return res.status(200).json({
        msg: "Purchase completed!",
        success: true,
      });
    }).catch(err => {
      console.log(err);
      return res.status(500).json({ msg: err.message, success: false });
    })
  } catch (err) {
    return res.status(500).json({ msg: err.message, success: false });
  }
}
module.exports = {
  signup,
  socialMediaSignup,
  signin,
  codeVerification,
  updateProfile,
  updatePassword,
  forgotPassword,
  getMembership,
  purchaseMembership,
  updateProfilePic,
};
