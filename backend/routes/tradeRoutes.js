const express = require('express');
const router = express.Router();
const { proposeTrade, acceptTrade, declineTrade, counterTrade, getTrades, getTradeById } = require('../controllers/tradeController');
const auth = require('../middleware/auth');

router.post('/propose', auth, proposeTrade);
router.post('/:id/accept', auth, acceptTrade);
router.post('/:id/decline', auth, declineTrade);
router.post('/:id/counter', auth, counterTrade);
router.get('/', auth, getTrades);
router.get('/:id', auth, getTradeById);

module.exports = router;