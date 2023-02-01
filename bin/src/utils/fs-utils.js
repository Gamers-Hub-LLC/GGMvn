"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dirscan = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function dirscan(folder, parent) {
    let tmp = parent ? parent : [];
    if (!fs_1.default.statSync(folder).isDirectory())
        return tmp;
    const files = fs_1.default.readdirSync(folder);
    for (const file of files) {
        const fpath = path_1.default.join(folder, file);
        tmp.push(fpath);
        await dirscan(fpath, tmp);
    }
    return tmp;
}
exports.dirscan = dirscan;
