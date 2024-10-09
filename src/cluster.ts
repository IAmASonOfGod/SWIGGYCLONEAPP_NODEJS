// import { Index } from "./index";

// const cluster = require("cluster");
// const os = require("os");

// const numCPUs = os.cpus().length;
// console.log(`Number of CPUs: ${numCPUs}`);

//   if (cluster.isPrimary) {
//   const numCPUs = os.cpus().length;
//   console.log(numCPUs);

//   Fork workers based on the number of CPUs
//   for (let i = 0; i < numCPUs; i++) {
//   cluster.fork();
//   }

//   // Listen for workers exiting
//   cluster.on("exit", (worker, code, signal) => {
//     console.log(`Worker ${worker.process.pid} died`);
//     cluster.fork();
//   });

// } else {
//   console.log(`Worker process ${process.pid} is running`);
//   new Index().init;
// }
