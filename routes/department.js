var express = require('express');
var router = express.Router();

var department_controller = require('../controllers/department');


router.get('/list', department_controller.list);
router.get('/:id', department_controller.findOne);
router.post('/create', department_controller.create);
router.put('/update', department_controller.update);
router.delete('/:id', department_controller.delete);


module.exports = router;