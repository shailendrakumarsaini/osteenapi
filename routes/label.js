var express = require('express');
var router = express.Router();

var label_controller = require('../controllers/label');


router.get('/list', label_controller.list);
router.get('/:id', label_controller.findOne);
router.post('/create', label_controller.create);
router.put('/update', label_controller.update);
router.delete('/:id', label_controller.delete);


module.exports = router;