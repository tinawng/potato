// https://mongoosejs.com/docs/connections.html#multiple_connections

import dotenv from 'dotenv';
dotenv.config(); // preload env vars

import mongoose from 'mongoose';
mongoose.set('useCreateIndex', true); // deprecation warning otherwise

const db_garden = mongoose.createConnection('mongodb://' + process.env.MONGODB_HOST + '/garden', { useNewUrlParser: true, useUnifiedTopology: true });
const db_records = mongoose.createConnection('mongodb://' + process.env.MONGODB_HOST + '/records', { useNewUrlParser: true, useUnifiedTopology: true });

export { db_garden, db_records };