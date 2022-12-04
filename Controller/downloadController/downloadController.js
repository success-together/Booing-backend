const { downloadFile } = require("../../Middleware/DownloadFile");
const Fragments = require("../../Model/fragmentsModel/Fragments");


//Download File
const download = async (req, res) => {
    try {
        const { user_id } = req.body;
        if (!user_id) {
            return res.status(400).json({ msg: "user not found", success: false })
        }
        const fragments = await Fragments.find({ user_id: user_id })
        if (!fragments) return res.status(400).json({ msg: "no fragment found", success: false });
        let fileBase64 = ""
        let extension = ""
        fragments.forEach((item) => {
            item.updates.forEach((update) => {
                extension = update.fileName.slice(update.fileName.lastIndexOf(".") + 1, update.fileName.length)
                fileBase64 += update.fragment
            });
        })
        const result = downloadFile(fileBase64, extension);
        if(result)
        {
            return res.status(200).json({msg: "file downloaded successfully", success: true})
        }
        return res.status(400).json({msg: result, success: false})


    }
    catch (err) {
        return res.status(400).json({ msg: err?.message, success: false })

    }

}

module.exports = {download}