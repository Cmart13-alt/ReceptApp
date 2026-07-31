const { execFile } = require("child_process");
const { promisify } = require("util");

const PATHS = require("../utils/paths");
const logger = require("../utils/logger");

const execFileAsync = promisify(execFile);

async function git(...args) {

    try {

        const { stdout } = await execFileAsync(

            "git",
            args,

            {
                cwd: PATHS.ROOT
            }

        );

        return stdout.trim();

    } catch (error) {

        throw new Error(

            `Git ${args.join(" ")} misslyckades:\n${error.stderr || error.message}`

        );

    }

}

async function status() {

    return git(
        "status",
        "--porcelain"
    );

}

async function hasChanges() {

    return (await status()).length > 0;

}

async function currentBranch() {

    return git(
        "branch",
        "--show-current"
    );

}

async function add() {

    logger.section("Git");

    logger.step("git add");

    await git(
        "add",
        "."
    );

    logger.success("git add");

}

async function commit(message) {

    if (!await hasChanges()) {

        logger.warning(
            "Inga ändringar att committa"
        );

        return false;

    }

    logger.step("git commit");

    await git(
        "commit",
        "-m",
        message
    );

    logger.success("git commit");

    return true;

}

async function push() {

    logger.step("git push");

    await git(
        "push"
    );

    logger.success("git push");

}

async function publish(message) {

    await add();

    const committed = await commit(message);

    if (!committed) {

        return {

            committed: false,
            pushed: false,
            branch: await currentBranch()

        };

    }

    await push();

    return {

        committed: true,
        pushed: true,
        branch: await currentBranch()

    };

}

module.exports = {

    status,
    hasChanges,
    currentBranch,
    add,
    commit,
    push,
    publish

};