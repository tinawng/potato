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
  app.get("/albums/user/:user_id", (req, res) => {
    if (req.is_auth && req.user_id === req.params.user_id)
      album_model.find({ user_id: req.params.user_id }, (error, user) => {
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

  // REVIEW
  app.post("/review", (req, res) => {
    const review = new review_model(req.body);
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
    album_model.find({ user_id: req.user_id, album_id: req.params.album_id }, (error, album) => {
      if (error)
        res.code(401).send({ message: "Requested album does not belong to logged user 🔒" });
    })


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
  app.post("/login", (req, res) => {
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
    }).then(is_valid => {
      if (!is_valid) {
        return res.code(401).send({
          message: "Authentication failed"
        });
      }
      let jwtToken = jwt.sign({
        user_id: user_found._id
      }, process.env.SECRET, {
        expiresIn: "6h"
      });
      delete user_found._doc.password;
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
  app.get("/user/has_reviewed/:album_id", (req, res) => {
    if (req.is_auth)
      review_model.find({ user_id: req.user_id, album_id: req.params.album_id }, (error, review) => {
        if (error) {
          res.code(200).send(false);
        } else {
          res.code(200).send(review.length > 0)
        }
      })
    else
      res.code(401).send({ message: "No logged user 🔒" });
  });
}