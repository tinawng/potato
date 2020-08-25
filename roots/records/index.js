import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import album_model from './models/Album.js';
import review_model from './models/Review.js';
import user_model from './models/User.js';

export default async function (app, opts) {

  // ALBUM
  app.post("/album", (req, res) => {
    const album = new album_model({
      title: req.body.title,
      tracks: req.body.tracks,
      description: req.body.description,
      user_id: req.body.user_id,
      icon: req.body.icon,
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
    album_model.find((error, album) => {
      if (error) {
        res.code(500).send({
          error: error
        });
      } else {
        res.code(200).send(album)
      }
    })
  });

  // REVIEW
  app.post("/review", (req, res) => {
    const review = new review_model({
      album_id: req.body.album_id,
      user_id: req.body.user_id,
      comment: req.body.comment,
      rating: req.body.rating
    });
    review.save().then((response) => {
      res.code(201).send({
        message: "Review successfully created!",
        result: response
      });
    }).catch(error => {
      res.code(500).send({
        error: error
      });
    });
  });
  app.get("/reviews/user/:user_id", (req, res) => {
    if (req.is_auth && req.user_id === req.params.user_id)
      review_model.find({ user_id: req.params.user_id }, (error, user) => {
        if (error) {
          res.code(500).send({
            error: error
          });
        } else {
          res.code(200).send(user)
        }
      })
    else
      res.code(401).send({ message: "Requested user is different from logged user 🔒" });
  });
  app.get("/reviews/album/:album_id", (req, res) => {
    // TODO: 401 if logged user != album.user_id
    review_model.find({ album_id: req.params.album_id }, (error, user) => {
      if (error) {
        res.code(500).send({
          error: error
        });
      } else {
        res.code(200).send(user)
      }
    })
  });

  // USER
  app.post("/register", (req, res) => {
    bcrypt.hash(req.body.password, 10).then((hash) => {
      const user = new user_model({
        name: req.body.name,
        password: hash
      });
      user.save().then((response) => {
        res.code(201).send({
          message: "User successfully created!",
          result: response
        });
      }).catch(error => {
        res.code(500).send({
          error: error
        });
      });
    });
  });
  app.post("/signin", (req, res) => {
    let user_found;
    user_model.findOne({
      name: req.body.name
    }).then(user => {
      if (!user) {
        return res.code(401).send({
          message: "Authentication failed"
        });
      }
      user_found = user;
      return bcrypt.compare(req.body.password, user.password);
    }).then(response => {
      if (!response) {
        return res.code(401).send({
          message: "Authentication failed"
        });
      }
      let jwtToken = jwt.sign({
        user_id: user_found._id
      }, process.env.SECRET, {
        expiresIn: "6h"
      });
      res.code(200).send({
        token: jwtToken,
        expiresIn: "6h",
        user: user_found
      });
    }).catch(err => {
      return res.code(401).send({
        message: "Authentication failed"
      });
    });
  });
  app.get("/user/:user_id", (req, res) => {
    user_model.findById(req.params.user_id, 'name', (error, user) => {
      if (error) {
        res.code(500).send({
          error: error
        });
      } else {
        res.code(200).send(user)
      }
    })
  });
}