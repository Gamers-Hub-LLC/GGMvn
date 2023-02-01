import 'module-alias/register';
import ExpressProvider from '@app/providers/express';

import { Request, Response } from "express";

type CMDFunc = (data: any) => void;

// TODO - Find a way to remove this ugly thing
// Globals

enum RequestType {
    GET, POST, PUT, DELETE,
    COMMAND, EVENT
};

type AllowedTypes = EventEntry | RestEntry;
type RestType = RequestType.GET | RequestType.POST | RequestType.PUT | RequestType.DELETE;

// Event Manager

enum EventList {
    MESSAGE = "messageCreate",
    DM_MESSAGE = "message",
    INTERACTION = "interactionCreate"
};

type EventEntry = {
    type: RequestType;
    event: EventList;
    data: any;
    handler?: CMDFunc;
};


// REST Manager

type RestEntry = {
    type: RequestType;
    urlPath: string;
    handler?: CMDFunc;
}

const SubMethods = Symbol('SubMethods');

function _MethodImplementation(entry: AllowedTypes) {
    switch(entry.type) {
        case RequestType.GET:
        case RequestType.POST:
            let rest = (entry as RestEntry);
            console.log(`[Triforce] Registering ${RequestType[entry.type]} route: ${rest.urlPath}`);
            (ExpressProvider.router as any)[RequestType[entry.type].toLowerCase()](rest.urlPath, rest.handler as (req: Request, res: Response) => void);
            break;
    }
};

function _BindRequest( requestData: AllowedTypes, target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    target[SubMethods] = target[SubMethods] || new Map();
    requestData.handler = descriptor.value;
    target[SubMethods].set(propertyKey, requestData);
}

function TwinHandler<T extends { new(...args: any[]): {} }>(Base: T) {
    return class extends Base {
        constructor(...args: any[]) {
            super(...args);
            const subMethods = Base.prototype[SubMethods];
            if (subMethods) {
                subMethods.forEach(( method: AllowedTypes ) => {
                    method.handler = method.handler!.bind(this);
                    _MethodImplementation(method);
                });
            }
        }
    };
}

function EventHandler(event: EventList, data: any = {}) {
    return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) =>
        _BindRequest({ type: RequestType.EVENT, event, data }, target, propertyKey, descriptor);
}

function Route( type: RestType, urlPath: string) {
    return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) =>
        _BindRequest({ type, urlPath }, target, propertyKey, descriptor);
}

export { TwinHandler, EventEntry, EventList, EventHandler, Route, RequestType };