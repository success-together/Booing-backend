const { Schema, model } = require('mongoose')

const deviceSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User', 
    },
    created_at: {
        type: Date,
      },
      updated_at: {
        type: Date,
      }
})

const Device = model('Device', deviceSchema)
module.exports = Device;