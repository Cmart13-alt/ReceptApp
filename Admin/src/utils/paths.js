const path = require("path");

const ROOT = path.join(__dirname, "..", "..", "..");

module.exports = {

    ROOT,

    READER: path.join(ROOT, "Reader"),

    DATA: path.join(ROOT, "Reader", "data"),

    RECIPES_JSON: path.join(ROOT, "Reader", "data", "recipes.json"),

    VERSION_JSON: path.join(ROOT, "Reader", "version.json"),

    SERVICE_WORKER: path.join(ROOT, "Reader", "service-worker.js"),

    INDEX_HTML: path.join(ROOT, "Reader", "index.html")

};