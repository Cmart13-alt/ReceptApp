const { getRecipesForExport } = require("../db");

async function createExportData() {

    const recipes = await getRecipesForExport();

    return {

        schema: 1,
        app: "ReceptApp",
        exported: new Date().toISOString(),
        recipeCount: recipes.length,
        recipes

    };

}

module.exports = {
    createExportData
};