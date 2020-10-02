export class Enum {
    constructor(object) {
        for (let key in object) {
            this[key] = object[key];
            this[object[key]] = key;
        }
    }
}