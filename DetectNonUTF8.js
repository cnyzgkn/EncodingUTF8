"use strict";
var detector = require("jschardet");
var config = require("./NonUTF8DetectorConfig.json");
var path = require('path');
var fs = require('fs');
var convertor = require('iconv-lite');
function isUTF8File(filePath) {
    var fileContent = fs.readFileSync(filePath);
    var encoding = detector.detect(fileContent);
    return encoding.encoding == "UTF-8";
}
;

function traverseDirectory(currentDirectory, filter, files) {
    var fileAndDirs = fs.readdirSync(currentDirectory);
    for (var _i = 0, fileAndDirs_1 = fileAndDirs; _i < fileAndDirs_1.length; _i++) {
        var fileOrDir = fileAndDirs_1[_i];
        var fullPath = currentDirectory + path.sep + fileOrDir;
        var stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
            if (filter.allowDir(fullPath))
                traverseDirectory(fullPath, filter, files);
        }
        else if (filter.allowFile(fullPath)) {
            files.push(fullPath);
        }
    }
}

function detectNonUTF8File(filePaths) {
    var results = [];
    for (var _i = 0, filePaths_1 = filePaths; _i < filePaths_1.length; _i++) {
        var filePath = filePaths_1[_i];
        if (!isUTF8File(filePath)) {
            convertFile(filePath);
            results.push(filePath);
        }
    }
    var msg = results.length == 0 ? "UTF-8 check Passed\n" : "UTF-8 check Failed\n" + results.join('\n') + '\n';
    fs.writeFileSync(config.resultFile, msg, { encoding: "utf8", flag: "a+" });
}

function ConvertFiles2UTF8(filePaths) {
    for (var _i = 0, filePaths_1 = filePaths; _i < filePaths_1.length; _i++) {
        var filePath = filePaths_1[_i];
        if (!isUTF8File(filePath)) {
            convertFile2Utf8(filePath);
        }
    }
}


var FileAndDirFilter = (function () {
    function FileAndDirFilter() {
        this.ignoreFolders = [];
        this.fileTypes = [];
        for (var _i = 0, _a = config.ignoreFolders; _i < _a.length; _i++) {
            var toIgnore = _a[_i];
            this.ignoreFolders.push(toIgnore.toLowerCase());
        }
        for (var _b = 0, _c = config.checkFileTypes; _b < _c.length; _b++) {
            var fileType = _c[_b];
            this.fileTypes.push(fileType.toLowerCase());
        }
    }
    FileAndDirFilter.prototype.allowDir = function (dirPath) {
        var dir = dirPath.toLowerCase();
        for (var _i = 0, _a = this.ignoreFolders; _i < _a.length; _i++) {
            var toIgnore = _a[_i];
            if (dir.indexOf(toIgnore) != -1) {
                return false;
            }
        }
        return true;
    };
    FileAndDirFilter.prototype.allowFile = function (filePath) {
        var ext = path.extname(filePath).toLowerCase();
        for (var _i = 0, _a = this.fileTypes; _i < _a.length; _i++) {
            var type = _a[_i];
            if (ext === type) {
                return true;
            }
        }
        return false;
    };
    return FileAndDirFilter;
}());

var files = [];
traverseDirectory(config.checkDirectory, new FileAndDirFilter(), files);
//detectNonUTF8File(files);
ConvertFiles2UTF8(files);

function convertFile2Utf8(filePath) {
    let ext = path.extname(filePath);
    if (ext != ".cpp" && ext != ".h")
        return;
    if (ext != ".cpp" && ext != ".h" && ext != ".vcxproj" && ext != ".filters" && ext != ".js" && ext != ".ui")
        return;
    let fileContent = fs.readFileSync(filePath);
    let encoding = detector.detect(fileContent);
    if (encoding.encoding != "UTF-8") {
        if (encoding.confidence > 0.95) {
            console.log(encoding.encoding + ' ' + filePath + '\n');
            let str = convertor.decode(fileContent, encoding.encoding);
            fileContent = convertor.encode(str, "UTF-8", {addBOM: true});
            fs.writeFileSync(filePath, fileContent, 'utf8');
        } else {
            if (encoding.encoding == "GB2312" || encoding.encoding == "windows-1252") {
                let str = convertor.decode(fileContent, "GB2312");
                fileContent = convertor.encode(str, "UTF-8", {addBOM: true});
                fs.writeFileSync(filePath, fileContent, 'utf8');
            } else {
                console.log(encoding.encoding + ' ' + encoding.confidence + " " + filePath + '\n');
            }
        }
    }
}

//# sourceMappingURL=DetectNonUTF8.js.map