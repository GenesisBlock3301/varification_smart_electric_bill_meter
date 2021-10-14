/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');
// const CryptoJS = require("crypto-js");

class App extends Contract {

    async CreateHID(ctx, key, h_id) {
        const exists = await this.HIDExists(ctx, h_id);
        if (exists) {
            throw new Error(`The HID ${h_id} already register!`);
        }
        const hid = {
            key: key,
            h_id: h_id,
            docType: "hid"
        };
        await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(hid))));
        return JSON.stringify(hid);
    }

    async Registration(ctx, key, h_id, public_key, private_key) {
        const register = {
            key: key,
            h_id: h_id,
            pr: private_key,
            pu: public_key,
            docType: "register"
        };
        await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(register))));
        return JSON.stringify(register);
    }

    
    async SendValue(ctx, key, unit_encry, verify) {
        if (!verify) {
            throw new Error(`Your signature is invalid`);
        }
        // const  unit_value_decryp  = CryptoJS.AES.decrypt(unit_encry, 'secretkey');
        // var originalUnit = unit_value_decryp.toString(CryptoJS.enc.Utf8);
        const value = {
            key: key,
            unit_encry: unit_encry,
            verify: verify,
            docType: "sendvalue"
        };

        await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(value))));
        return JSON.stringify(value);
    }

    async FindRegisterd(ctx, key) {
        const RegisterJSON = await ctx.stub.getState(key); // get the user from chaincode state
        if (!RegisterJSON || RegisterJSON.length === 0) {
            throw new Error(`The registered ${key} does not exist`);
        }
        return RegisterJSON.toString();
    }

    async HIDExists(ctx, h_id) {
        const hidJSON = await ctx.stub.getState(h_id);
        return hidJSON && hidJSON.length > 0;
    }
}

module.exports = App;
