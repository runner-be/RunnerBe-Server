//푸시알림
const { initializeApp } = require("firebase-admin/app");
const admin = require("firebase-admin");
let serAccount = require("../../../config/runnerbe-f1986-firebase-adminsdk-frfin-c125099a1f.json");
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serAccount),
  });
}

module.exports = admin;