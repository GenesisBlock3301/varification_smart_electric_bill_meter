/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');
const { verify } = require('crypto');
const channelName = 'mychannel';
const chaincodeName = 'app';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';


async function main() {
	try {
		// build an in memory object with the network configuration (also known as a connection profile)
		const ccp = buildCCPOrg1();

		// build an instance of the fabric ca services client based on
		// the information in the network configuration
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath);

		// in a real application this would be done on an administrative flow, and only once
		await enrollAdmin(caClient, wallet, mspOrg1);

		// in a real application this would be done only when a new user was required to be added
		// and would be part of an administrative flow
		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

		// Create a new gateway instance for interacting with the fabric network.
		// In a real application this would be done as the backend server session is setup for
		// a user that has been verified.
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);

			// ExpressJs
			const express = require("express");
			const app = express();
			app.use(express.urlencoded({ extended: false }));
			app.use(express.json());
			const ecc = require('eosjs-ecc')
			const elliptic = require("elliptic")
			const sha256 = require("sha256")
			const CryptoJS = require("crypto-js");
			let ec = new elliptic.ec("secp256k1")



			const port = 3000;

			app.get("/hello", function (req, res) {
				res.json({ status: "Hello working" })
			})
			// create hid
			app.post("/hid", async function (req, res) {
				const { h_id } = req.body;
				const hidHash = sha256(h_id)
				const key = `hid_${hidHash}}`;
				try {
					await contract.evaluateTransaction(
						'CreateHID', key, hidHash
					);
					await contract.submitTransaction(
						'CreateHID', key, hidHash
					);
					res.json({ status: "Successfully created" });
				} catch (error) {
					res.status(400).send(error.toString());
				}
			});

			// register with hid verification
			app.post("/hidregister", async function (req, res) {
				console.log(req.body)
				const { h_id } = req.body;
				const hidHash = sha256(h_id)
				const hidKey = `hid_${hidHash}`;
				const key = `register_${hidHash}`
				let keyPair = ec.keyFromPrivate(hidHash)
				let privateKey = keyPair.getPrivate("hex")
				let pubKey = keyPair.getPublic()
				const x = Math.floor(Math.random() * 1000);
				try {
					try {
						await contract.evaluateTransaction(
							'HIDExists', hidKey
						)
						await contract.submitTransaction(
							'Registration', key, hidHash, pubKey.encode("hex").substr(2), privateKey)
						res.json({ status: "Successfully register." })
					} catch (err) {
						res.status(400).send(`HID not exist create one.`)
					}
				} catch (error) {
					res.status(400).send(error.toString());
				}

			});

			app.post("/sendunit", async function (req, res) {
				console.log(req.body)
				const { h_id, unit_value } = req.body;

				const hidHash = sha256(h_id)
				// const hidKey = `hid_${hidHash}}`;
				const hidKey = `hid_${hidHash}`;
				const key = `sendunit_${hidHash}`
				console.log(h_id, unit_value)
				const unit_value_encry = CryptoJS.AES.encrypt(unit_value, 'secretkey').toString();
				const RegKey = `register_${hidHash}`
				// console.log("Send Unit",hidHash,hidKey,key,unit_value_encry,RegKey)
				let result = await contract.evaluateTransaction(
					'FindRegisterd', RegKey
				)
				let JsonReg = JSON.parse(result.toString());
				// console.log(JsonReg.pr)

				let signature = ec.sign(unit_value_encry, JsonReg.pr, { canonical: true })
				let hexToDecimal = (x) => ec.keyFromPrivate(x, "hex").getPrivate().toString(10)
				let pubKeyRecovered = ec.recoverPubKey(
					hexToDecimal(unit_value_encry), signature, signature.recoveryParam, "hex"
				);
				let verify = ec.verify(unit_value_encry,signature,pubKeyRecovered)
				console.log(verify)
				try {
					try {
						await contract.evaluateTransaction(
							'HIDExists', hidKey
						)
						// key, unit_value_encry, verify
						await contract.submitTransaction(
							'SendValue', key, unit_value_encry, verify)
						res.json({ status: "Successfully send value with signature verification." })
					} catch (err) {
						res.status(400).send(`HID not exist create one.`)
					}
				} catch (error) {
					res.status(400).send(error.toString());
				}

			});

			// check register or not
			app.post("/checkregister", async function (req, res) {
				const { h_id } = req.body;
				const hidHash = sha256(h_id)
				const key = `register_${hidHash}`
				console.log(key)
				try {
					let result = await contract.evaluateTransaction(
						'FindRegisterd', key
					)
					res.json({ data: JSON.parse(result.toString()) })
				} catch (error) {
					res.status(400).send(error.toString());
				}
			});
			app.listen(port, () => {
				console.log(`Server listening at http://localhost:${port}`);
			})

		} finally {

		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}

main();
