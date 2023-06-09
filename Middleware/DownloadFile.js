//Download file
const fs = require("fs");

const downloadFile = async (fileBase64, extension, fileName) => {
  try {
    let buffer = Buffer.from(fileBase64, "base64");
    fs.writeFileSync(
      `./downloadedFiles/${fileName}.${extension}`,
      buffer
    );
    return buffer;
  } catch (err) {
    console.log(err.message);
    return err.message;
  }
};

module.exports = { downloadFile };
