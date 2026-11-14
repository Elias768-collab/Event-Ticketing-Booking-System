import { createServer } from "node:http";

import { createApp } from "./http/app.js";
import { config } from "./config.js";

// Create the HTTP server using our application handler.
const server = createServer(createApp());

// Start listening for incoming requests.
server.listen(config.port, () => {
  console.log(
    `Event Ticketing System running at http://localhost:${config.port}`
  );
});