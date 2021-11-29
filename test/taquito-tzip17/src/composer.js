"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tzip17 = void 0;
const taquito_tzip17_1 = require("./taquito-tzip17");
const ABSTRACTION_KEY = Symbol("Tzip17ContractAbstractionObjectKey");
function tzip17(abs, context) {
    return Object.assign(abs, {
        // namespace tzip17
        tzip17() {
            if (!this[ABSTRACTION_KEY]) {
                this[ABSTRACTION_KEY] = new taquito_tzip17_1.Tzip17ContractAbstraction(this, context);
            }
            return this[ABSTRACTION_KEY];
        }
    });
}
exports.tzip17 = tzip17;
