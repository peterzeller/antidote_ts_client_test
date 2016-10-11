import {AntidoteConnection} from "./antidoteConnection"
import '../proto/antidote_proto' 
import {Connection, Transaction, connect, key} from "./antidote" 
import ByteBuffer = require("bytebuffer")
import http = require('http');
import fs = require('fs');
var Long = require("long");


let connection = connect(8087, "localhost");

function testAntidote(): Promise<any> {
	let txPromise = connection.startTransaction();
	let testKey: AntidotePB.ApbBoundObject = key("testKey", AntidotePB.CRDT_type.COUNTER, "myBucket");
	return txPromise.then(tx => {
		tx.updateObject(testKey, {counterop: {inc: new Long(1)}});
		return tx.readValue(testKey).then(counterValue => {
			console.log(`counter value = ${counterValue}.`);
			return tx.commit()
		});
	})
}

let test = testAntidote();

test.catch((err) => {
	console.log(`Error: ${err}`)
});
test.then(() => {
	connection.close()
});





