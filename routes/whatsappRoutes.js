const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/whatsapp/connect
// @desc    Initiate WhatsApp connection and get QR code
// @access  Private
router.post('/connect', authMiddleware, (req, res) => {
    const whatsAppManager = req.app.get('whatsAppManager');
    whatsAppManager.initializeClient(req.user.id);
    res.status(200).json({ message: 'WhatsApp client initialization started. Listen for QR code on WebSocket.' });
});

// @route   GET /api/whatsapp/status
// @desc    Get the connection status of the user's WhatsApp
// @access  Private
router.get('/status', authMiddleware, async (req, res) => {
    const whatsAppManager = req.app.get('whatsAppManager');
    const status = await whatsAppManager.getClientStatus(req.user.id);
    res.json(status);
});

// @route   POST /api/whatsapp/logout
// @desc    Logout the user's WhatsApp instance
// @access  Private
router.post('/logout', authMiddleware, async (req, res) => {
    const whatsAppManager = req.app.get('whatsAppManager');
    await whatsAppManager.logoutClient(req.user.id);
    res.json({ message: 'Logout successful.' });
});

module.exports = router;
