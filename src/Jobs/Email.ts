import * as JobScedular from "node-schedule";
import { Nodemailer } from "../utils/Nodemailer";

export class Email {
  static runEmailJobs() {
    this.newsLetterJob();
  }

  static newsLetterJob() {
    const rule = new JobScedular.RecurrenceRule();
    // rule.second = 5;
    rule.second = new JobScedular.Range(0, 59, 5);
    // JobScedular.scheduleJob("News Letter", "*/5* * * * * *", () => {
    //   console.log("News letter schedule");
    // });
    JobScedular.scheduleJob("News Letter", rule, () => {
      console.log("News letter schedule");
      Nodemailer.sendMail({
        to: ["technyks@gmail.com"],
        subject: "Email Verification",
        html: `<h1>Test email is sent, check it<h1>`,
      });
    });
  }
}
