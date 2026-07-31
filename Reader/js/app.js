"use strict";

const app = {

    recipes: [],
    filteredRecipes: []

};

document.addEventListener("DOMContentLoaded", async () => {

    document
        .getElementById("search")
        .addEventListener("input", searchRecipes);

    await loadRecipes();
    
    await loadVersion();

});

async function loadRecipes() {

    try {

        const response = await fetch("data/recipes.json");

        const data = await response.json();

        app.recipes = data.recipes;

        app.filteredRecipes = [...app.recipes];

        showRecipeList();

    }

    catch (err) {

        console.error(err);

        document.getElementById("content").textContent =
            "Kunde inte läsa recipes.json.";

    }

}

function searchRecipes() {

    const text = document
        .getElementById("search")
        .value
        .trim()
        .toLowerCase();

    app.filteredRecipes = app.recipes.filter(recipe =>
        recipe.title
            .toLowerCase()
            .includes(text)
    );

    showRecipeList();

}

function hideHeader() {

    document.querySelector("header").style.display = "none";

}

function showHeader() {

    document.querySelector("header").style.display = "block";

}

function getRecipeIcon(category) {

    switch (category) {

        case "Förrätt":
            return "tapas";

        case "Huvudrätt":
            return "skillet";

        case "Dessert":
            return "cake";

        case "Soppa":
            return "soup_kitchen";

        case "Bröd":
            return "bakery_dining";

        case "Dryck":
            return "local_cafe";

        default:
            return "menu_book";

    }

}

function showRecipeList() {

    showHeader();

    const content = document.getElementById("content");

    content.replaceChildren();

    const info = document.createElement("p");

    info.className = "recipe-count";

    info.textContent = `${app.filteredRecipes.length} recept`;

    content.appendChild(info);

    for (const recipe of app.filteredRecipes) {

        const card = document.createElement("div");

        card.className = "recipe-card";

        card.addEventListener("click", () => {

            showRecipe(recipe);

        });

        const titleRow = document.createElement("div");

        titleRow.className = "recipe-title";

        const icon = document.createElement("span");

        icon.className = "material-symbols-rounded recipe-icon";

        icon.textContent = getRecipeIcon(recipe.category);

        const title = document.createElement("h2");

        title.textContent = recipe.title;

        titleRow.appendChild(icon);

        titleRow.appendChild(title);

        card.appendChild(titleRow);

        content.appendChild(card);

    }

}

function showRecipe(recipe) {

    hideHeader();

    const content = document.getElementById("content");

    content.replaceChildren();


    //
    // Titel
    //

    const title = document.createElement("h1");

    title.textContent = recipe.portions
        ? `${recipe.title} (${recipe.portions} p)`
        : recipe.title;

    content.appendChild(title);

    //
    // Ingredienser
    //

    const heading1 = document.createElement("h2");

    heading1.textContent = "Ingredienser";

    content.appendChild(heading1);

    const ingredientCard = document.createElement("div");

    ingredientCard.className = "recipe-section";

    for (const ingredient of recipe.ingredients) {

        if (ingredient.unit === "avdelare") {

            const group = document.createElement("div");

            group.className = "ingredient-group";

            group.textContent = ingredient.ingredient;

            ingredientCard.appendChild(group);

            continue;

        }

        const row = document.createElement("div");

        row.className = "ingredient";

        const amount = document.createElement("div");

        amount.className = "amount";

        amount.textContent =
            `${ingredient.amount || ""} ${ingredient.unit || ""}`.trim();

        const name = document.createElement("div");

        name.className = "ingredient-name";

        name.textContent = ingredient.ingredient;

        row.appendChild(amount);

        row.appendChild(name);

        ingredientCard.appendChild(row);

    }

    content.appendChild(ingredientCard);

    //
    // Tillagning
    //

    const heading2 = document.createElement("h2");

    heading2.textContent = "Tillagning";

    content.appendChild(heading2);

    const instructionCard = document.createElement("div");

    instructionCard.className = "recipe-section";

    const steps =
        recipe.instructions
            .split(/\r?\n\s*\r?\n/)
            .map(step =>
                step
                    .replace(/\r?\n/g, " ")
                    .replace(/\s+/g, " ")
                    .trim()
            )
            .filter(step => step.length > 0);

    if (steps.length > 1) {

        steps.forEach((step, index) => {

            const div = document.createElement("div");

            div.className = "step";

            div.innerHTML = `<strong>${index + 1}.</strong> ${step}`;

            instructionCard.appendChild(div);

        

        });

    }
    else {

        const p = document.createElement("p");

        p.textContent = recipe.instructions;

        instructionCard.appendChild(p);

    }

   
    //
    // Anteckningar
    //


    if (recipe.notes) {

        const heading3 = document.createElement("<br>");

        heading3.textContent = "Anteckningar";

        content.appendChild(heading3);

        const notes = document.createElement("<br>");
/* 
        notes.className = "notes";
 */
        notes.textContent = recipe.notes;

        content.appendChild(notes);

    }

     content.appendChild(instructionCard);
    
    //
    // Tillbaka
    //

    const back = document.createElement("button");

    back.className = "back-button";

    back.innerHTML = `
    <span class="material-symbols-rounded">arrow_back</span>
    <span>Alla recept</span>
    `;

    back.addEventListener("click", showRecipeList);

    content.appendChild(back);
    

}

if ("serviceWorker" in navigator) {

    window.addEventListener("load", async () => {

        try {

            await navigator.serviceWorker.register("./service-worker.js");

            console.log("Service Worker registrerad.");

        }
        catch (err) {

            console.error("Kunde inte registrera Service Worker.", err);

        }

    });

}

async function loadVersion() {

    try {

        const response = await fetch("./version.json");

        if (!response.ok) {

            throw new Error("Kunde inte läsa version.json");

        }

        const version = await response.json();

        document.getElementById("version").textContent = `Version ${version.version} • ${version.recipes} recept`;
    }
    catch (err) {

        console.error(err);

    }

}