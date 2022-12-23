const upload = async (req, res, next) => {
  try {
    if (req.files) {
      next();
    } else {
      return res.status(400).json({ msg: "Upload failed.", success: false });
    }
  } catch (err) {
    return res.status(500).json({ msg: err?.message, success: false });
  }
};

module.exports = { upload };
