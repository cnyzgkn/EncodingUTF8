let detector = require("jschardet");
import {JsonObject as Config} from 'NonUTF8DetectorConfig';
const config : Config = require("./NonUTF8DetectorConfig.json");
import * as path from 'path';
import * as fs from 'fs';

function isUTF8File(filePath: string) : boolean {
    let fileContent = fs.readFileSync(filePath);
    let encoding = detector.detect(fileContent);
    return encoding.encoding == "UTF-8";
}

interface IFileDirFilter {
    allowDir(dirPath: string) : boolean;
    allowFile(filePath: string) : boolean;
};

function traverseDirectory(currentDirectory : string, filter : IFileDirFilter, files: Array<string>) : void {
    const fileAndDirs = fs.readdirSync(currentDirectory);
    for (const fileOrDir of fileAndDirs) {
        const fullPath = currentDirectory + path.sep + fileOrDir;
        let stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
            if (filter.allowDir(fullPath))
                traverseDirectory(fullPath, filter, files);
        } else if (filter.allowFile(fullPath)) {
            files.push(fullPath);
        }
    }
}

function detectNonUTF8File(filePaths : Array<string>) : void {
    let results : Array<string> = [];
    for (const filePath of filePaths) {
        if (!isUTF8File(filePath)) {
            results.push(filePath);
        }
    }

    let msg = results.length == 0 ? "UTF-8 check Passed\n" : "UTF-8 check Failed\n" + results.join('\n') + '\n';
    fs.writeFileSync(config.resultFile, msg, {encoding:"utf8", flag:"a+"});
}

class FileAndDirFilter implements IFileDirFilter {
    ignoreFolders : Array<string> = [];
    fileTypes: Array<string> = [];
    constructor() {
        for (let toIgnore of config.ignoreFolders) {
            this.ignoreFolders.push(toIgnore.toLowerCase());
        }
        for (let fileType of config.checkFileTypes) {
            this.fileTypes.push(fileType.toLowerCase());
        }
    }

    allowDir(dirPath: string) : boolean {
        let dir = dirPath.toLowerCase();
        for (let toIgnore of this.ignoreFolders) {
            if (dir.indexOf(toIgnore) != -1) {
                return false;
            }
        }
        return true;
    }

    allowFile(filePath: string) : boolean{
        const ext = path.extname(filePath).toLowerCase();
        for (let type of this.fileTypes) {
            if (ext === type) {
                return true;
            }
        }
        return false;
    }
}


let files = [];
traverseDirectory(config.checkDirectory, new FileAndDirFilter(), files);
detectNonUTF8File(files);

class Demo {

}

Demo a;
//
// function isDesiredFileToCheck(filePath: string) : boolean {
//     for (const folder of config.skipFolders) {
//         if (filePath.indexOf(folder) != -1) {
//             return false;
//         }
//     }
//
//     const ext = path.extname(filePath);
//     let isDesiredType = config.checkFileTypes.includes(ext);
//     return isDesiredType;
// }

// function testAndOutputNonUTF8File(filePath: string) : void {
//     if (isDesiredFileToCheck(filePath) && !isUTF8File(filePath)) {
//         let msg = filePath + '\n';
//         fs.writeSync(resultFileId, msg);
//     }
// }

// traverseDirectory(checkDirectory, (fileName, fileFolder) => {
//     let filePath = fileFolder + path.sep + fileName;
//     testAndOutputNonUTF8File(filePath);
// });

// let noConfidenceId = fs.openSync("c:/other/encoding/noConfidence.txt", 'w+');

// function convertFile(filename, pathToFile) {
//     if (pathToFile.includes("GeneratedFiles"))
//         return;
//     let filePath = pathToFile + '/' + filename;
//     let ext = path.extname(filePath);
//     if (ext != ".cpp" && ext != ".h" && ext != ".vcxproj" && ext != ".filters" && ext != ".js" && ext != ".ui")
//         return;
//     let fileContent = fs.readFileSync(filePath);
//     let encoding = detector.detect(fileContent);
//     if (encoding.encoding != "UTF-8") {
//         if (encoding.confidence > 0.95) {
//             let msg = encoding.encoding + ' ' + filePath + '\n';
//             fs.writeSync(resultFileId, msg);
//             let str = convertor.decode(fileContent, encoding.encoding);
//             fileContent = convertor.encode(str, "UTF-8", {addBOM: true});
//             fs.writeFileSync(filePath, fileContent, 'utf8');
//         } else {
//             if (encoding.encoding == "GB2312" || encoding.encoding == "windows-1252") {
//                 let str = convertor.decode(fileContent, "GB2312");
//                 fileContent = convertor.encode(str, "UTF-8", {addBOM: true});
//                 fs.writeFileSync(filePath, fileContent, 'utf8');
//             } else {
//                 let msg = encoding.encoding + ' ' + encoding.confidence + " " + filePath + '\n';
//                 fs.writeSync(noConfidenceId, msg);
//             }
//         }
//     }
// }




