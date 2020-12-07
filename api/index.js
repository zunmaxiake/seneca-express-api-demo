const { config } = require("./config/dev");
const BodyParser = require("body-parser");
const Mservice = require("./plugin/mSevice");
const Sourcing = require("./plugin/sourcing");
const Poetry = require("./plugin/poetry");
const Express = require("express");
const app = Express();

const allowCrossDomain = function (req, res, next) {
  var allowOrigins = config.Origin;
  if (Object.prototype.toString.call(config.Origin) === "[object String]") {
    allowOrigins = [allowOrigins];
  }
  var currentOrigin = (req.headers.referer && req.headers.referer.match(/((http|https):\/\/[^\/]*)/)[1]) || allowOrigins[0];

  if (allowOrigins.indexOf(currentOrigin) !== -1) {
    //设置允许跨域的配置
    res.header('Access-Control-Allow-Origin', currentOrigin);
  }
  //res.header('Access-Control-Allow-Origin', 'http://192.168.0.162:4200');
  //res.header('Access-Control-Allow-Origin', 'http://dev.we-linkin.com:8081');
  //res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
};
app.use(allowCrossDomain);
app.use(BodyParser.json({ limit: '50mb' }));
// app.use(BodyParser.urlencoded({ limit: '50mb', extended: true }));
// app.use(BodyParser.urlencoded({ extended: false }));
app.use(BodyParser.json());
try {
  (async () => {
    await app.listen(config.webUrl)
    const seneca = await Mservice.initMservice(config.defaultService, config.sourcingServiceUrl, config.poetryServiceUrl);
    Sourcing.initMroute(app, seneca);
    Poetry.initMroute(app, seneca);
  })();
}
catch (err) {
  console.error("err:", err);
}