const cron = require("node-cron");
const Exam = require("../models/Exam");
const sendMail = require("../utils/mailer");

cron.schedule("*/5 * * * *", async () => {
  const now = new Date();
  const in10Min = new Date(now.getTime() + 10 * 60 * 1000);

  const exams = await Exam.find({
    dateTime: { $gte: now, $lte: in10Min },
  }).populate("user");

  exams.forEach((exam) => {
    if (!exam.user?.email) return;
    sendMail(
      exam.user.email,
      "📘 Exam Reminder",
      `Your exam "${exam.title}" starts at ${new Date(
        exam.dateTime
      ).toLocaleString()}`
    );
  });
});
