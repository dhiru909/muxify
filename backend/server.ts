import { log } from "console";
import app from "./src/app";
import { config } from "./src/config/config";
import connectDB from "./src/config/db";
import { createClient } from 'redis';
/**
 * Starts the server by connecting to the database and listening on a specified port.
 */
// export const client = createClient({
//     password: 'ukglj4PBbQ3NVBMcTjOaJZW29MSKGWzC',
//     socket: {
//         host: 'redis-13618.c74.us-east-1-4.ec2.redns.redis-cloud.com',
//         port: 13618
//     }
// });
// (async () => {  await client.connect()})();
// async function boot() {
//   client.on("error", (error:any) => {
//     console.error(`Redis error: ${error}`);
//   });

  // Connection event
//   client.on("connect", async () => {
//     console.info("Connected to ElastiCache Redis");
//     await connectDB();
//   const port = config.port || 3000;
//   app.listen(Number(port),'0.0.0.0', () => {
//     log(`Listening on port ${port}`);
//   });
//   });
// }
const startServer = async () => {
  //connect database
  await connectDB();
  const port = config.port || 3000;
  app.listen(Number(port),'0.0.0.0', () => {
    log(`Listening on port ${port}`);
  });
};
startServer()
// boot();
