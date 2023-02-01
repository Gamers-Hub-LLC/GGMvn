"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestType = exports.Route = exports.EventHandler = exports.EventList = exports.TwinHandler = void 0;
require("module-alias/register");
const express_1 = __importDefault(require("@app/providers/express"));
// TODO - Find a way to remove this ugly thing
// Globals
var RequestType;
(function (RequestType) {
    RequestType[RequestType["GET"] = 0] = "GET";
    RequestType[RequestType["POST"] = 1] = "POST";
    RequestType[RequestType["PUT"] = 2] = "PUT";
    RequestType[RequestType["DELETE"] = 3] = "DELETE";
    RequestType[RequestType["COMMAND"] = 4] = "COMMAND";
    RequestType[RequestType["EVENT"] = 5] = "EVENT";
})(RequestType || (RequestType = {}));
exports.RequestType = RequestType;
;
// Event Manager
var EventList;
(function (EventList) {
    EventList["MESSAGE"] = "messageCreate";
    EventList["DM_MESSAGE"] = "message";
    EventList["INTERACTION"] = "interactionCreate";
})(EventList || (EventList = {}));
exports.EventList = EventList;
;
const SubMethods = Symbol('SubMethods');
function _MethodImplementation(entry) {
    switch (entry.type) {
        case RequestType.GET:
        case RequestType.POST:
            let rest = entry;
            console.log(`[Triforce] Registering ${RequestType[entry.type]} route: ${rest.urlPath}`);
            express_1.default.router[RequestType[entry.type].toLowerCase()](rest.urlPath, rest.handler);
            break;
    }
}
;
function _BindRequest(requestData, target, propertyKey, descriptor) {
    target[SubMethods] = target[SubMethods] || new Map();
    requestData.handler = descriptor.value;
    target[SubMethods].set(propertyKey, requestData);
}
function TwinHandler(Base) {
    return class extends Base {
        constructor(...args) {
            super(...args);
            const subMethods = Base.prototype[SubMethods];
            if (subMethods) {
                subMethods.forEach((method) => {
                    method.handler = method.handler.bind(this);
                    _MethodImplementation(method);
                });
            }
        }
    };
}
exports.TwinHandler = TwinHandler;
function EventHandler(event, data = {}) {
    return (target, propertyKey, descriptor) => _BindRequest({ type: RequestType.EVENT, event, data }, target, propertyKey, descriptor);
}
exports.EventHandler = EventHandler;
function Route(type, urlPath) {
    return (target, propertyKey, descriptor) => _BindRequest({ type, urlPath }, target, propertyKey, descriptor);
}
exports.Route = Route;
