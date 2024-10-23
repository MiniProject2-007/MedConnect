const mongoose = require("mongoose");

const connect = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://peerconnect:qJTydqDftpDe8fbt@miniproject.0jlsl.mongodb.net/PeerConnect?retryWrites=true&w=majority&appName=MiniProject"
        );

        console.log("Connected to the database");
    } catch (err) {
        console.log("Error connecting to the database");
        console.log(err);
    }
};


module.exports = connect;