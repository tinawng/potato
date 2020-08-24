import dotenv from 'dotenv';
import fastify from 'fastify';
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken';

dotenv.config();

const app = fastify()
app.listen(8082, '0.0.0.0', (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("serv on 3k");
})

// app.addHook('preValidation', (req, res, done) => {
//   console.log('on every request');
//   done()
// })



// Decorate request with a 'user' property
app.decorateRequest('is_auth', '')

// Update our property
app.addHook('preHandler', (req, rep, done) => {
  req.is_auth = false;

  if (req.headers.authorization)
    try {
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.SECRET);
      req.is_auth = true;
    } catch (error) {
      rep.code(401).send({ message: "Invalid Token. 💔 Please, signin again! " });
    }

  done()
})
// And finally access it
app.get('/', (req, reply) => {
  if (req.is_auth)
    reply.send("You're in 🔓")
  else
    reply.send("You're out 🔒")
})

// app.get('/', function (req, res) {
//   res.send("Hi there 👋");
// })

import root_cmd from './roots/cmd/index.js';
app.register(root_cmd, { prefix: "/cmd" });
import root_mongo from './roots/mongo/index.js';
app.register(root_mongo, { prefix: "/mongo" });
import root_records from './roots/records/index.js';
app.register(root_records, { prefix: "/records" });

