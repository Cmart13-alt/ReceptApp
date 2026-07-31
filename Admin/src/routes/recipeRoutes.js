const express = require("express");
const path = require("path");
const db = require("../db");
const router = express.Router();

router.get("/new", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "app", "recipes", "recipe.html"));
});

router.get("/list", async (req, res) => {

    try {

        const recipes = await db.getRecipes();

        res.json(recipes);

    } catch (err) {

        console.error(err);
        res.status(500).json({ error: err.message });

    }

});

router.get("/:id", async (req, res) => {

    try {

        const recipe = await db.getRecipe(req.params.id);

        if (!recipe) {

            return res.sendStatus(404);

        }

        res.json(recipe);

    }
    catch (err) {

        console.error(err);

        res.sendStatus(500);

    }

});

router.post("/", async (req, res) => {

    try {

        const recipe = req.body;

        const recipeId =
            await db.saveRecipe(recipe);

        await db.saveIngredients(
            recipeId,
            recipe.ingredients
        );

        res.status(201).json({

            success: true,
            id: recipeId

        });

    }
    catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

router.put("/:id", async (req, res) => {

    try {

        req.body.id = Number(req.params.id);

        const changes = await db.updateRecipe(req.body);
            
        await db.saveIngredients(
            req.body.id,
            req.body.ingredients
        );

        if (!changes) {

            return res.sendStatus(404);

        }

        res.json({

            success: true,
            id: req.body.id

        });

    }
    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,
            error: err.message

        });

    }

});

router.delete("/:id", async (req, res) => {

    try {

        const changes =
            await db.deleteRecipe(req.params.id);

        if (!changes) {

            return res.sendStatus(404);

        }

        res.json({

            success: true

        });

    }
    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,
            error: err.message

        });

    }

});

module.exports = router;