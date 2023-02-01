"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handler_1 = require("@app/types/handler");
const mime_types_1 = __importDefault(require("mime-types"));
const stream_1 = require("stream");
const depmgr_1 = require("@app/types/depmgr");
let ShipRouter = class ShipRouter {
    async shared(req, res) {
        var _a;
        let filePath = req.url.substring(8);
        if ((_a = this._public) === null || _a === void 0 ? void 0 : _a.FileExists(filePath)) {
            let stream = new stream_1.Readable();
            let clientIp = req.headers['cf-connecting-ip'] || req.ip;
            stream.push(this._public.GetFile(filePath));
            stream.push(null);
            let mimeType = mime_types_1.default.lookup(filePath);
            res.set('Content-disposition', `attachment; filename=${filePath}`);
            res.set('Content-Type', mimeType);
            stream.pipe(res);
            return;
        }
        return res.sendStatus(404);
    }
    async repository(req, res) {
        var _a;
        let filePath = req.url.substring(11);
        let record = (_a = this._maven) === null || _a === void 0 ? void 0 : _a.Find(filePath);
        if (record) {
            let stream = new stream_1.Readable();
            let clientIp = req.headers['cf-connecting-ip'] || req.ip;
            stream.push(record.file);
            stream.push(null);
            let mimeType = mime_types_1.default.lookup(filePath);
            res.set('Content-disposition', `attachment; filename=${filePath}`);
            res.set('Content-Type', mimeType);
            stream.pipe(res);
            return;
        }
        return res.sendStatus(404);
    }
};
__decorate([
    (0, depmgr_1.Inject)("dw_storage")
], ShipRouter.prototype, "_public", void 0);
__decorate([
    (0, depmgr_1.Inject)("mvn_repository")
], ShipRouter.prototype, "_maven", void 0);
__decorate([
    (0, handler_1.Route)(handler_1.RequestType.GET, "/shared/*")
], ShipRouter.prototype, "shared", null);
__decorate([
    (0, handler_1.Route)(handler_1.RequestType.GET, "/repository/*")
], ShipRouter.prototype, "repository", null);
ShipRouter = __decorate([
    handler_1.TwinHandler
], ShipRouter);
exports.default = new ShipRouter();
