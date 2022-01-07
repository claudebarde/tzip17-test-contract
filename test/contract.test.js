"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const taquito_1 = require("@taquito/taquito");
const signer_1 = require("@taquito/signer");
const utils_1 = require("@taquito/utils");
const composer_1 = require("./taquito-tzip17/src/composer");
// const { permit_fa12_smartpy } = require("../contract/contract.js");
const permitContract = require("../contract/contract.json");
let Tezos;
let signer;
const alice = {
    sk: "edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq",
    pk: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb"
};
const bob = {
    sk: "edsk3RFfvaFaxbHx8BMtEW1rKQcPtDML3LXjNqMNLCzC3wLC1bWbAt",
    pk: "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6"
};
jest.setTimeout(50000);
describe(`Test of contracts having a permit for tzip-17:`, () => {
    let contractAddress = "";
    let permitData;
    beforeAll(async () => {
        Tezos = new taquito_1.TezosToolkit("http://localhost:20000");
        signer = new signer_1.InMemorySigner(alice.sk);
        Tezos.setSignerProvider(signer);
        const op = await Tezos.contract.transfer({ to: bob.pk, amount: 1 });
        await op.confirmation();
    });
    test("Originates the permit contract", async () => {
        const url = "https://storage.googleapis.com/tzip-16/permit_metadata.json";
        const bytesUrl = (0, utils_1.char2Bytes)(url);
        const metadata = new taquito_1.MichelsonMap();
        metadata.set("", bytesUrl);
        const op = await Tezos.contract.originate({
            code: permitContract,
            storage: {
                balances: new taquito_1.MichelsonMap(),
                allowances: new taquito_1.MichelsonMap(),
                total_supply: 0,
                counter: 0,
                default_expiry: 5000,
                permits: new taquito_1.MichelsonMap(),
                user_expiries: new taquito_1.MichelsonMap(),
                permit_expiries: new taquito_1.MichelsonMap(),
                max_expiry: 5000,
                metadata,
                token_metadata: new taquito_1.MichelsonMap(),
                admin: alice.pk
            }
            /*storage: {
              administrator: await Tezos.signer.publicKeyHash(),
              balances: new MichelsonMap(),
              counter: "0",
              default_expiry: "50000",
              max_expiry: "2628000",
              metadata: metadata,
              paused: false,
              permit_expiries: new MichelsonMap(),
              permits: new MichelsonMap(),
              totalSupply: "0",
              user_expiries: new MichelsonMap()
            }*/
        });
        await op.confirmation();
        expect(op.hash).toBeDefined();
        expect(op.includedInBlock).toBeLessThan(Number.POSITIVE_INFINITY);
        expect(op.contractAddress).toBeDefined();
        if (op.contractAddress) {
            contractAddress = op.contractAddress;
            // mints tokens to be transferred later in test
            const contract = await op.contract();
            let balance;
            const recipient = alice.pk;
            const storage = await contract.storage();
            balance = await storage.balances.get(recipient);
            expect(balance).toBeUndefined();
            try {
                const mintingOp = await contract.methods.mint(recipient, 200).send();
                await mintingOp.confirmation();
            }
            catch (error) {
                console.log(error);
            }
            const newStorage = await contract.storage();
            balance = await newStorage.balances.get(recipient);
            expect(balance).not.toBeUndefined();
        }
    });
    test("Transfers work properly", async () => {
        expect(contractAddress).toBeDefined();
        // transferring Alice's tokens to Bob
        const contract = await Tezos.contract.at(contractAddress);
        const initialStorage = await contract.storage();
        const bobInitialBalance = await initialStorage.balances.get(bob.pk);
        expect(bobInitialBalance).toBeUndefined();
        const tokens = 20;
        const op = await contract.methods.transfer(alice.pk, bob.pk, tokens).send();
        await op.confirmation();
        expect(op.hash).toBeDefined();
        expect(op.includedInBlock).toBeLessThan(Number.POSITIVE_INFINITY);
        const storage = await contract.storage();
        const bobBalance = await storage.balances.get(bob.pk);
        expect(bobBalance.toNumber()).toEqual(tokens);
    });
    test("Permit can be submitted and set", async () => {
        expect(contractAddress).toBeDefined();
        const contract = await Tezos.contract.at(contractAddress, composer_1.tzip17);
        try {
            const permit = await contract
                .tzip17()
                .methods.transfer(alice.pk, bob.pk, 14)
                .createPermit();
            permitData = { address: alice.pk, hash: permit.methodHash };
            /*console.log("TZIP-17 package param hash:", permit);
            console.log(
              "Original param hash:",
              await createPermit(
                contractAddress,
                "transfer",
                [alice.pk, bob.pk, 14],
                Tezos,
                signer
              )
            );*/
            const permitOp = await contract.methods
                .permit([
                { 0: permit.publicKey, 1: permit.signature, 2: permit.methodHash }
            ])
                .send();
            await permitOp.confirmation();
            expect(permitOp.hash).toBeDefined();
            expect(permitOp.includedInBlock).toBeLessThan(Number.POSITIVE_INFINITY);
            const storage = await contract.storage();
            const permitInStorage = await storage.permits.get({
                0: permitData.address,
                1: permitData.hash
            });
            //console.log(permitInStorage);
            //console.log((await Tezos.rpc.getBlock()).header.timestamp);
            expect(permitInStorage).toBeDefined();
        }
        catch (error) {
            console.log(JSON.stringify(error, null, 2));
            expect(error).toBeUndefined();
        }
    });
    test("Permit can be consumed", async () => {
        expect(contractAddress).not.toBeUndefined();
        const contract = await Tezos.contract.at(contractAddress);
        // changes the signer to test the permit
        const newSigner = new signer_1.InMemorySigner(bob.sk);
        Tezos.setSignerProvider(newSigner);
        // this should not work
        expect(async () => {
            const op = await contract.methods.transfer(alice.pk, bob.pk, 15).send();
            await op.confirmation();
        }).rejects;
        /*try {
          const op = await contract.methods.transfer(alice.pk, bob.pk, 15).send();
          await op.confirmation();
        } catch (error) {
          console.error(error);
        }*/
        // this should work
        try {
            const op = await contract.methods.transfer(alice.pk, bob.pk, 14).send();
            await op.confirmation();
            expect(op.hash).toBeDefined();
            expect(op.includedInBlock).toBeLessThan(Number.POSITIVE_INFINITY);
        }
        catch (error) {
            expect(error).toBeUndefined();
            console.log(JSON.stringify(error, null, 2));
        }
    });
});
