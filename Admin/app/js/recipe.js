"use strict";

/******************************************************************
 * Mina recept
 ******************************************************************/

const app = {

    recipes: [],

    currentRecipe: null,

    isDirty: false

};

/******************************************************************
 * Init
 ******************************************************************/

document.addEventListener("DOMContentLoaded", init);

async function init() {

    bindEvents();

    addIngredient();

    await loadRecipeList();

}

/******************************************************************
 * Händelser
 ******************************************************************/

function bindEvents() {

    document
        .getElementById("newRecipe")
        .addEventListener("click", newRecipe);

    document
        .getElementById("addIngredient")
        .addEventListener("click", addIngredient);

    document
        .getElementById("recipeForm")
        .addEventListener("submit", saveRecipe);

    document
        .getElementById("deleteRecipe")
        .addEventListener("click", deleteRecipe);

    document
        .getElementById("search")
        .addEventListener("input", searchRecipes);

    document
    .getElementById("btnPublish")
    .addEventListener("click", publishToReader);

    document
    .getElementById("btnReader")
    .addEventListener("click", openReader);

}

/******************************************************************
 * Receptlista
 ******************************************************************/

async function loadRecipe(id) {
    
    clearStatus();

    try {

        const response =
            await fetch(`/recipes/${id}`);

        if (!response.ok) {

            throw new Error("Kunde inte läsa receptet.");

        }

        const recipe =
            await response.json();

        fillForm(recipe);

    }
    catch (error) {

        console.error(error);

    }

}
async function loadRecipeList() {

    try {

        const response = await fetch("/recipes/list");

        if (!response.ok) {

            throw new Error("Kunde inte läsa recept.");

        }

        app.recipes = await response.json();

        sortRecipes();

        searchRecipes();

    }
    catch (error) {

        console.error(error);

    }

}

function getRecipeIcon(category) {

    switch (category) {

        case "Förrätt":
            return "tapas";

        case "Huvudrätt":
            return "restaurant";

        case "Dessert":
            return "cake";

        case "Soppa":
            return "soup_kitchen";

        case "Bröd":
            return "bakery_dining";

        case "Dryck":
            return "local_bar";

        default:
            return "menu_book";

    }

}

function showRecipeList(recipes = app.recipes) {

    const list = document.getElementById("recipeList");

    list.innerHTML = "";

    recipes.forEach(recipe => {

        const iconName = getRecipeIcon(recipe.category);

        const item = document.createElement("div");

        item.className = "recipe-item";

        item.dataset.id = recipe.id;

        item.innerHTML = `
            <span class="material-symbols-rounded recipe-icon">
                ${iconName}
            </span>

            <span class="recipe-title">
                ${recipe.title}
            </span>

            <span class="recipe-category">
                ${recipe.category || ""}
            </span>
        `;

        item.addEventListener("click", () => {

            selectRecipe(recipe.id);

        });

        list.appendChild(item);

    });

    document.getElementById("recipeCount").textContent = `${recipes.length} recept`;
}


/******************************************************************
 * Markera recept
 ******************************************************************/

function selectRecipe(id) {

    app.currentRecipeId = id;

    document
        .querySelectorAll(".recipe-item")
        .forEach(item => item.classList.remove("selected"));

    document
        .querySelector(`.recipe-item[data-id="${id}"]`)
        ?.classList.add("selected");

    loadRecipe(id);

}

/******************************************************************
 * Nytt recept
 ******************************************************************/

function newRecipe() {

    clearStatus();

    app.currentRecipeId = null;

    clearForm();

    document
        .querySelectorAll(".recipe-item")
        .forEach(item => item.classList.remove("selected"));
    
    document.getElementById("editorTitle").textContent = "Nytt recept";

}

/******************************************************************
 * Formulär
 ******************************************************************/

function clearForm() {

    document.getElementById("recipeForm").reset();

    document.getElementById("ingredients").innerHTML = "";

    document.getElementById("recipeId").value = "";

    addIngredient();

}

function fillForm(recipe) {

    document.getElementById("recipeId").value =
        recipe.id;

    document.getElementById("title").value =
        recipe.title;

    document.getElementById("portions").value =
        recipe.portions;

    document.getElementById("category").value =
        recipe.category;

    document.getElementById("instructions").value =
        recipe.instructions;

    document.getElementById("notes").value =
        recipe.notes;

    document.getElementById("editorTitle").textContent =
        recipe.title;
        fillIngredients(recipe.ingredients);

}

async function saveRecipe(event) {

    event.preventDefault();

    const isNew = !app.currentRecipeId;

    try {

        const title = document.getElementById("title");

        title.classList.remove("validation-error");

        if (!title.value.trim()) {

            title.classList.add("validation-error");

            title.focus();

            throw new Error("Ange en titel.");

        }

        const recipe = {

            id: app.currentRecipeId,

            title:
                document.getElementById("title").value.trim(),

            portions:
                Number(document.getElementById("portions").value) || 0,

            category:
                document.getElementById("category").value,

            instructions:
                document.getElementById("instructions").value,

            notes:
                document.getElementById("notes").value,

            ingredients:
                collectIngredients()

        };

        const url = isNew
            ? "/recipes"
            : `/recipes/${recipe.id}`;

        const method = isNew
            ? "POST"
            : "PUT";

        const response = await fetch(url, {

            method,

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(recipe)

        });

        if (!response.ok) {

            throw new Error("Kunde inte spara recept.");

        }

        const result = await response.json();

        app.currentRecipeId = result.id;

        await loadRecipeList();

        selectRecipe(result.id);

        showSuccess("Receptet har sparats.");

    }
    catch (error) {

        console.error(error);

        showError(error.message);

    }

}

