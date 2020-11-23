// const Seneca = require("seneca");
// const seneca = Seneca();
// const sourcingServiceUrl = { port: 8030, host: 'localhost', type: 'tcp', pin: 'module:sourcing', timeout: 100000 };

// seneca
//   .client({port: 9001, pin: 'b:1'})
//   .ready(() => {
//     console.log("micro service start on " + sourcingServiceUrl);
//   })

var Seneca = require('seneca')

Seneca({ log: 'silent' })
  .add({ a: 1 }, function (msg, reply) {
    reply({ z: msg.z })
  })

  // Define an action pattern that fails.
  .add({ a: 2 }, function (msg, reply) {
    reply(new Error('bad'))
  })

  // Listen on localhost:9001 for any messages that match b:1
  .listen({ port: 9001, pin: 'b:1' })


// Create client. Hide logging noise.
Seneca({ log: 'silent' })
  .client({ port: 9001, pin: 'b:1' })
  .ready(() => {
    console.log("micro service start on 9001");
  })