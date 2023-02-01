"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Injectable = exports.Inject = void 0;
const _entries = new Map();
function Injectable(name) {
    return function (target, propertyKey) {
        let value;
        const getter = () => value;
        const setter = (newVal) => {
            _entries.set(name, newVal);
            value = newVal;
        };
        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter
        });
    };
}
exports.Injectable = Injectable;
function Inject(name) {
    return function (target, propertyKey) {
        let value;
        const getter = function () {
            if (!value)
                value = _entries.get(name);
            return value;
        };
        const setter = function (newVal) {
            value = newVal;
        };
        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter
        });
    };
}
exports.Inject = Inject;
