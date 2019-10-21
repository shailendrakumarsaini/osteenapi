var express = require('express');
var router = express.Router();

var notification_controller = require('../controllers/notification');


router.get('/list', notification_controller.list);
router.get('/:id', notification_controller.findOne);
router.post('/create', notification_controller.create);
router.put('/update', notification_controller.update);
router.delete('/:id', notification_controller.delete);
router.post('/stop', notification_controller.stop);
router.post('/restartall', notification_controller.restartall);
router.post('/import', notification_controller.import);
router.post('/upload', notification_controller.upload);

module.exports = router;