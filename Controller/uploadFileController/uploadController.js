

const upload = async (req, res) => {
    try{
    if(req.files)
    {
    console.log(req.files);
    return res.status(200).json({msg: "File uploaded successfully .", success: true})
    }
    return res.status(400).json({msg: "Upload failed.", success: false})
}
catch(err){
    return res.status(500).json({msg : err.message, success: false})
}
}

module.exports = {upload}