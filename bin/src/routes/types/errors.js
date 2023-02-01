"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Responses = void 0;
var Responses;
(function (Responses) {
    Responses[Responses["OK"] = 200] = "OK";
    Responses[Responses["NOT_VERIFIED"] = 201] = "NOT_VERIFIED";
    Responses[Responses["INVALID_CREDENTIALS"] = 202] = "INVALID_CREDENTIALS";
    Responses[Responses["DUPLICATED_ACCOUNT"] = 203] = "DUPLICATED_ACCOUNT";
    Responses[Responses["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    Responses[Responses["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    Responses[Responses["FORBIDDEN"] = 403] = "FORBIDDEN";
    Responses[Responses["NOT_FOUND"] = 404] = "NOT_FOUND";
    Responses[Responses["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    Responses[Responses["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
})(Responses || (Responses = {}));
exports.Responses = Responses;
