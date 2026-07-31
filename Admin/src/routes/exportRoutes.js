const express = require("express");

const router = express.Router();

const {
    createExportData
} = require("../services/exportService");

router.get("/export", async (req, res) => {

    try {

        const exportData = await createExportData();

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

module.exports = router;