const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to the database");
    } catch (err) {
        console.log("Error connecting to the database");
        console.log(err);
    }
};

module.exports = connect;
