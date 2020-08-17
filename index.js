import dotenv from 'dotenv';
import fastify from 'fastify';
import mongoose from 'mongoose'

dotenv.config();

const app = fastify()
app.listen(3000, '0.0.0.0', (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("serv on 3k");
})

if (process.env.MONGODB_HOST) {
  mongoose.connect('mongodb://' + process.env.MONGODB_HOST + '/garden', { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function () {
    // we're connected!
    console.log("mongonected!")
  });
  mongoose.set('useCreateIndex', true);
}


app.get('/', function (req, res) {
  res.send("Hi there 👋");
})

import root_cmd from './roots/cmd/index.js'
app.register(root_cmd, { prefix: "/cmd" })
import root_mongo from './roots/mongo/index.js'
app.register(root_mongo, { prefix: "/mongo" })

