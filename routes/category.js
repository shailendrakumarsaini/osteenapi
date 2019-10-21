var express = require('express');
var router = express.Router();

var category_controller = require('../controllers/category');


router.get('/list', category_controller.list);
router.get('/:id', category_controller.findOne);
router.post('/create', category_controller.create);
router.put('/update', category_controller.update);
router.delete('/:id', category_controller.delete);


module.exports = router;