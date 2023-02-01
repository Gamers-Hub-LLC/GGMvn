"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomString = void 0;
function generateRandomString() {
    let randomString = '';
    const randomNumber = Math.floor(Math.random() * 10);
    for (let i = 0; i < 20 + randomNumber; i++) {
        randomString += String.fromCharCode(33 + Math.floor(Math.random() * 94));
    }
    return randomString;
}
exports.generateRandomString = generateRandomString;
