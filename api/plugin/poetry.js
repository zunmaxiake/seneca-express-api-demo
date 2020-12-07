const Mservice = require("./mSevice");
const _ = require("lodash");

const DEFAULT_PAGE_SIZE = 10;

module.exports = {
  initMroute: function (app, seneca) {
    app.post("/cmfpoetry/author/add", (req, res) => { addAuthor(req, res, seneca) });
    app.post("/cmfpoetry/class/add", (req, res) => { addClass(req, res, seneca) });
    app.post("/cmfpoetry/poetry/add", (req, res) => { addPoetry(req, res, seneca) });
    app.post("/cmfpoetry/poetryclass/add", (req, res) => { addPoetryClass(req, res, seneca) });
    app.get("/cmfpoetry/poetry/find", (req, res) => { findPoetry(req, res, seneca) });

    async function addAuthor(req, res, seneca) {
      const authorNames = _.map(req.body.authorNames, (authorName) => {
        return {
          name: authorName
        }
      })
      let result = await Mservice.actAsync(seneca, {
        moduleName: "poetry",
        controller: "cmf_author",
        action: "add",
        args: {
          data: authorNames
        }
      });
      return res.json(result);
    }
    async function addClass(req, res, seneca) {
      const classNames = _.map(req.body.classNames, (className) => {
        return {
          name: className
        }
      })
      let result = await Mservice.actAsync(seneca, {
        moduleName: "poetry",
        controller: "cmf_class",
        action: "add",
        args: {
          data: classNames
        }
      });
      return res.json(result);
    }
    async function addPoetry(req, res, seneca) {
      const poetry = req.body.poetry || {};
      const result = await Mservice.actAsync(seneca, {
        moduleName: "poetry",
        controller: "cmf_poetry",
        action: "add",
        args: {
          data: poetry,
          include: [
            { model: "cmf_author", as: "author" },
            // { model: "cmf_class_poetry", as: "class" }
          ],
          // associate:{
          //   model:"cmf_author",
          //   id:1
          // }
        }
      });
      return res.json(result);
    }
    async function addPoetryClass(req, res, seneca) {
      const poetryClass = req.body.poetryClass || {};
      const result = await Mservice.actAsync(seneca, {
        moduleName: "poetry",
        controller: "cmf_class_poetry",
        action: "add",
        args: {
          data: poetryClass
        }
      });
      return res.json(result);
    }
    async function findPoetry(req, res, seneca) {
      let result = await Mservice.actAsync(seneca, {
        moduleName: "poetry",
        controller: "cmf_poetry",
        action: "find",
        args: {
          fields: ["id", "title", "content"],
          where: {},
          order: [['id', 'DESC']],
          include: [
            { model: "cmf_author", as: "author" },
            { model: "cmf_class", as: "class" }
          ]
        }
      });
      return res.json(result);
    }
  }
}