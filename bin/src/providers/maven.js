"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MavenRecord = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class MavenRecord {
    constructor(mvnPackage, artifact, version, file) {
        this.package = mvnPackage;
        this.artifact = artifact;
        this.version = version;
        this.internal = path_1.default.basename(file);
        this.file = fs_1.default.readFileSync(file);
    }
    buildXML() {
        return `<?xml version="1.0" encoding="UTF-8"?>
        <project xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd" xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <modelVersion>4.0.0</modelVersion>
            <groupId>${this.package}</groupId>
            <artifactId>${this.artifact}</artifactId>
            <version>${this.version}</version>
        </project>`;
    }
}
exports.MavenRecord = MavenRecord;
class MavenProvider {
    constructor(directory) {
        this.memory = [];
        this.Init = async () => {
            let files = await this.dirscan(this.directory);
            for (const f of files) {
                if (!f.endsWith(".jar"))
                    continue;
                let raw = f.substring(this.directory.length - 1).split(path_1.default.sep);
                this.memory.push(new MavenRecord(raw.slice(0, raw.length - 3).join("."), raw[raw.length - 3], raw[raw.length - 2], f));
            }
        };
        this.ReloadStorage = async () => {
            this.memory = [];
            await this.Init();
        };
        this.Find = (query) => {
            return this.memory.find((entry) => {
                let raw = query.split("/");
                let package_ = raw.slice(1, raw.length - 3).join(".");
                let artifact = raw[raw.length - 3];
                let version = raw[raw.length - 2];
                return entry.package.toLocaleLowerCase() === package_ && entry.artifact.toLocaleLowerCase() === artifact && entry.version.toLocaleLowerCase() === version;
            });
        };
        this.directory = directory;
    }
    async dirscan(folder, parent) {
        let tmp = parent ? parent : [];
        if (!fs_1.default.statSync(folder).isDirectory())
            return;
        const files = fs_1.default.readdirSync(folder);
        for (const file of files) {
            const fpath = path_1.default.join(folder, file);
            tmp.push(fpath);
            await this.dirscan(fpath, tmp);
        }
        return tmp;
    }
}
exports.default = MavenProvider;
