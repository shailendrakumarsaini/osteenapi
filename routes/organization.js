var express = require('express');
var router = express.Router();

var org_controller = require('../controllers/organization');


router.get('/list', org_controller.list);
router.get('/:id', org_controller.findOne);
router.post('/create', org_controller.create);
router.put('/update', org_controller.update);
router.delete('/:id', org_controller.delete);

module.exports = router;