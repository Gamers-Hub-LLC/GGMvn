import fs from 'fs';
import path from 'path';

async function dirscan(folder: string, parent?: [] | string[]) : Promise<string[]> {
    let tmp = parent ? parent : [];

    if(!fs.statSync(folder).isDirectory()) return tmp;

    const files = fs.readdirSync(folder);
    for(const file of files){
        const fpath = path.join(folder, file);
        tmp.push(fpath);
        await dirscan(fpath, tmp);
    }

    return tmp;
}

export { dirscan };