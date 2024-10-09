export class Database {
  static runDatabaseJobs() {
    this.backupJob();
    this.updateUserJobs();
  }

  static updateUserJobs() {}

  static backupJob() {}
}
