const dotenv = require("dotenv");
dotenv.config();

const mode = process.env.ENV_MODE || "development";

const PORT = process.env.PORT || 5000;
const server = require("./server");

server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
