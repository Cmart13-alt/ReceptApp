const express = require("express");

const router = express.Router();

const { publish } = require("../services/publishService");

router.post("/publish", async (req, res) => {

    try {

        const result = await publish();

        res.json(result);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

module.exports = router;