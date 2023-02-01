import 'module-alias/register';
import express, { Express, Router } from "express";
import cors from 'cors';
import path from 'path';
import { dirscan } from '@app/utils/fs-utils';
import StorageProvider from '@app/providers/public';
import { Injectable } from '@app/types/depmgr';
import MavenProvider from './maven';

class ExpressProvider {

    static router: Router = Router();
    app: Express = express();

    @Injectable("dw_storage")
    _public: StorageProvider = new StorageProvider("./public");
    @Injectable("mvn_repository")
    _maven: MavenProvider = new MavenProvider("./mvn");

    constructor(){
        this.init();
    }

    async init(){
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors());
        this.app.use(ExpressProvider.router);
        await this._public.Init();
        await this._maven.Init();

        const port = process.env.PORT || 4000;
        const routes = (await dirscan(path.join(process.cwd(), "src/routes"))).filter(f => f.endsWith(".router.ts"));
        for(const route of routes) {
            const instance = await import (`@app/routes/${path.relative("src/routes", route).replace(/\.[^/.]+$/, "")}`);
            if(instance.default.init) await instance.default.init();
        }

        this.app.listen(port, () => {
            console.log(`[Triforce] Server started on port ${port}`);
        });
    }
}

export default ExpressProvider;