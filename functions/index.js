const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();
sgMail.setApiKey(functions.config().sendgrid.key);

const db = admin.firestore();

exports.sendReminders = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
  const now = admin.firestore.Timestamp.now();
  const remindersRef = db.collection("reminders");
  const snapshot = await remindersRef.where("sendAt", "<=", now.toDate()).get();

  if (snapshot.empty) {
    console.log("No reminders to send.");
    return null;
  }

  const batch = db.batch();

  snapshot.forEach((doc) => {
    const reminder = doc.data();
    const msg = {
      to: reminder.to,
      from: "pshell@uco.edu", // your verified single sender email
      subject: reminder.message.subject,
      text: reminder.message.text,
      html: reminder.message.html,
    };

    sgMail.send(msg)
      .then(() => console.log("Email sent to", reminder.to))
      .catch((error) => console.error("SendGrid Error:", error));

    batch.delete(doc.ref); // delete reminder after sending
  });

  await batch.commit();
  return null;
});
