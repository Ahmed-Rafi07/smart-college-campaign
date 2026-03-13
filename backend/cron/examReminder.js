const cron = require("node-cron");
const Exam = require("../models/Exam");
const sendMail = require("../utils/mailer");

function startExamReminderCron() {
  if (process.env.CRON_ENABLED === "false") {
    console.log("⏸️ Exam reminder cron is disabled (CRON_ENABLED=false)");
    return null;
  }

  return cron.schedule(
    "*/5 * * * *",
    async () => {
      try {
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
      } catch (error) {
        console.error("❌ Exam reminder cron failed:", error.message);
      }
    },
    {
      timezone: process.env.CRON_TIMEZONE || "Asia/Kolkata",
      noOverlap: true,
      name: "exam-reminder",
    }
  );
}

module.exports = { startExamReminderCron };
