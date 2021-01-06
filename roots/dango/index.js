import fs from "fs";

export default async function (app, opts) {

  app.get("/video", (req, res) => {
    const path = process.env.DANGO_PATH + 'bird.mp4'
    const stat = fs.statSync(path)
    const fileSize = stat.size
    const range = req.headers.range
    if (false) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1]
        ? parseInt(parts[1], 10)
        : fileSize - 1
      const chunksize = (end - start) + 1
      const file = fs.createReadStream(path, { start, end })
      // const head = {
      //   'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      //   'Accept-Ranges': 'bytes',
      //   'Content-Length': chunksize,
      //   'Content-Type': 'video/mp4',
      // }
      res.header('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.header('Accept-Ranges', 'bytes');
      res.header('Content-Length', chunksize);
      res.header('Content-Type', 'video/mp4');
      res.send(file)


      // res.code(206).send(head)
      // file.pipe(res);
    } else {
      // const head = {
      //   'Content-Length': fileSize,
      //   'Content-Type': 'video/mp4',
      // }
      res.header('Content-Length', fileSize);
      res.header('Content-Type', 'video/mp4');
      // res.code(200).send(head)
      // fs.createReadStream(path).pipe(res)
      const ss = fs.createReadStream(path)
      res.send(ss)
    }
  });

  app.get('/stream/*', async (req, res) => {
    if (req.is_auth) {
      const path = process.env.DANGO_PATH + req.params['*'];
      const stat = fs.statSync(path);
      const fileSize = stat.size;
      const range = req.headers.range;

      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1]
        ? parseInt(parts[1], 10)
        : fileSize - 1
      const chunksize = (end - start) + 1

      console.log(end)

      const stream = fs.createReadStream(path, { start, end })

      res.header('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.header('Accept-Ranges', 'bytes');
      res.header('Content-Length', chunksize);
      res.header('Content-Type', 'video/mp4');

      res.send(stream)
    }
    else
      res.code(401).send({ message: "No logged user 🔒" });
  })

  // BCK
  // app.get('/stream/*', async (req, res) => {
  //   if (req.is_auth) {
  //     const path = process.env.DANGO_PATH + req.params['*'];
  //     const stat = fs.statSync(path);
  //     const fileSize = stat.size;
  //     res.header('Content-Length', fileSize);
  //     res.header('Content-Type', 'video/mp4');
  //     const stream = fs.createReadStream(path);
  //     res.send(stream);
  //   }
  //   else
  //     res.code(401).send({ message: "No logged user 🔒" });
  // })

  app.get('/list/*', async (req, res) => {
    if (req.is_auth) {
      const path = process.env.DANGO_PATH + req.params['*'];

      fs.readdir(path, async (err, files) => {
        if (err) res.code(500).send(err);

        var movies = [], directories = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          var file_path = path + file;

          var stat = await fsStatPromise(file_path);

          if (stat.isDirectory())
            directories.push(file);
          else
            movies.push(file);
        }

        res.code(200).send({ movies, directories });
      });
    }
    else
      res.code(401).send({ message: "No logged user 🔒" });

  })
};

const fsStatPromise = (...args) => {
  return new Promise((resolve, reject) => {
    fs.stat(...args, (err, data) => {
      if (err) return reject(err)
      resolve(data)
    })
  })
}