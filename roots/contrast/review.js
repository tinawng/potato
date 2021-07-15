import review_model from './models/Review.js';
import { hasPermission, isOwner } from "./index.js";

export default async function (app, opts) {
  // ➕ Create new review(s)
  app.post("/", async (req, res) => {
    if (req.is_auth) {
      console.log(req.body);
      req.body = Array.isArray(req.body) ? req.body : [req.body];
      for (let i = 0; i < req.body.length; i++) {
        let sample = req.body[i];
        
        const found_review = await review_model.findOne({ sample_id: sample.sample_id, user_id: req.user_id })

        // ✏️ Update if user already published a review for this recording.
        if (found_review) {
          const review = await (await opts.ky_local.put("contrast/review/" + found_review._id, { json: sample })).json()
          res.code(200).send(review);
        }
        else {
          const review = new review_model({ user_id: req.user_id, ...sample });
          await review.save();
          res.code(201).send(review);
        }
      }
    }
    else
      res.code(401).send({ message: "No logged user 🔒" });
  });
  // ✏️ Edit review
  app.put("/:review_id", async (req, res) => {
    if (await hasPermission(req.user_id, "review.modify") || await isOwner(req.user_id, req.params.review_id))
      res.code(200).send(await review_model.findOneAndUpdate({ _id: req.params.review_id }, { content: req.body.content, date: Date.now() }));
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  });
  // 🗑️ Deleting review
  app.delete("/:review_id", async (req, res) => {
    if (await hasPermission(req.user_id, "review.delete") || await isOwner(req.user_id, req.params.review_id)) {
      await review_model.deleteOne({ _id: req.params.review_id });
      res.code(200).send({ message: "Review deleted 🗑️" });
    }
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  });
  // 📄 List all review
  app.get("/", async (req, res) => {
    if (await hasPermission(req.user_id, "review.*"))
      res.code(200).send(await review_model.find({}))
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  })

  app.get("/sample/:sample_id", async (req, res) => {
    if (req.is_auth)
      res.code(200).send(await review_model.find({ sample_id: req.params.sample_id }).exec());
    else
      res.code(401).send({ message: "No logged user 🔒" });
  });
  app.get("/user/:user_id", async (req, res) => {
    if (await hasPermission(req.user_id, "review.*") || await isOwner(req.user_id, req.params.user_id))
      res.code(200).send(await review_model.find({ user_id: req.params.user_id }).exec());
    else
      res.code(401).send({ message: "No logged user 🔒" });
  });
}