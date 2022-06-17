var express = require('express');
var router = express.Router();
let jwt = require("jsonwebtoken");
let secretObj = require("../config/jwt");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});




module.exports = router;
