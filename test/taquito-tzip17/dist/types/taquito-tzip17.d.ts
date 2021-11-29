import { Context, ContractAbstraction, ContractMethod, ContractProvider, Wallet } from "@taquito/taquito";
declare class ContractMethodTzip17<T extends ContractProvider | Wallet> {
    private context;
    private contractAbs;
    private method;
    private parameterType;
    private args;
    constructor(context: Context, contractAbs: ContractAbstraction<T>, method: (...args: any[]) => ContractMethod<T>, parameterType: object, args: any[]);
    createPermit(): Promise<{
        publicKey: string;
        signature: string;
        methodHash: string;
    }>;
    private createTransferParam;
    private packTransfeerParam;
    private prepareMethodHash;
    private packData;
}
export declare class Tzip17ContractAbstraction {
    private contractAbstraction;
    private context;
    methods: {
        [key: string]: (...args: any[]) => ContractMethodTzip17<ContractProvider | Wallet>;
    };
    constructor(contractAbstraction: ContractAbstraction<ContractProvider | Wallet>, context: Context);
}
export {};
