var express = require('express');
var router = express.Router();

var question_controller = require('../controllers/question');


router.get('/list', question_controller.list);
router.get('/:id', question_controller.findOne);
router.post('/create', question_controller.create);
router.put('/update', question_controller.update);
router.delete('/:id', question_controller.delete);


module.exports = router;