const db = require("./db");

async function initializeDatabase() {

    try {

        await db.run(`
            CREATE TABLE IF NOT EXISTS recipes (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                title TEXT NOT NULL,

                portions INTEGER,

                category TEXT,

                instructions TEXT,

                notes TEXT,

                created DATETIME DEFAULT CURRENT_TIMESTAMP,

                updated DATETIME DEFAULT CURRENT_TIMESTAMP

            )
        `);

        await db.run(`
            CREATE TABLE IF NOT EXISTS recipe_ingredients (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                recipe_id INTEGER NOT NULL,

                sort_order INTEGER NOT NULL,

                amount TEXT,

                unit TEXT,

                ingredient TEXT NOT NULL,

                FOREIGN KEY (recipe_id)
                    REFERENCES recipes(id)
                    ON DELETE CASCADE

            )
        `);

        await db.run(`
            CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe
            ON recipe_ingredients(recipe_id)
        `);

        console.log("SQLite ansluten.");
        console.log("Databasschema klart.");
       

    } catch (err) {

        console.error("Fel vid initiering av databasen:", err);

    }

}

module.exports = initializeDatabase;