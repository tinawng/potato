import album_model from './models/Album.js';

export default async function (app, opts) {
  app.post("/album", (req, res) => {
    const album = new album_model({
      title: req.body.title,
      tracks: req.body.tracks,
      description: req.body.description,
      author: req.body.author,
      is_hidden: req.body.is_hidden
    });
    album.save().then((response) => {
      res.code(201).send({
        message: "Album successfully created!",
        result: response
      });
    }).catch(error => {
      res.code(500).send({
        error: error
      });
    });
  });

  app.get("/albums", (req, res) => {
    album_model.find((error, response) => {
      if (error) {
        res.code(500).send({
          error: error
        });
      } else {
        res.code(200).send(response)
      }
    })
  })
}