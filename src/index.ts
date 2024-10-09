import { Server } from "./server";

// let server = new Server().app;
// let port = process.env.PORT || 3000;
process.env.TZ = "Africa/Johannesburg";

// server.listen(port, () => {
//   console.log(`Server is running at port ${port}`);
// });

export class Index {
  private server = new Server().app;
  private port = process.env.PORT || 3000;

  init() {
    this.server.listen(this.port, () => {
      console.log(`Server is running at port ${this.port}`);
    });
  }
}
