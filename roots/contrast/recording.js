import { hasPermission, isOwner } from "./index.js";
import recording_model from './models/Recording.js';
import sample_model from './models/Sample.js';
import review_model from './models/Review.js';
import user_model from './models/User.js';

export default async function (app, opts) {
  // 📄 List all recordings with author infos & samples_number
  app.get("/", async (req, res) => {
    if (req.is_auth) {
      const condition = await hasPermission(req.user_id, "recording.see-hidden") ? {} : { is_hidden: false };
      let recordings = await recording_model.find(condition).exec();

      for (let i = 0; i < recordings.length; i++) {
        recordings[i] = {
          ...recordings[i]._doc,
          "author": await getAuthor(recordings[i].user_id),
          "samples_number": await getSamplesNumber(recordings[i]._id),
        }
      }

      res.code(200).send(recordings);
    }
    else
      res.code(401).send({ message: "No logged user 🔒" });
  });
  // ➕ Create new recording
  app.post("/", async (req, res) => {
    if (await hasPermission(req.user_id, "recording.create")) {
      const recording = new recording_model({ user_id: req.user_id, ...req.body });
      await recording.save();
      res.code(201).send(recording);
    }
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  });
  // 📄 Get recording infos
  app.get("/:recording_id", async (req, res) => {
    if (req.is_auth) {
      let recording = await recording_model.findById(req.params.recording_id);
      recording = { ...recording._doc, "samples_number": await getSamplesNumber(recording._id) };
      res.code(200).send(recording);
    }
    else
      res.code(401).send({ message: "No logged user 🔒" });
  });
  // 🔧 Modify recording
  app.put("/:recording_id", async (req, res) => {
    if (await hasPermission(req.user_id, "recording.modify") || await isOwner(req.user_id, req.params.recording_id))
      res.code(200).send(await recording_model.findOneAndUpdate({ _id: req.params.recording_id }, req.body));
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  })
  // 🗑️ Delete recording
  app.delete("/:recording_id", async (req, res) => {
    if (await hasPermission(req.user_id, "recording.delete") || await isOwner(req.user_id, req.params.recording_id)) {
      // 🔍 Finding all recording samples
      const samples = await sample_model.find({ recording_id: req.params.recording_id }).exec();
      // 🗑️ Deleting samples
      samples.forEach(async (sample) => {
        await opts.ky_local.delete("contrast/sample/" + sample._id);
      })
      // 🗑️ Deleting recording
      await recording_model.deleteOne({ _id: req.params.recording_id });

      res.code(200).send({ message: "Recording, samples & reviews files deleted 🗑️" });
    }
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  });

  // 💿 Get all recordings of a given user
  app.get("/user/:user_id", async (req, res) => {
    if (await hasPermission(req.user_id, "recording.*") || await isOwner(req.user_id, req.params.user_id)) {
      const recordings = await recording_model.find({ user_id: req.params.user_id });
      for (let i = 0; i < recordings.length; i++) {
        recordings[i] = {
          ...recordings[i]._doc,
          "reviews_number": await getReviewsNumber(recordings[i]._id),
          "samples_number": await getSamplesNumber(recordings[i]._id),
        }
      }

      res.code(200).send(recordings);
    }
    else
      res.code(401).send({ message: "No logged user 🔒" });
  });
  // ✏️ Get all reviews for a given recording
  app.get("/reviews/:recording_id", async (req, res) => {
    if (await hasPermission(req.user_id, "recording.*") || await isOwner(req.user_id, req.params.recording_id)) {
      const samples = await sample_model.find({ recording_id: req.params.recording_id });
      let reviews = [];
      for (let i = 0; i < samples.length; i++) {
        reviews.push(await review_model.find({ sample_id: samples[i]._id }));
      }

      res.code(200).send(reviews);
    }
    else
      res.code(401).send({ message: "No logged user 🔒" });
  });

  app.get("/is_reviewed/:recording_id", async (req, res) => {
    if (req.is_auth) {
      const samples = await sample_model.find({ recording_id: req.params.recording_id }).exec();

      var found = false;
      for (let i = 0; i < samples.length; i++) {
        const sample = samples[i];
        await review_model.find({ user_id: req.user_id, sample_id: sample.id }, (err, review) => {
          found = review.length > 0 ? true : found;
        })
      }

      res.code(200).send(found)
    }
    else
      res.code(401).send({ message: "No logged user 🔒" });
  });

  // 📄 List all registered products
  app.get("/products", async (req, res) => {
    if (req.is_auth) {
      var recordings = await recording_model.find({}, 'product')
      var products = [...new Set(recordings.map(el => el.product))];

      res.code(200).send(products);
    }
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  });
}

async function getReviewsNumber(recording_id) {
  let reviews_number = 0
  const samples = await sample_model.find({ recording_id: recording_id });
  for (let i = 0; i < samples.length; i++) {
    reviews_number += await review_model.countDocuments({ sample_id: samples[i]._id });
  }
  return reviews_number;
}
async function getSamplesNumber(recording_id) {
  return await sample_model.countDocuments({ "recording_id": recording_id });
}
async function getAuthor(recording_user_id) {
  return (await user_model.findById(recording_user_id, "-_id firstname lastname department profile_picture"))._doc;
}