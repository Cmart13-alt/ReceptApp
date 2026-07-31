const fs = require("fs");

const PATHS = require("../utils/paths");
const logger = require("../utils/logger");

const { createExportData } = require("./exportService");
const { createVersion } = require("./versionService");
const { generateServiceWorker } = require("./serviceWorkerService");

const git = require("./gitService");

async function exportReader() {

    logger.section("Export");

    const exportData = await createExportData();

    const versionData = createVersion(
        exportData.recipeCount
    );

    logger.step("Skriver recipes.json");

    fs.writeFileSync(

        PATHS.RECIPES_JSON,
        JSON.stringify(exportData, null, 2),
        "utf8"

    );

    logger.success("recipes.json");

    logger.step("Skriver version.json");
console.log("VERSION_JSON =", PATHS.VERSION_JSON);
    fs.writeFileSync(

        PATHS.VERSION_JSON,
        JSON.stringify(versionData, null, 4),
        "utf8"

    );

    logger.success("version.json");

    logger.step("Genererar service-worker");

    generateServiceWorker(
        versionData.version
    );

    logger.success("service-worker.js");

    return {

        version: versionData.version,
        recipeCount: exportData.recipeCount

    };

}

async function publish() {

    logger.header("RecipeReader Publisher");

    const result = await exportReader();

    const gitResult = await git.publish(
        `Publish ${result.version}`
    );

    const response = {

        success: true,

        ...result,

        git: gitResult,

        message: gitResult.committed
            ? "RecipeReader publicerad."
            : "Inga ändringar att publicera."

    };

    logger.footer(response);

    return response;

}

module.exports = {

    exportReader,
    publish

};