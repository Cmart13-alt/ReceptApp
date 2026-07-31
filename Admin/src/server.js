const express = require("express");
const path = require("path");

const recipeRoutes = require("./routes/recipeRoutes");
const exportRoutes = require("./routes/exportRoutes");
const publishRoutes = require("./routes/publishRoutes");

const APP_PATH = path.join(__dirname, "..", "app");
const PORT = process.env.PORT || 3000;

function startServer() {

    const app = express();

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.use(express.static(APP_PATH));

    app.use("/recipes", recipeRoutes);

    app.use("/api", exportRoutes);
    app.use("/api", publishRoutes);

    app.use((req, res) => {

        res.status(404).json({

            success: false,
            message: "Endpoint finns inte."

        });

    });

    app.listen(PORT, () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

    });

}

module.exports = startServer;