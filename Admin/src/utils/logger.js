const LINE = "────────────────────────────────────────";
const TITLE = "════════════════════════════════════════";

function blank() {

    console.log();

}

function header(title) {

    blank();

    console.log(TITLE);
    console.log(` ${title}`);
    console.log(TITLE);

}

function section(title) {

    blank();
    console.log(`📦 ${title}`);

}

function step(text) {

    console.log(`  • ${text}`);

}

function success(text) {

    console.log(`  ✓ ${text}`);

}

function warning(text) {

    console.log(`  ⚠ ${text}`);

}

function error(text) {

    console.error(`  ✗ ${text}`);

}

function footer(result) {

    blank();

    console.log(LINE);

    if (result.success) {

        console.log("✅ Publicering klar");

    } else {

        console.log("❌ Publiceringen misslyckades");

    }

    if (result.version) {
        console.log(`Version : ${result.version}`);
    }

    if (result.recipeCount !== undefined) {
        console.log(`Recept  : ${result.recipeCount}`);
    }

    if (result.git?.branch) {
        console.log(`Branch  : ${result.git.branch}`);
    }

    console.log(LINE);
    blank();

}

module.exports = {

    header,
    section,
    step,
    success,
    warning,
    error,
    footer

};