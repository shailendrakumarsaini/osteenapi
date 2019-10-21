var express = require('express');
var router = express.Router();

var assignment_controller = require('../controllers/assignment');


router.get('/list', assignment_controller.list);
router.get('/:id', assignment_controller.findOne);
router.post('/create', assignment_controller.create);
router.put('/update', assignment_controller.update);
router.delete('/:id', assignment_controller.delete);


module.exports = router;