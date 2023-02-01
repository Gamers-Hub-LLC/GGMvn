"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uuid = exports.verifyPassword = exports.hashPassword = void 0;
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
const config = {
    hashBytes: 32,
    saltBytes: 16,
    iterations: 872791
};
async function hashPassword(password) {
    let salt = await crypto_1.default.randomBytes(config.saltBytes);
    let hash = crypto_1.default.pbkdf2Sync(password, salt, config.iterations, config.hashBytes, 'sha1');
    let combined = Buffer.alloc(hash.length + salt.length + 8);
    combined.writeUInt32BE(salt.length, 0);
    combined.writeUInt32BE(config.iterations, 4);
    salt.copy(combined, 8);
    hash.copy(combined, salt.length + 8);
    return combined.toString('base64');
}
exports.hashPassword = hashPassword;
async function verifyPassword(password, hashb64) {
    let combined = Buffer.from(hashb64, 'base64');
    let saltBytes = combined.readUInt32BE(0);
    let hashBytes = combined.length - saltBytes - 8;
    let iterations = combined.readUInt32BE(4);
    let salt = combined.slice(8, saltBytes + 8);
    let hash = combined.toString('binary', saltBytes + 8);
    let hbuf = crypto_1.default.pbkdf2Sync(password, salt, iterations, hashBytes, 'sha1');
    return hbuf.toString('binary') === hash;
}
exports.verifyPassword = verifyPassword;
function uuid() {
    return (0, uuid_1.v4)();
}
exports.uuid = uuid;
