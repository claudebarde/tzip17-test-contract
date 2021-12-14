import type { TezosToolkit, ContractMethod } from "@taquito/taquito";
import type { InMemorySigner } from "@taquito/signer";
import { packDataBytes } from "@taquito/michel-codec";
import { buf2hex, hex2buf, validateContractAddress } from "@taquito/utils";
import { blake2b } from "blakejs";

export const createPermit = async (
  contractAddress: string,
  methodName: string,
  methodParams: Array<any>,
  Tezos: TezosToolkit,
  signer: InMemorySigner
) => {
  if (validateContractAddress(contractAddress) !== 3)
    throw "Invalid contract address";

  const contract = await Tezos.contract.at(contractAddress);
  // hashes the parameter for the contract call
  const transferParam: any = contract.methods[methodName](
    ...methodParams
  ).toTransferParams().parameter?.value;
  const transferParamType = contract.entrypoints.entrypoints[methodName];
  // packs the entrypoint call
  const rawPacked = await Tezos.rpc.packData({
    data: transferParam,
    type: transferParamType
  });
  const packedParam = rawPacked.packed;
  const methodHash =
    "05" +
    buf2hex(blake2b(hex2buf(packedParam), undefined, 32).buffer as Buffer);
  // hashes the parameter for the signature
  const chainId = await Tezos.rpc.getChainId();
  const contractStorage: any = await contract.storage();
  const counter = contractStorage.counter;
  const sigParamData: any = {
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
  const sigParamType: any = {
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
  const sigParamPacked = packDataBytes(sigParamData, sigParamType);
  // signs the hash
  const signature = await signer.sign(sigParamPacked.bytes);
  const publicKey = await signer.publicKey();

  return { publicKey, signature: signature.sig, methodHash };
};
