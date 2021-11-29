import { Context, ContractAbstraction, ContractProvider, Wallet } from "@taquito/taquito";
import { Tzip17ContractAbstraction } from "./taquito-tzip17";
declare const ABSTRACTION_KEY: unique symbol;
export declare function tzip17<T extends ContractAbstraction<ContractProvider | Wallet>>(abs: T, context: Context): T & {
    tzip17(this: ContractAbstraction<ContractProvider | Wallet> & {
        [ABSTRACTION_KEY]?: Tzip17ContractAbstraction;
    }): Tzip17ContractAbstraction;
};
export {};
