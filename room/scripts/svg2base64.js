const path = require("path");
const fs = require("fs");
const mkdirp = require('mkdirp');

const workspace = path.resolve(__dirname, "..");
const sourcePath = path.resolve(workspace, "src");
const distPath = path.resolve(workspace, "dist");

searchFiles(sourcePath, "assets", function(filePath) {
    const absoluteFilePath = path.resolve(sourcePath, filePath);
    const fileContent = fs.readFileSync(absoluteFilePath, "utf8");
    const base64 = new Buffer(fileContent).toString("base64");

    const targetContent = "exports.default = \"data:image/svg+xml;base64," + base64 + "\";";
    const targetPath = path.resolve(distPath, filePath + ".js");
    const targetDirectory = targetPath.replace(/\/(\w|\.)+$/i, "");

    console.log("CREATE " + JSON.stringify(targetPath));
    mkdirp.sync(targetDirectory);

    fs.writeFileSync(targetPath, targetContent, "utf8");
});

function searchFiles(basicPath, directory, fileHandler) {
    const files = fs.readdirSync(path.resolve(basicPath, directory));

    for (const file of files) {
        const absolutePath = path.resolve(basicPath, directory, file);
        const relativePath = directory + "/" + file;

        if (fs.lstatSync(absolutePath).isDirectory()) {
            searchFiles(basicPath, relativePath, fileHandler);
        } else {
            fileHandler(relativePath);
        }
    }
}

function mkdirs() {

}

