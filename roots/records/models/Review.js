// https://mongoosejs.com/docs/guide.html

import mongoose from 'mongoose';
import { db_records } from '../../../mongo.js';

const Schema = mongoose.Schema;

let review_schema = new Schema({
  album_id: { type: Schema.Types.ObjectId, required: true },
  user_id: { type: Schema.Types.ObjectId, required: true },
  comment: { type: String, default: "" },
  rating: { type: Number, default: -1 },
},
  {
    collection: 'reviews'
  }
)

export default db_records.model('Reviewx', review_schema);