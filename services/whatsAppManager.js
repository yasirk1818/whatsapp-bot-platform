const { Client, LocalAuth } = require('whatsapp-web.js');
const socketIO = require('socket.io');
const User = require('../models/User');
const Keyword = require('../models/Keyword');

class WhatsAppManager {
    constructor(server) {
        this.clients = new Map(); // Stores { userId: clientInstance }
        this.io = socketIO(server, { cors: { origin: '*' } });
        this.io.on('connection', (socket) => {
            console.log('A user connected via WebSocket:', socket.id);
        });
    }

    // Initialize or get a client for a user
    initializeClient(userId) {
        if (this.clients.has(userId)) {
            console.log(`Client for user ${userId} already exists.`);
            return this.clients.get(userId);
        }

        console.log(`Initializing new client for user: ${userId}`);
        const client = new Client({
            authStrategy: new LocalAuth({ clientId: userId }), // Use user's ID for session persistence
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for running on many servers
            }
        });

        // Event listeners
        client.on('qr', (qr) => {
            console.log(`QR code for user ${userId}`);
            this.io.emit(`qr_${userId}`, { qr }); // Send QR to the specific user's frontend
        });

        client.on('ready', async () => {
            console.log(`Client is ready for user ${userId}!`);
            await User.findByIdAndUpdate(userId, { isWhatsAppConnected: true });
            this.io.emit(`status_${userId}`, { message: 'WhatsApp Connected!', connected: true });
        });
        
        client.on('disconnected', async (reason) => {
             console.log(`Client for user ${userId} was logged out`, reason);
             await User.findByIdAndUpdate(userId, { isWhatsAppConnected: false });
             this.io.emit(`status_${userId}`, { message: 'WhatsApp Disconnected!', connected: false });
             this.destroyClient(userId); // Clean up
        });

        client.on('message', async (message) => {
            // Don't reply to own messages or messages from groups unless configured
            if (message.fromMe) return;

            const userKeywords = await Keyword.find({ userId });
            const matchedKeyword = userKeywords.find(k => k.keyword.toLowerCase() === message.body.toLowerCase());

            if (matchedKeyword) {
                console.log(`Keyword "${matchedKeyword.keyword}" matched for user ${userId}. Replying.`);
                client.sendMessage(message.from, matchedKeyword.reply);
            }
        });

        client.initialize().catch(err => console.error(`Failed to initialize client for ${userId}:`, err));
        this.clients.set(userId, client);
        return client;
    }

    async getClientStatus(userId) {
        const user = await User.findById(userId);
        return { isConnected: user ? user.isWhatsAppConnected : false };
    }

    async logoutClient(userId) {
        const client = this.clients.get(userId);
        if (client) {
            await client.logout();
            this.destroyClient(userId);
            console.log(`Logged out client for user ${userId}`);
        }
        await User.findByIdAndUpdate(userId, { isWhatsAppConnected: false });
        this.io.emit(`status_${userId}`, { message: 'Logged out successfully.', connected: false });
    }
    
    destroyClient(userId) {
        const client = this.clients.get(userId);
        if (client) {
            client.destroy(); // Properly clean up the session
            this.clients.delete(userId);
            console.log(`Destroyed client for user ${userId}`);
        }
    }
}

module.exports = WhatsAppManager;
