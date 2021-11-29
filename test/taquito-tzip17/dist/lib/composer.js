"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tzip17 = void 0;
var taquito_tzip17_1 = require("./taquito-tzip17");
var ABSTRACTION_KEY = Symbol("Tzip17ContractAbstractionObjectKey");
function tzip17(abs, context) {
    return Object.assign(abs, {
        // namespace tzip17
        tzip17: function () {
            if (!this[ABSTRACTION_KEY]) {
                this[ABSTRACTION_KEY] = new taquito_tzip17_1.Tzip17ContractAbstraction(this, context);
            }
            return this[ABSTRACTION_KEY];
        }
    });
}
exports.tzip17 = tzip17;
//# sourceMappingURL=composer.js.map