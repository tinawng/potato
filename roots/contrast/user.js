import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { hasPermission } from "./index.js";
import user_model from './models/User.js';

export default async function (app, opts) {
  // 🔑 Log in user
  app.post("/login", async (req, res) => {
    let user = null;
    if (req.body.email)
      user = await user_model.findOne({ email: req.body.email });

    if (!user || !bcrypt.compareSync(req.body.password, user.password)) return res.code(401).send({ message: "Authentication failed 🔒" });

    const jwt_token = jwt.sign({ user_id: user._id }, process.env.SECRET);

    delete user._doc.password;
    res.code(200).send({ token: jwt_token, user: user });
  })
  // ➕ Create new user
  app.post("/create", async (req, res) => {
    if (await hasPermission(req.user_id, "user.create")) {
      const hash = bcrypt.hashSync(req.body.password, 10);
      const user = new user_model({ ...req.body, password: hash });
      await user.save();

      delete user._doc.password;
      res.code(201).send(user);
    }
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  })
  // 📄 List all users
  app.get("/", async (req, res) => {
    if (await hasPermission(req.user_id, "user.modify"))
      res.code(200).send(await user_model.find({}, '-password'))
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  })
  // 📄 Get user infos
  app.get("/:user_id", async (req, res) => {
    const params = await hasPermission(req.user_id, "user.modify") || await isOwner(req.user_id, req.params.user_id) ? "-password" : "lastname firstname department profile_picture";
    res.code(200).send(await user_model.findById(req.params.user_id, params))
  });
  // 🔨 Modify user
  app.put("/:user_id", async (req, res) => {
    if (await hasPermission(req.user_id, "user.modify") || await isOwner(req.user_id, req.params.user_id)) {
      var user = await user_model.findOneAndUpdate({ '_id': req.params.user_id }, req.body);
      
      delete user._doc.password;
      res.code(200).send(user);
    }
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  });
  // 🗑️ Delete user
  app.delete("/:user_id", async (req, res) => {
    if (await hasPermission(req.user_id, "user.delete")) {
      await user_model.deleteOne({ _id: req.params.user_id });
      res.code(200);
    }
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  });

  // 📄 List all registered user departments
  app.get("/departments", async (req, res) => {
    if (req.is_auth) {
      var users = await user_model.find({}, 'department')
      var departments = [...new Set(users.map(el => el.department))];

      res.code(200).send(departments);
    }
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  });
}