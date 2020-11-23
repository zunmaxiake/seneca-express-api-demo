const Seneca = require("seneca");

module.exports = {
  initMservice: function (defaultService, sourcingServiceUrl) {
    return new Promise((resolve, reject) => {
      const seneca = Seneca(defaultService);
      try {
        seneca
          .client(sourcingServiceUrl)
          .ready(() => {
            console.log("micro service start on ", sourcingServiceUrl);
            resolve(seneca);
          })
      }
      catch (err) {
        console.error("micro service err:", err);
        reject(err);
      }
    })
  },
  actAsync: function (seneca, req) {
    return new Promise((resolve, reject) => {
      seneca.act(req, (err, result) => {
        if (err) reject(err);
        resolve(result);
      })
    })
  }
}