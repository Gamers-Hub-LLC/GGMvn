"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_utils_1 = require("@app/utils/fs-utils");
const public_1 = __importDefault(require("@app/providers/public"));
const depmgr_1 = require("@app/types/depmgr");
const maven_1 = __importDefault(require("./maven"));
class ExpressProvider {
    constructor() {
        this.app = (0, express_1.default)();
        this._public = new public_1.default("./public");
        this._maven = new maven_1.default("./mvn");
        this.init();
    }
    async init() {
        var _a;
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use((0, cors_1.default)());
        this.app.use(ExpressProvider.router);
        await this._public.Init();
        await this._maven.Init();
        const port = process.env.PORT || 4000;
        const routes = (await (0, fs_utils_1.dirscan)(path_1.default.join(process.cwd(), "src/routes"))).filter(f => f.endsWith(".router.ts"));
        for (const route of routes) {
            const instance = await (_a = `@app/routes/${path_1.default.relative("src/routes", route).replace(/\.[^/.]+$/, "")}`, Promise.resolve().then(() => __importStar(require(_a))));
            if (instance.default.init)
                await instance.default.init();
        }
        this.app.listen(port, () => {
            console.log(`[Triforce] Server started on port ${port}`);
        });
    }
}
ExpressProvider.router = (0, express_1.Router)();
__decorate([
    (0, depmgr_1.Injectable)("dw_storage")
], ExpressProvider.prototype, "_public", void 0);
__decorate([
    (0, depmgr_1.Injectable)("mvn_repository")
], ExpressProvider.prototype, "_maven", void 0);
exports.default = ExpressProvider;
