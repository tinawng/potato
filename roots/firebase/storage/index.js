import admin from 'firebase-admin';
import fs from 'fs';

export default async function (app, opts) {

    var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "gs://" + serviceAccount.project_id + ".appspot.com"
    });

    var bucket = admin.storage().bucket();

    app.post("/uploadlocal", async (req, res) => {
        if (req.headers.secret === process.env.SECRET || process.env.NODE_ENV === "development") {
            const response = await bucket.upload(req.body.path);
            const metadata = response[0].metadata;
            if (req.body.cleanup)
                fs.unlink(req.body.path, () => {
                    res.code(200).send(metadata);
                });
            else
                res.code(200).send(metadata);
        }
        else
            res.code(401).send();

    });

    app.post("/delete", async (req, res) => {
        if (req.headers.secret === process.env.SECRET || process.env.NODE_ENV === "development") {
            const file_name = extractFileName(req.body.file_url)
            await bucket.file(file_name).delete();
            res.code(200).send();
        }
        else
            res.code(401).send();
    })

    function extractFileName(url) {
        let str = url.split(".appspot.com/o/")[1]
        str = str.split("?generation")[0]
        return str
    }
}