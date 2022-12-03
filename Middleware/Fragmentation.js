const fs = require('fs')
const { file } = require('googleapis/build/src/apis/file');
const { fields } = require('./UploadFile');
const devices = require('../Controller/deviceController/deviceController');
const Device = require('../Model/deviceModel/Device');
const SendFragments = require('../Middleware/SendFragments')


const fragmentation = async (req, res) => {

    // Get connected user
    let user_id = req.params.user_id
    
    // Get available devices 
    let availableDevices = await devices.getDevices()
    console.log("Available devices : ", availableDevices);
    let noad = availableDevices?.length // Number of availble devices
    console.log("Number of available devices : ", noad);
    // get files
    let files = req.files 
    files.forEach((file, index) => {
        console.log(file)

        // Convert file to bytes (base64)
        let encodedFile64 = fs.readFileSync(file.path, { encoding: 'base64' })
        let lengthFile64 = encodedFile64.length //Number of bytes
        let sliceLength = Math.trunc(lengthFile64 / noad)
        let i = 0
        let j = 0
        let fragment = ""
        let fragmentPath= {}
        let fragments = []
        console.log("length of the file (base64) : ", lengthFile64)
        console.log("encodedFile64", encodedFile64);
        console.log("Fragment length : ", sliceLength)
        
        //Divide the file over the number of available devices
        while (i < lengthFile64 - sliceLength) {
            fragment = encodedFile64.slice(i, i + sliceLength)
            let device_id = availableDevices[j]._id;
            fragmentPath = {fragmentID: j, fragment: fragment, fileName: file.filename, user_id: user_id, device: device_id,isUploaded : false , isDownloaded : false}
            fragments.push(fragmentPath)
            i = (i + sliceLength)
            j++

        }
        //push the last fragment with the extra fragment if exists
        fragments[fragments.length - 1].fragment = fragments[fragments.length - 1].fragment + encodedFile64.slice(i, lengthFile64)
        console.log("file " + index + " fragments : ", fragments.length)
        console.log("file " + index + " fragments : ", fragments)        
        console.log("Fragments ready to send")
        console.log("Sending fragments to the devices...");
        SendFragments(fragments,user_id)
       
    })






}

module.exports = fragmentation