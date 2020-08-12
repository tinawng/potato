import mongoose from 'mongoose';

export default function (app) {
    mongoose.connect('mongodb://127.0.0.1/garden', { useNewUrlParser: true });

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        // we're connected!
        console.log("CONNECTED!")
    });
}