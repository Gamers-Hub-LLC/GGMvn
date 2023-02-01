"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class StorageProvider {
    constructor(directory) {
        this.memory = new Map();
        this.Init = async () => {
            let files = await this.dirscan(this.directory);
            for (const f of files) {
                this.memory.set(f.substring(7), fs_1.default.readFileSync(f));
            }
        };
        this.ReloadStorage = async () => {
            this.memory.clear();
            await this.Init();
        };
        this.GetFile = (file) => {
            return this.memory.has(file) ? this.memory.get(file) : null;
        };
        this.FileExists = (file) => {
            return this.memory.has(file);
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
exports.default = StorageProvider;
