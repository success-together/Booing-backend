const { Schema, model } = require('mongoose')

const planSchema = new Schema({
    name: {
        type: String,
        required: true,

    },
    cost: {
        type: Number,
        require: true,
    },
    created_at: {
        type: Date,
      },
      updated_at: {
        type: Date,
      }
})

const Plan = model('Plan', planSchema)
module.exports = Plan;