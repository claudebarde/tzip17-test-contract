"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPermit = void 0;
const michel_codec_1 = require("@taquito/michel-codec");
const utils_1 = require("@taquito/utils");
const blakejs_1 = require("blakejs");
const createPermit = async (contractAddress, methodName, methodParams, Tezos, signer) => {
    if ((0, utils_1.validateContractAddress)(contractAddress) !== 3)
        throw "Invalid contract address";
    const contract = await Tezos.contract.at(contractAddress);
    // hashes the parameter for the contract call
    const transferParam = contract.methods[methodName](...methodParams).toTransferParams().parameter?.value;
    const transferParamType = contract.entrypoints.entrypoints[methodName];
    // packs the entrypoint call
    const rawPacked = await Tezos.rpc.packData({
        data: transferParam,
        type: transferParamType
    });
    const packedParam = rawPacked.packed;
    const methodHash = "05" +
        (0, utils_1.buf2hex)((0, blakejs_1.blake2b)((0, utils_1.hex2buf)(packedParam), undefined, 32).buffer);
    // hashes the parameter for the signature
    const chainId = await Tezos.rpc.getChainId();
    const contractStorage = await contract.storage();
    const counter = contractStorage.counter;
    const sigParamData = {
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
    // const sigParamPacked = await Tezos.rpc.packData({
    // data: sigParamData,
    // type: sigParamType
    // });
    const sigParamPacked = (0, michel_codec_1.packDataBytes)(sigParamData, sigParamType);
    // signs the hash
    const signature = await signer.sign(sigParamPacked.bytes);
    const publicKey = await signer.publicKey();
    return { publicKey, signature: signature.sig, methodHash };
};
exports.createPermit = createPermit;
