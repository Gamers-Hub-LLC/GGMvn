import fs from 'fs';
import path from 'path';

class MavenRecord {
    package: string;
    artifact: string;
    version: string;
    internal: string | undefined;
    file: Buffer | undefined;

    constructor(mvnPackage: string, artifact: string, version: string, file?: string ) {
        this.package = mvnPackage;
        this.artifact = artifact;
        this.version = version;
        if(file) {
            this.internal = path.basename(file);
            this.file = fs.readFileSync(file);
        }
    }

    buildPOM(): string {
        return `<?xml version="1.0" encoding="UTF-8"?>
        <project xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd" xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <modelVersion>4.0.0</modelVersion>
            <groupId>${this.package}</groupId>
            <artifactId>${this.artifact}</artifactId>
            <version>${this.version}</version>
        </project>`;
    }

    buildMetadata(): string {
        return `<metadata>
            <plugins>
            </plugins>
        </metadata>`;
    }
}

class MavenProvider {

    directory: string;
    memory: MavenRecord[] = [];

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
            if(!f.endsWith(".jar")) continue;
            let raw = f.substring(this.directory.length - 1).split(path.sep);
            this.memory.push(new MavenRecord(
                raw.slice(0, raw.length - 3).join("."),
                raw[raw.length - 3],
                raw[raw.length - 2],
                f,
            ));
        }
    }

    ReloadStorage = async () => {
        this.memory = [];
        await this.Init();
    }

    Find = (query: string): MavenRecord | undefined => {
        return this.memory.find((entry) => {
            let raw = query.split("/");
            let package_ = raw.slice(1, raw.length - 3).join(".");
            let artifact = raw[raw.length - 3];
            let version = raw[raw.length - 2];
            return entry.package.toLocaleLowerCase() === package_ && entry.artifact.toLocaleLowerCase() === artifact && entry.version.toLocaleLowerCase() === version;
        });
    }

    GetByID = (id: number): MavenRecord | undefined => {
        return this.memory[id];
    }

    Preload = (record: MavenRecord): number => {
        this.memory.push(record);
        return this.memory.length - 1;
    }

    Finish = (index: number, record: MavenRecord) => {
        this.memory[index] = record;
        let parent = path.join(this.directory, record.package.replace(/\./g, path.sep), record.artifact, record.version);
        fs.mkdirSync(parent, { recursive: true });
        fs.writeFileSync(path.join(parent, record.internal!), record.file!);
    }
}

export default MavenProvider;
export { MavenRecord };