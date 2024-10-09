import { Database } from "./dataBase";
import { Email } from "./Email";

export class Jobs {
  static executeJobs() {
    Database.runDatabaseJobs();
    Email.runEmailJobs();
  }
}
