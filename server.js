const express = require("express");
const server = express();

const projectsRouter = require("./routes/projects");
const actionsRouter = require("./routes/actions");

server.use(express.json());

server.use("/api/projects", projectsRouter);
server.use("/api/actions", actionsRouter);

module.exports = server;
