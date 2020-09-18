import admin from 'firebase-admin';

export default async function (app, opts) {

    var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "gs://" + serviceAccount.project_id + ".appspot.com"
    });
    
    var fire_bucket = admin.storage().bucket();
    // fire_bucket.upload("./test.txt"); // this is working 🎉
}