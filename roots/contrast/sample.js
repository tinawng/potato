import { v4 as uuid } from 'uuid';
import fs from 'fs';
import pump from 'pump';
import sample_model from './models/Sample.js';
import review_model from './models/Review.js';
import { hasPermission, isOwner } from "./index.js";

export default async function (app, opts) {
  // 📄 List all samples
  app.get("/", async (req, res) => {
    if (await hasPermission(req.user_id, "recording.*"))
      res.code(200).send(await sample_model.find());
    else
      res.code(401).send({ message: "No logged user 🔒" });
  });
  // ➕ Create new sample
  app.post("/", async (req, res) => {
    if (await hasPermission(req.user_id, "recording.create")) {
      try {
        // 🗃️ Retrieving file data from request
        const data = await req.file();
        // ✏️ Writing the file in .temp/ with unique name
        const file_name = uuid();
        await pump(data.file, fs.createWriteStream("roots/contrast/.temp/" + file_name));

        // 🚀 Uploading file to Firebase Storage 🗑️ Clean up .temp/ 🌱 Getting file metadatas
        const file_metadata = await (await opts.ky_local.post("firebase/storage/uploadlocal", {
          json: {
            path: "roots/contrast/.temp/" + file_name,
            cleanup: true,
          }
        })).json();

        // 🔗 Getting file's public url
        const { mediaLink } = await (await opts.ky.get(file_metadata.selfLink)).json();

        const sample = new sample_model({
          recording_id: data.fields.recording_id.value,
          is_reference: data.fields.is_reference.value,
          file_url: mediaLink
        });
        await sample.save();
        res.code(201).send(sample);

      } catch (error) {
        res.code(500).send(error);
      }
    }
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  })
  // 🗑️ Delete sample
  app.delete("/:sample_id", async (req, res) => {
    if (await hasPermission(req.user_id, "recording.delete") || await isOwner(req.user_id, req.params.sample_id)) {

      try {
        // 🔍 Searching for audio file path
        const { file_url } = await sample_model.findById(req.params.sample_id);
        // 🗑️ Deleting audio file
        await opts.ky_local.post("firebase/storage/delete", {
          json: {
            file_url: file_url,
          }
        });
        // 🗑️ Deleting all associated reviews
        await review_model.deleteMany({ sample_id: req.params.sample_id });
      } catch (error) {
        console.log(error);
      } finally {
        // 🗑️ Deleting sample
        await sample_model.deleteOne({ _id: req.params.sample_id });
        res.code(200).send({ message: "Sample, reviews & sound files deleted 🗑️" });
      }

      res.code(200).send({ message: "Sample, reviews & sound files deleted 🗑️" });
    }
    else
      res.code(401).send({ message: "Missing permission 🔒" });
  })
  // 📄 Get all samples of a given recording
  app.get("/recording/:recording_id", async (req, res) => {
    if (req.is_auth)
      res.code(200).send(await sample_model.find({ recording_id: req.params.recording_id }).exec());
    else
      res.code(401).send({ message: "No logged user 🔒" });
  });
}