/******************************************************************
 * Ta bort recept
 ******************************************************************/

async function deleteRecipe() {

    clearStatus();

    if (!app.currentRecipeId) {

        return;

    }

    if (!confirm("Vill du verkligen ta bort receptet?")) {

        return;

    }

    try {

        const response = await fetch(

            `/recipes/${app.currentRecipeId}`,

            {

                method: "DELETE"

            }

        );

        if (!response.ok) {

            throw new Error("Kunde inte ta bort receptet.");

        }

        clearForm();

        app.currentRecipeId = null;

        await loadRecipeList();

        document.getElementById("editorTitle").textContent =
            "Nytt recept";

    }
    catch (error) {

        console.error(error);

        alert(error.message);

    }

}

/******************************************************************
 * Ingredienser
 ******************************************************************/

function addIngredient(data = {}) {

    const ingredients =
        document.getElementById("ingredients");

    const row =
        document.createElement("div");

    row.className = "ingredient-row";

    row.innerHTML = `
        <input type="number"
               step="0.01"
               min="0"
               placeholder="0"
               value="${data.amount ?? ""}">

        <input list="units"
               placeholder="Enhet"
               value="${data.unit ?? ""}">

        <input type="text"
               placeholder="Ingrediens"
               value="${data.ingredient ?? ""}">

        <button type="button" class="delete-button">
            <span class="material-symbols-rounded">delete</span>
        </button>
    `;

    row
        .querySelector(".delete-button")
        .addEventListener("click", () => row.remove());

    ingredients.appendChild(row);

}

function fillIngredients(ingredients) {

    const container =
        document.getElementById("ingredients");

    container.innerHTML = "";

    for (const ingredient of ingredients) {

        addIngredient(ingredient);

    }

}

function collectIngredients() {

    const rows =
        document.querySelectorAll(".ingredient-row");

    // Ta bort gamla felmarkeringar
    document
        .querySelectorAll(".validation-error")
        .forEach(input => input.classList.remove("validation-error"));

    const ingredients = [];

    for (const [index, row] of rows.entries()) {

        const inputs =
            row.querySelectorAll("input");

        const amount =
            inputs[0].value.trim();

        const unit =
            inputs[1].value.trim();

        const ingredient =
            inputs[2].value.trim();

        // Hoppa över helt tomma rader
        if (!amount && !unit && !ingredient) {

            continue;

        }

        // Rubrik/avdelare
        if (unit === "avdelare") {

            if (!ingredient) {

                inputs[2].classList.add("validation-error");

                inputs[2].focus();

                throw new Error(
                    `Rubriken saknas på rad ${index + 1}.`
                );

            }

            ingredients.push({

                sort_order: ingredients.length + 1,

                amount: "",
                unit: "avdelare",
                ingredient

            });

            continue;

        }

        const amountNumber = Number(amount);

        // Vanliga ingredienser
        if (unit && (!amount || amountNumber <= 0)) {

            inputs[0].classList.add("validation-error");

            inputs[0].focus();

            throw new Error(
                `Mängden måste vara större än 0 på rad ${index + 1}.`
            );

        }

        // Ingrediensnamn saknas
        if (!ingredient) {

            inputs[2].classList.add("validation-error");

            inputs[2].focus();

            throw new Error(
                `Ingrediens saknas på rad ${index + 1}.`
            );

        }

        ingredients.push({

            sort_order: ingredients.length + 1,

            amount,
            unit,
            ingredient

        });

    }

    return ingredients;

}

// -----------------------------------------------------------------------------
// Status
// -----------------------------------------------------------------------------

function showError(message) {

    const status =
        document.getElementById("statusMessage");

    status.classList.remove("success");

    status.textContent = message;

}

function showSuccess(message) {

    const status =
        document.getElementById("statusMessage");

    status.classList.add("success");

    status.textContent = message;

    setTimeout(clearStatus, 5000);

}

function clearStatus() {

    const status =
        document.getElementById("statusMessage");

    status.classList.remove("success");

    status.textContent = "";

}

function sortRecipes() {

    app.recipes.sort((a, b) =>
        a.title.localeCompare(
            b.title,
            "sv",
            { sensitivity: "base" }
        )
    );

}

function searchRecipes() {

    const text =
        document
            .getElementById("search")
            .value
            .trim()
            .toLowerCase();

    if (!text) {

        showRecipeList(app.recipes);

        return;

    }

    const filtered =

        app.recipes.filter(recipe =>

            recipe.title
                .toLowerCase()
                .includes(text)

            ||

            recipe.category
                .toLowerCase()
                .includes(text)

        );

    showRecipeList(filtered);

}

// -----------------------------------------------------------------------------
// Publicera sidan
// -----------------------------------------------------------------------------

async function publishToReader() {

    try {

        const response = await fetch("/api/publish", {

            method: "POST"

        });

        const result = await response.json();

        if (!response.ok) {

            throw new Error(result.message);

        }

        showSuccess(result.message);

    }
    catch (err) {

        showError(err.message);

    }

}

// -----------------------------------------------------------------------------
// Öppna Reader
// -----------------------------------------------------------------------------

function openReader() {

    window.open(
        "https://cmart13-alt.github.io/ReceptApp/",
        "_blank"
    );

}