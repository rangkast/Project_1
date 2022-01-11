var express = require('express');
var router = express.Router();

router.get('/3dcube', function(req, res) {
    console.log('3dcube js\n');
    res.render('f_3dcube.html');
});

router.get('/3dworld', function(req, res) {
    console.log('3dworld js\n');
    res.render('f_3dworld.html');
});


module.exports = router;