const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    user_name:{
        type: String,
        required: true,
    },
    user_password: {
        type: String,
        required: true,
    },
    user_corals: {
        type: [Number],
        required: true,
    },
    user_join: {
        type: String,
        required: true,
    },
    user_member: {
        type: Boolean,
        required: true,
    },
    user_words: {
        type: [String],
    },
    user_end_service: {
        type: Boolean,
        required: false,
    },
    user_end_service_date: {
        type: String,
        required: false,
    }
});

const User = mongoose.model("User", userSchema);
module.exports = User;