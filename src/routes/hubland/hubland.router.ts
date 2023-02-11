import { TwinHandler, Route, RequestType } from '@app/types/handler';
import { Request, Response } from 'express';
import mime from 'mime-types';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Readable } from 'stream';
import { Inject } from '@app/types/depmgr';
import StorageProvider from '@app/providers/public';
import MavenProvider, { MavenRecord } from '@app/providers/maven';
import convert from 'xml-js';
import crypto from 'crypto';

@TwinHandler
class ShipRouter {

    @Inject("dw_storage")
    _public: StorageProvider | undefined;
    @Inject("mvn_repository")
    _maven:  MavenProvider | undefined;
    _preloads: Map<string, number> = new Map();

    @Route( RequestType.GET, "/shared/*" )
    async shared (req: Request, res: Response) {
        let filePath = req.url.substring(8);

        if(this._public?.FileExists(filePath)) {
            let stream = new Readable();
            let clientIp = req.headers['cf-connecting-ip'] as string || req.ip;
            stream.push(this._public.GetFile(filePath));
            stream.push(null);

            let mimeType = mime.lookup(filePath) as string;

            res.set('Content-disposition', `attachment; filename=${filePath}`);
            res.set('Content-Type', mimeType);
            stream.pipe(res);
            return;
        }

        return res.sendStatus(404);
    }

    static async Auth(req: Request, res: Response, next: any) {
        const authorization = req.headers.authorization?.split(' ');
        if(authorization && authorization[0] === 'Basic') {
            const [username, password] = Buffer.from(authorization[1], 'base64').toString().split(':');
            if(username === "mcdev" && password === "9kw&lQMJVj!Ym2S!t4rT!2ix7NT") {
                next();
                return;
            }
        }

        res.set('WWW-Authenticate', 'Basic realm="Authorization Required"');
        return res.sendStatus(401);
    }

    createVirtualStream(){
        let tmp = path.join(os.tmpdir(), new Date().getTime().toString());
        let stream = fs.createWriteStream(tmp);
        stream.on('finish', () => {
            stream.emit('end', fs.readFileSync(tmp));
            fs.rmSync(tmp);
        });
        return stream;
    }

    fetchFile(req: Request): Promise<Buffer> {
        return new Promise((resolve) => {
            let stream = this.createVirtualStream();
            stream.on('end', (data) => {
                resolve(data);
            });
            req.pipe(stream);
        })
    }

    @Route( RequestType.GET, "/repository" )
    async parent (req: Request, res: Response) {
        res.send(`
            <html>
                <head>
                    <title>Repository</title>
                    <link rel="stylesheet" href="shared/app.css">
                </head>
                <body>
                    <div id="main">
                        <div class="fof">
                            <h1><3</h1>
                        </div>
                    </div>
                </body>
            </html>
        `)
    }

    @Route( RequestType.GET, "/repository/*", [ ShipRouter.Auth ] )
    async repository (req: Request, res: Response) {
        let filePath = req.url.substring(11);
        let record = this._maven?.Find(filePath.toLocaleLowerCase());

        if(record) {
            if(filePath.endsWith(".pom")){
                res.set('Content-Type', "text/xml");
                res.send(record.buildPOM());
                return;
            }

            if(filePath.endsWith("maven-metadata.xml")){
                res.set('Content-Type', "text/xml");
                res.send(record.buildMetadata());
                return;
            }

            if(filePath.endsWith(".jar.md5")){
                res.set('Content-Type', "text/plain");
                res.send(crypto.createHash('md5').update(record.file!).digest("hex"));
                return;
            }

            if(filePath.endsWith(".jar.sha1")){
                res.set('Content-Type', "text/plain");
                res.send(crypto.createHash('sha1').update(record.file!).digest("hex"));
                return;
            }

            if(filePath.endsWith("maven-metadata.xml.md5")){
                res.set('Content-Type', "text/plain");
                res.send(`./mvn${filePath} ${crypto.createHash('sha1').update(record.file!).digest("hex")}`);
                return;
            }

            if(filePath.endsWith("maven-metadata.xml.sha1")){
                res.set('Content-Type', "text/plain");
                res.send(`${path.resolve("mvn/"+filePath)} ${crypto.createHash('sha1').update(record.file!).digest("hex")}`);
                return;
            }

            let stream = new Readable();
            stream.push(record.file);
            stream.push(null);

            res.set('Content-disposition', `attachment; filename=${record.internal}`);
            res.set('Content-Type', 'application/java-archive');
            stream.pipe(res);
            return;
        }

        return res.sendStatus(404);
    }

    @Route( RequestType.PUT, "/repository/*", [ ShipRouter.Auth ] )
    async repositoryPub (req: Request, res: Response) {

        console.log(req.headers);

        let filePath = req.url.substring(11);
        if(filePath.endsWith("maven-metadata.xml")){
            let data = await this.fetchFile(req);
            let result = (convert.xml2js(data.toString('utf8'), { compact: true }) as any).metadata;
            let artifact = result.artifactId._text as string;
            let record = new MavenRecord(
                result.groupId._text as string,
                artifact,
                (result.versioning.latest ? result.versioning.latest : result.version)._text as string
            );

            this._preloads.set(artifact, this._maven!.Preload(record));
        }

        if(filePath.endsWith(".jar")){
            for(let [key, value] of this._preloads){
                if(filePath.includes(key)){
                    let data = await this.fetchFile(req);
                    let record = this._maven!.GetByID(value)!;
                    record.internal = filePath.substring(filePath.lastIndexOf("/") + 1);
                    record.file = data;
                    this._maven!.Finish(value, record);
                    this._preloads.delete(key);
                    break;
                }
            }
        }

        return res.sendStatus(200);
    }
}

export default new ShipRouter();