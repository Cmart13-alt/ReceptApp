const https = require("https");
const fs = require("fs");
const path = require("path");
const express = require("express");
const recipeRoutes = require("./routes/recipeRoutes");
const { getRecipesForExport } = require("./db");

function startServer() {

    const app = express();
  
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(express.static(path.join(__dirname, "..", "app")));

    app.use("/reader", express.static(path.join("D:", "Projects", "RecipeReader")));

    app.use("/recipes", recipeRoutes);

    app.get("/api/export", async (req, res) => {

        try {

            const recipes = await getRecipesForExport();

            const exportData = {

                schema: 1,
                app: "ReceptApp",
                exported: new Date().toISOString(),
                recipeCount: recipes.length,
                recipes

            };

            res.setHeader(
                "Content-Disposition",
                "attachment; filename=recipes.json"
            );

            res.setHeader(
                "Content-Type",
                "application/json"
            );

            res.send(
                JSON.stringify(exportData, null, 2)
            );
        } catch (err) {

            console.error(err);

            res.status(500).json({

                error: "Export misslyckades."

            });

        }

    });

    const READER_PATH = path.join(
        "D:",
        "Projects",
        "RecipeReader"
    );

   app.post("/api/export-reader", async (req, res) => {

        try {

            const recipes = await getRecipesForExport();

            // ===== Version =====

            const version = Date.now();

            // ===== Exportdata =====

            const exportData = {

                schema: 1,

                app: "ReceptApp",

                exported: new Date().toISOString(),

                recipeCount: recipes.length,

                recipes

            };

            // ===== RecipeReader =====

            const READER_PATH = path.join(
                "D:",
                "Projects",
                "RecipeReader"
            );

            // ===== recipes.json =====

            fs.writeFileSync(

                path.join(
                    READER_PATH,
                    "data",
                    "recipes.json"
                ),

                JSON.stringify(exportData, null, 2),

                "utf8"

            );

            // ===== version.json =====

            const versionData = {

                version,

                recipes: recipes.length,

                exported: new Date().toISOString()

            };

            fs.writeFileSync(

                path.join(
                    READER_PATH,
                    "version.json"
                ),

                JSON.stringify(versionData, null, 4),

                "utf8"

            );


            res.json({

                success: true,

                message: "RecipeReader uppdaterad."

            });

        }
        catch (err) {

            console.error(err);

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    });

    app.listen(3000, () => {
        console.log("Server running on http://localhost:3000");
    });

}

module.exports = startServer;