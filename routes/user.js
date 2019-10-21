var express = require('express');
var router = express.Router();

var user_controller = require('../controllers/user');


router.get('/test', user_controller.test);
router.get('/list', user_controller.list);
router.get('/:id', user_controller.findOne);
router.post('/registration', user_controller.create);
router.put('/update', user_controller.update);
router.delete('/:id', user_controller.delete);
router.post('/login', user_controller.login);
router.post('/forgotpassword', user_controller.forgotpassword);
router.post('/verification', user_controller.verification);

module.exports = router;