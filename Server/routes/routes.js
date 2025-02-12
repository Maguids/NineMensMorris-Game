const express = require('express');
const router = express.Router();
const controller = require('../controllers');

// Rotas principais
router.post('/register', controller.register);
router.post('/join', controller.join);
router.post('/leave', controller.leave);
router.post('/notify', controller.notify);
router.get('/update', controller.update);
router.post('/ranking', controller.ranking);

module.exports = router;
