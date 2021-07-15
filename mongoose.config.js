// https://mongoosejs.com/docs/connections.html#multiple_connections

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
mongoose.set('useNewUrlParser', true);      // deprecation warning
mongoose.set('useUnifiedTopology', true);   // deprecation warning
mongoose.set('useCreateIndex', true);       // deprecation warning
mongoose.set('useFindAndModify', false);    // deprecation warning
mongoose.set('returnOriginal', false);

const db_auth = mongoose.createConnection('mongodb://' + process.env.MONGODB_HOST + '/auth');
// OLD
const db_garden = mongoose.createConnection('mongodb://' + process.env.MONGODB_HOST + '/garden');
const db_contrast = mongoose.createConnection('mongodb://' + process.env.MONGODB_HOST + '/contrast');
const db_yubin = mongoose.createConnection('mongodb://' + process.env.MONGODB_HOST + '/yubin');

export { db_auth, db_garden, db_contrast, db_yubin };