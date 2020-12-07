const Seneca = require("seneca");

module.exports = {
  initMservice: function (defaultService, sourcingServiceUrl, poetryServiceUrl) {
    return new Promise((resolve, reject) => {
      const seneca = Seneca(defaultService);
      try {
        seneca
          .client(sourcingServiceUrl)
          .client(poetryServiceUrl)
          .ready(() => {
            console.log("micro service start on ", sourcingServiceUrl);
            console.log("micro service start on ", poetryServiceUrl);
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
        if (err) {
          console.log("actAsync err:", err)
          reject(err);
        }
        resolve(result);
      })
    })
  }
}