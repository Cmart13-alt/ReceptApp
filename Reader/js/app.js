"use strict";

const app = {

    recipes: [],
    filteredRecipes: []

};

let wakeLock = null;
let currentRecipe = null;

async function enableWakeLock() {

    if (!("wakeLock" in navigator) || wakeLock) {
        return;
    }

    try {

        wakeLock = await navigator.wakeLock.request("screen");

        console.log("Wake Lock aktiv");

    }
    catch (err) {

        console.warn("Wake Lock kunde inte aktiveras:", err);

    }

}

async function disableWakeLock() {

    if (!wakeLock) {
        return;
    }

    try {

        await wakeLock.release();

        console.log("Wake Lock släppt");

    }
    finally {

        wakeLock = null;

    }

}

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

        handleRoute();

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

    if (!text) {

        app.filteredRecipes = [...app.recipes];

        showRecipeList();

        return;

    }

    app.filteredRecipes = app.recipes.filter(recipe => {

        const titleMatch =
            recipe.title
                .toLowerCase()
                .includes(text);

        const categoryMatch =
            (recipe.category ?? "")
                .toLowerCase()
                .includes(text);

        const notesMatch =
            (recipe.notes ?? "")
                .toLowerCase()
                .includes(text);

        const ingredientMatch =
            recipe.ingredients.some(ingredient =>
                (ingredient.ingredient ?? "")
                    .toLowerCase()
                    .includes(text)
            );

        return (
            titleMatch ||
            categoryMatch ||
            notesMatch ||
            ingredientMatch
        );

    });

    showRecipeList();

}

function hideHeader() {

    document.querySelector("header").style.display = "none";

}

function showHeader() {

    document.querySelector("header").style.display = "block";

}

function openRecipe(recipe) {

    history.pushState(
        { id: recipe.id },
        "",
        `./?id=${recipe.id}`
    );

    showRecipe(recipe);

}

function handleRoute() {

    const id = new URLSearchParams(location.search).get("id");

    if (!id) {

        showRecipeList();
        return;

    }

    const recipe = app.recipes.find(r => String(r.id) === id);

    if (recipe) {

        showRecipe(recipe);

    }
    else {

        showRecipeList();

    }

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

    currentRecipe = null;

    disableWakeLock();

    document.title = "Alla recept";

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

            openRecipe(recipe);

        });

        const titleRow = document.createElement("div");

        titleRow.className = "recipe-title";

        const icon = document.createElement("span");

        icon.className = "material-symbols-rounded recipe-icon";

        icon.textContent = getRecipeIcon(recipe.category);

        const title = document.createElement("h2");

        title.textContent = recipe.portions
            ? `${recipe.title} (${recipe.portions} p)`
            : recipe.title;

        titleRow.appendChild(icon);

        titleRow.appendChild(title);

        card.appendChild(titleRow);

        content.appendChild(card);

    }

}

function showRecipe(recipe) {

    hideHeader();

    currentRecipe = recipe;

    enableWakeLock();

    document.title = `${recipe.title} – Recept`;

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

    const steps = (recipe.instructions ?? "")
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

            const number = document.createElement("strong");

            number.textContent = `${index + 1}.`;

            div.append(number, " ", step);

            instructionCard.appendChild(div);

        });

    }
    else if (steps.length === 1) {

        const p = document.createElement("p");

        p.textContent = steps[0];

        instructionCard.appendChild(p);

    }

    //
    // Tips
    //

    if (recipe.notes?.trim()) {

/*         const tipsHeading = document.createElement("h3");

        tipsHeading.textContent = "Tips";

        instructionCard.appendChild(tipsHeading); */

        recipe.notes
            .split(/\r?\n\s*\r?\n/)
            .map(note => note.trim())
            .filter(note => note.length > 0)
            .forEach(note => {

                const p = document.createElement("p");

                p.textContent = note;

                instructionCard.appendChild(p);

            });

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

    back.addEventListener("click", () => {

        if (history.length > 1) {

            history.back();

        } else {

            history.pushState({}, "", "./");

            showRecipeList();

        }

    });

    content.appendChild(back);
    

}

window.addEventListener("popstate", () => {

    handleRoute();

});

document.addEventListener("visibilitychange", () => {

    if (
        document.visibilityState === "visible" &&
        currentRecipe &&
        wakeLock === null
    ) {

        enableWakeLock();

    }

});

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