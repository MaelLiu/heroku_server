const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
    coralLabel:{
        type: Number,
        required: true,
    },
    coralType:{
        type: String,
        required: true,
    },
    coralPosition:{
        type: String,
        required: true,
    },
    coralPutDate:{
        type: Date,
        required: true,
    },
    coralRecoveryDays:{
        type: Number,
        required: true,
    },
    coralBelong:{
        type: String,
        required: false,
    },
    coralStatus:{
        type: String,
        required: true,
    },
});

const Test = mongoose.model("Test", testSchema);
module.exports = Test;