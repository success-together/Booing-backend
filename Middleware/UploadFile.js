const multer = require("multer")


const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploadedFiles")
    },
    filename: (req, file, cb) => {
        const nameArr = file.originalname.split('.');
        const extension = nameArr.pop();
        cb(null, nameArr.join(".")+"_"+Date.now()+"."+extension)
    },
})
const upload = multer({storage: fileStorageEngine})

module.exports = upload