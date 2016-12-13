declare module 'NonUTF8DetectorConfig' {
    export interface JsonObject {
        resultFile: string;
        checkDirectory: string;
        ignoreFolders: string[];
        checkFileTypes: string[];
    }

}
