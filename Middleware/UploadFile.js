const multer = require("multer")


const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploadedFiles")
    },
    filename: (req, file, cb) => {
        cb(null, req.params.user_id+"_"+file.originalname)
    },
})
const upload = multer({storage: fileStorageEngine})

module.exports = upload