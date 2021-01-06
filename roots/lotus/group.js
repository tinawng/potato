import group_model from './models/Group.js';
import { hasPermission } from "./index.js";

export default async function (app, opts) {
  app.get("/", async (req, res) => {
    if (await hasPermission(req.user_id, "group.manage"))
      res.code(200).send(await group_model.find({}));
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  });
  app.post("/create", async (req, res) => {
    if (await hasPermission(req.user_id, "group.manage")) {
      const group = new group_model(req.body);
      await group.save();
      res.code(201).send(group);
    }
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  });
  app.get("/:group_id", async (req, res) => {
    if (req.is_auth) {
      const group = await group_model.findById({ _id: req.params.group_id })
      const users = await user_model.find({ group_id: req.params.group_id }, "name")
      res.code(200).send({ ...group._doc, users })
    }
    else
      res.code(401).send({ message: "No logged user 🔒" });
  })
  app.put("/:group_id", async (req, res) => {
    if (await hasPermission(req.user_id, "group.manage"))
      res.code(200).send(await group_model.findOneAndUpdate({ '_id': req.params.group_id }, req.body));
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  });
}