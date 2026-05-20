import { createServer } from "./src/server.js";
import config from "./src/config.js";

const server = createServer();

server.listen(config.port, () => {
  console.log(`api running on ${config.port}`);
});
