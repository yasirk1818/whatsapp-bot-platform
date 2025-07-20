const express = require('express');
const router = express.Router();

// Yahan par login aur signup ke routes aayenge
// Abhi ke liye bas ek test route bana dete hain taake file khali na rahe
router.get('/test', (req, res) => {
    res.send('Auth route kaam kar raha hai!');
});

module.exports = router;
