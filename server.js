const Barnowl = require('barnowl');
const BarnowlAruba = require('barnowl-aruba');
const Parser = require("binary-parser").Parser;
const client = require('prom-client');
const express = require('express');
let barnowl = new Barnowl({ enableMixing: true });
const { isMainThread, threadId } = require('node:worker_threads');
const registry = new client.Registry();

const counter = new client.Summary({
  name: 'ap_co2',
  help: 'metric',
  maxAgeSeconds: 1800,
  labelNames: ['ap_name'],
  registers: [registry],
  buckets: client.linearBuckets(400, 20, 100), //Create 20 buckets, starting on 0 and a width of 10
});

const server = express();

server.get('/metrics', async (req, res) => {
	try {
		res.set('Content-Type', registry.contentType);
		res.end(await registry.metrics());
	} catch (ex) {
		res.status(500).end(ex);
	}
});

const aranet = new Parser()
  .endianness("little")
  .seek(9)
  .uint16("CO2")
  .uint16("Temp")
  .uint16("Pressure")
  .uint8("Humidity")
  .uint8("battery")
  .uint8("status")
  .uint16("Interval")
  .uint16("Age");



const aps = require('./aps.json');

barnowl.addListener(BarnowlAruba, {}, BarnowlAruba.WsListener, { port: 3001 });
//barnowl.addListener(BarnowlAruba, {}, BarnowlAruba.TestListener, {});

barnowl.on('raddec', (raddec) => {

  for (var packet of raddec['packets']) {
  buf = Buffer.from(packet,'hex');

  if ( buf.length == 37){
  readout_values = aranet.parse(buf.slice(14));
  readout_values.Temp =readout_values.Temp /20; 
  readout_values.Pressure =readout_values.Pressure /10;
  for( var ap of raddec['rssiSignature']){
	  if (readout_values.Age == 1){
	  counter.observe(
		  {
			  ap_name: aps[ap.receiverId],
		  },readout_values.CO2);
	  }
	}
  }
  }
});

const port = process.env.PORT || 9042;
server.listen(port, () => {
	console.log(
		`Server listening to ${port}, metrics exposed on /metrics endpoint`,
	);
});
