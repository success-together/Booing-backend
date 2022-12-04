 //Download file
 const fs = require('fs')

const downloadFile = (fileBase64, extension) => {

    let buffer = Buffer.from(fileBase64, "base64")
    fs.writeFileSync(`./downloadedFiles/${Date.now()}_image.${extension}`, buffer)
    return(true)
}

module.exports = {downloadFile}