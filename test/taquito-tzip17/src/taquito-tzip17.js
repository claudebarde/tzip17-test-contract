"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tzip17ContractAbstraction = void 0;
const utils_1 = require("@taquito/utils");
const blakejs_1 = require("blakejs");
const michel_codec_1 = require("@taquito/michel-codec");
const sigParamData = (chainId, contractAddress, counter, methodHash) => {
    return {
        prim: "Pair",
        args: [
            {
                prim: "Pair",
                args: [
                    {
                        string: chainId
                    },
                    {
                        string: contractAddress
                    }
                ]
            },
            {
                prim: "Pair",
                args: [
                    {
                        int: counter
                    },
                    {
                        bytes: methodHash
                    }
                ]
            }
        ]
    };
};
const sigParamType = {
    prim: "pair",
    args: [
        {
            prim: "pair",
            args: [
                {
                    prim: "chain_id"
                },
                { prim: "address" }
            ]
        },
        {
            prim: "pair",
            args: [{ prim: "nat" }, { prim: "bytes" }]
        }
    ]
};
class ContractMethodTzip17 {
    constructor(context, contractAbs, method, parameterType, args) {
        this.context = context;
        this.contractAbs = contractAbs;
        this.method = method;
        this.parameterType = parameterType;
        this.args = args;
    }
    async createPermit() {
        const methodHash = await this.prepareMethodHash();
        const packedData = await this.packData(methodHash);
        const signature = await this.context.signer.sign(packedData.bytes);
        const publicKey = await this.context.signer.publicKey();
        return { publicKey, signature: signature.sig, methodHash };
    }
    createTransferParam() {
        return this.method(...this.args).toTransferParams().parameter?.value;
    }
    async packTransfeerParam() {
        const rawPacked = await this.context.packer.packData({
            data: this.createTransferParam(),
            type: this.parameterType
        });
        return rawPacked.packed;
    }
    async prepareMethodHash() {
        const packedParam = await this.packTransfeerParam();
        return (0, utils_1.buf2hex)(Buffer.from((0, blakejs_1.blake2b)(packedParam)));
    }
    async packData(methodHash) {
        const chainId = await this.context.rpc.getChainId();
        const contractStorage = await this.contractAbs.storage();
        const counter = contractStorage.counter;
        return (0, michel_codec_1.packDataBytes)(sigParamData(chainId, this.contractAbs.address, counter, methodHash), sigParamType);
    }
}
class Tzip17ContractAbstraction {
    constructor(contractAbstraction, context) {
        this.contractAbstraction = contractAbstraction;
        this.context = context;
        this.methods = {};
        for (let method in this.contractAbstraction.methods) {
            const methodFx = (...args) => {
                return new ContractMethodTzip17(context, this.contractAbstraction, this.contractAbstraction.methods[method], this.contractAbstraction.entrypoints.entrypoints[method], args);
            };
            this.methods[method] = methodFx;
        }
    }
}
exports.Tzip17ContractAbstraction = Tzip17ContractAbstraction;
