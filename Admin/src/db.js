const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "..", "data", "recipes.db");

const db = new sqlite3.Database(dbPath, err => {

    if (err) {

        console.error("Kunde inte öppna databasen:", err.message);

        return;

    }

    db.run("PRAGMA foreign_keys = ON", err => {

        if (err) {

            console.error("Kunde inte aktivera foreign keys:", err.message);

        } else {

            console.log("Foreign keys aktiverade.");

        }

    });

    console.log("Databas ansluten.");

});

function run(sql, params = []) {

    return new Promise((resolve, reject) => {

        db.run(sql, params, function (err) {

            if (err) {
                reject(err);
            } else {
                resolve(this);
            }

        });

    });

}

function get(sql, params = []) {

    return new Promise((resolve, reject) => {

        db.get(sql, params, (err, row) => {

            if (err) {
                reject(err);
            } else {
                resolve(row);
            }

        });

    });

}

function all(sql, params = []) {

    return new Promise((resolve, reject) => {

        db.all(sql, params, (err, rows) => {

            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }

        });

    });

}

async function saveRecipe(recipe) {

    const result = await run(

        `
        INSERT INTO recipes
        (
            title,
            portions,
            category,
            instructions,
            notes
        )
        VALUES
        (?, ?, ?, ?, ?)
        `,

        [
            recipe.title,
            recipe.portions,
            recipe.category,
            recipe.instructions,
            recipe.notes
        ]

    );
       
    return result.lastID;
    
}

async function getRecipe(id) {

    const recipe = await get(

        `
        SELECT *
        FROM recipes
        WHERE id = ?
        `,

        [id]

    );

    if (!recipe) {

        return null;

    }

    recipe.ingredients =
        await getIngredients(recipe.id);

    return recipe;

}

async function getRecipes() {

    return await all(

        `
        SELECT *
        FROM recipes
        ORDER BY title
        `

    );

}

async function updateRecipe(recipe) {

    const result = await run(

        `
        UPDATE recipes
        SET
            title = ?,
            portions = ?,
            category = ?,
            instructions = ?,
            notes = ?
        WHERE id = ?
        `,

        [

            recipe.title,
            recipe.portions,
            recipe.category,
            recipe.instructions,
            recipe.notes,
            recipe.id

        ]

    );

    return result.changes;

}

async function deleteRecipe(id) {

    const result = await run(

        `
        DELETE FROM recipes
        WHERE id = ?
        `,

        [id]

    );

    return result.changes;

}

async function getIngredients(recipeId) {

    return await all(

        `
        SELECT
            id,
            amount,
            unit,
            ingredient,
            sort_order
        FROM recipe_ingredients
        WHERE recipe_id = ?
        ORDER BY sort_order
        `,

        [recipeId]

    );

}

async function saveIngredients(recipeId, ingredients) {

    ingredients ??= [];

    await run(

        `
        DELETE FROM recipe_ingredients
        WHERE recipe_id = ?
        `,

        [recipeId]

    );

    for (const [index, ingredient] of ingredients.entries()) {

        await run(

            `
            INSERT INTO recipe_ingredients (

                recipe_id,
                sort_order,
                amount,
                unit,
                ingredient

            )
            VALUES (?, ?, ?, ?, ?)
            `,

            [

                recipeId,
                index + 1,
                ingredient.amount,
                ingredient.unit,
                ingredient.ingredient

            ]

        );

    }

}

async function recipeCount() {

    const { count } = await get(
        "SELECT COUNT(*) AS count FROM recipes"
    );

    return count;

}

async function getRecipesForExport() {

    const recipes = await getRecipes();

    for (const recipe of recipes) {

        recipe.ingredients = await getIngredients(recipe.id);

    }

    return recipes;

}

module.exports = {

    run,
    saveRecipe,
    getRecipe,
    getRecipes,
    getRecipesForExport,
    updateRecipe,
    deleteRecipe,
    recipeCount,
    saveIngredients

};