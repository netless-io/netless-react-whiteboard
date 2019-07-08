const path = require("path");
const fs = require("fs");
const mkdirp = require('mkdirp');

const workspace = path.resolve(__dirname, "..");
const sourcePath = path.resolve(workspace, "src");
const distPath = path.resolve(workspace, "dist");

searchFiles(sourcePath, "assets", function(filePath) {
    const absoluteFilePath = path.resolve(sourcePath, filePath);
    const targetContent = convertToBase64(absoluteFilePath);
    const targetPath = path.resolve(distPath, filePath + ".js");
    const targetDirectory = targetPath.replace(/\/(\w|\.)+$/i, "");

    mkdirp.sync(targetDirectory);

    fs.writeFileSync(targetPath, targetContent, "utf8");
});

function convertToBase64(filePath) {
    switch (filePath.match(/\.[a-zA-Z0-9]+$/i)[0]) {
        case ".svg": {
            const fileContent = fs.readFileSync(filePath, "utf8");
            const base64 = new Buffer(fileContent).toString("base64");

            return "exports.default = \"data:image/svg+xml;base64," + base64 + "\";";
        }
        case ".jpeg": {
            const fileBuffer = fs.readFileSync(filePath);
            const base64 = fileBuffer.toString("base64");

            return "exports.default = \"data:image/jpeg;base64," + base64 + "\";";
        }
        default: {
            throw new Error("unexpect file format " + filePath);
        }
    }
}

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
