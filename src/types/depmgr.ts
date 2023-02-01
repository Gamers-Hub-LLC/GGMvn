const _entries = new Map<string, any>();

function Injectable(name: string) {
    return function(target: Object, propertyKey: string) {
        let value : any;
        const getter = () => value;
        const setter = (newVal: any) => {
            _entries.set(name, newVal);
            value = newVal;
        };
        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter
        });
    }
}

function Inject(name: string) {
    return function(target: Object, propertyKey: string) {
        let value : any;
        const getter = function() {
            if(!value) value = _entries.get(name);
            return value;
        };
        const setter = function(newVal: any) {
            value = newVal;
        };
        Object.defineProperty(target, propertyKey, {
          get: getter,
          set: setter
        });
    }
}

export { Inject, Injectable };