import fs from 'fs';
import path from 'path';

export default class StorageProvider {

    directory: string;
    memory = new Map<string, Buffer>();

    constructor(directory: string) {
        this.directory = directory;
    }

    async dirscan(folder: string, parent?: string[]){
        let tmp = parent ? parent : [];

        if(!fs.statSync(folder).isDirectory()) return;

        const files = fs.readdirSync(folder);
        for(const file of files){
            const fpath = path.join(folder, file);
            tmp.push(fpath);
            await this.dirscan(fpath, tmp);
        }

        return tmp;
    }

    Init = async () => {
        let files = await this.dirscan(this.directory);
        for(const f of files!){
            this.memory.set(f.substring(7), fs.readFileSync(f));
        }
    }

    ReloadStorage = async () => {
        this.memory.clear();
        await this.Init();
    }

    GetFile = (file: string) => {
        return this.memory.has(file) ? this.memory.get(file) : null;
    }

    FileExists = (file: string) => {
        return this.memory.has(file);
    }
}