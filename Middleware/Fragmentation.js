const fs = require('fs')
const { file } = require('googleapis/build/src/apis/file')

const fragmentation = async (req, res) => {

    let noad = 40// number of available devices

    let files = req.files // get files
    files.forEach((file, index) => {
        console.log(file);
        let encodedFile64 = fs.readFileSync(file.path, { encoding: 'base64' })
        let base64File = encodedFile64
        let lengthFile64 = encodedFile64.length
        let sliceLength = Math.trunc(lengthFile64 / noad)
        let i = 0
        let fragment = ""
        let fragments = []
        console.log("lengthFile64 : ", lengthFile64)
        console.log("sliceLength : ", sliceLength)
        while (i < lengthFile64 - sliceLength) {
            // j++
            // console.log("lengthFile64 : ", lengthFile64);
            console.log("i = ", i)
            fragment = encodedFile64.slice(i, i + sliceLength)
            //   if(lengthFile64 - i <= sliceLength)
            // //   {
            // //     // console.log("Extra fragment : ", encodedFile64.slice(lengthFile64, lengthFile64))
            // //     fragment = fragment + encodedFile64.slice(i, lengthFile64)
            // //     // console.log("extra fragment["+j+"] : ", fragments)
            // //   }
            //   console.log("fragment : ", fragment)
            fragments.push(fragment)
            i = (i + sliceLength)

            // console.log("part 1, length " + part1.length)
            // console.log("part 2, length " + part2.length)

        }
        fragments[fragments.length - 1] = fragments[fragments.length - 1] + encodedFile64.slice(i, lengthFile64)
        // fragments.push(encodedFile64.slice(i, lengthFile64))
        console.log("file " + index + " fragments : ", fragments.length)
        console.log("file " + index + " fragments : ", fragments)
        // console.log("fragment N 763",fragments[763])
        // console.log("fragment N 764",fragments[764])
        // console.log("fragment N 765",fragments[765])
        // console.log("fragment N 766",fragments[766])

        //Download file

        // let buffer = Buffer.from(base64File, "base64")
        // let extension = file.mimetype.slice(file.mimetype.indexOf("/") + 1, file.mimetype.length)
        // fs.writeFileSync(`./downloadedFiles/${Date.now()}_image.${extension}`, buffer, function (err) {
        //     if (err)
        //         console.log(err);
        //     else
        //         console.log("file created.");
        // })

    })






}

module.exports = fragmentation