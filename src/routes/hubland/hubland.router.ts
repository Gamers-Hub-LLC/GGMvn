import { TwinHandler, Route, RequestType } from '@app/types/handler';
import { Request, Response } from 'express';
import mime from 'mime-types';
import { Readable } from 'stream';
import { Inject } from '@app/types/depmgr';
import StorageProvider from '@app/providers/public';
import MavenProvider, { MavenRecord } from '@app/providers/maven';

@TwinHandler
class ShipRouter {

    @Inject("dw_storage")
    _public: StorageProvider | undefined;
    @Inject("mvn_repository")
    _maven:  MavenProvider | undefined;

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

    @Route( RequestType.GET, "/repository/*" )
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
}

export default new ShipRouter();