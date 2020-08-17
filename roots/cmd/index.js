import { spawn } from 'child_process';

export default async function (app, opts) {
    app.get("/temp", (req, res) => {
        var regex = /temp=([^'C]+)/;
        var cmd = spawn("/opt/vc/bin/vcgencmd", ["measure_temp"]);
        cmd.stdout.on("data", function (buf) {
            var obj = parseFloat(regex.exec(buf.toString("utf8"))[1]);
            res.send(obj);
        });
    });

    app.get("/:cmd", (req, res) => {
        let params = req.params.cmd.split(' ')
        let cmd = spawn(params[0], params.slice(1))

        cmd.stdout.on("data", function (buf) {  
            res.send(buf.toString("utf8"));
        });
    });

    app.post("/", (req, res) => {
        let params = req.query.cmd.split(' ')
        let cmd = spawn(params[0], params.slice(1))

        cmd.stdout.on("data", function (buf) {
            res.send(buf.toString("utf8"));
        });
    })
};
