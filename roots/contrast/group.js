import user_model from './models/User.js';
import group_model from './models/Group.js';
import { hasPermission } from "./index.js";

export default async function (app, opts) {
  // ➕ Create new group
  app.post("/create", async (req, res) => {
    if (await hasPermission(req.user_id, "group.create")) {
      const group = new group_model(req.body);
      await group.save();
      res.code(201).send(group);
    }
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  });
  // 📄 List all groups
  app.get("/", async (req, res) => {
    
    if (req.is_auth) {
      const params = await hasPermission(req.user_id, "group.*") ? "" : "_id name";
      res.code(200).send(await group_model.find({}, params));
    }
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  });
  // 📄 List all registered group names
  app.get("/name_list", async (req, res) => {
    if (req.is_auth) {
      var groups = await group_model.find({}, "name");
      groups = [...new Set(groups.map(group => group.name))];
      groups = groups.filter(group => group != 'op');
      res.code(200).send(groups);
    }
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  });
  // 📄 List all users in the group
  app.get("/users/:group_id", async (req, res) => {
    if (await hasPermission(req.user_id, "group.see")) 
      res.code(200).send(await user_model.find({ group_id: req.params.group_id }, "-password"));
    else
      res.code(401).send({ message: "No logged user 🔒" });
  });
  // ✏️ Edit group
  app.put("/:group_id", async (req, res) => {
    if (await hasPermission(req.user_id, "group.modify"))
      res.code(200).send(await group_model.findOneAndUpdate({ '_id': req.params.group_id }, req.body));
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  });
}