module.exports.config = {
  defaultService: { log: 'silent', timeout: 20000 },
  sourcingServiceUrl: { port: 8030, host: 'localhost', type: 'tcp', pin: 'module:sourcing', timeout: 100000 },
  Origin: ['http://localhost:4200', 'http://localhost:4201'],
  webUrl:{ port: 8033, host: 'localhost' },//供前端访问 qas.we-linkin.com
}