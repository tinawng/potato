// https://mongoosejs.com/docs/guide.html

import mongoose from 'mongoose';
import unique_validator from 'mongoose-unique-validator';
import { db_lotus } from '../../../mongoose.config.js';

const Schema = mongoose.Schema;

let user_schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  group_id: { type: Schema.Types.ObjectId, default: mongoose.Types.ObjectId("5ff62bb147e45db48b7b7ff4") },
},
  {
    collection: 'users'
  }
)
user_schema.plugin(unique_validator, { message: 'Name already in use.' });

export default db_lotus.model('User', user_schema);