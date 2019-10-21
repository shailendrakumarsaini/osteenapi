var express = require('express');
var router = express.Router();

var course_controller = require('../controllers/course');


router.get('/list', course_controller.list);
router.get('/:id', course_controller.findOne);
router.post('/create', course_controller.create);
router.put('/update', course_controller.update);
router.delete('/:id', course_controller.delete);


module.exports = router;