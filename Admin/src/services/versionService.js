function createVersion(recipeCount) {

    return {

        version: Date.now(),
        exported: new Date().toISOString(),
        recipes: recipeCount

    };

}

module.exports = {

    createVersion

};