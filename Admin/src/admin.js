const initializeDatabase = require("./init");
const startServer = require("./server");

console.log("Startar ReceptApp...");

initializeDatabase();

startServer();