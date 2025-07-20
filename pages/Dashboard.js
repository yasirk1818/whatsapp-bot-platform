import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import QRCode from 'qrcode.react';
import API from '../api';
import { AuthContext } from '../context/AuthContext'; // Aapka Auth Context

const Dashboard = () => {
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState('Disconnected');
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useContext(AuthContext); // Logged-in user ki details

    useEffect(() => {
        // Shuru mein connection status check karo
        API.get('/whatsapp/status').then(res => setIsConnected(res.data.isConnected));

        const socket = io('http://localhost:5000'); // Backend se connect karo
        
        // Sirf apne user ke liye QR code event suno
        socket.on(`qr_${user._id}`, (data) => {
            setQrCode(data.qr);
            setStatus('QR Code Scan Karein');
        });

        // Sirf apne user ke liye status update suno
        socket.on(`status_${user._id}`, (data) => {
            setStatus(data.message);
            setIsConnected(data.connected);
            if (data.connected) setQrCode(''); // Connect hone par QR code hata do
        });

        return () => socket.disconnect();
    }, [user._id]);

    const handleConnect = () => {
        setStatus('Shuru ho raha hai...');
        API.post('/whatsapp/connect'); // Backend ko connection request bhejo
    };
    
    const handleLogout = () => {
        setStatus('Logout ho raha hai...');
        API.post('/whatsapp/logout');
    };

    return (
        <div>
            <h2>WhatsApp Connection</h2>
            <p>Status: <strong>{status}</strong></p>

            {!isConnected && !qrCode && <button onClick={handleConnect}>WhatsApp Connect Karein</button>}
            {isConnected && <button onClick={handleLogout}>WhatsApp Logout Karein</button>}

            {qrCode && (
                <div>
                    <p>Is QR code ko apne phone ke WhatsApp se scan karein.</p>
                    <QRCode value={qrCode} />
                </div>
            )}
            
            {/* Yahan par Keyword Management ka component aayega */}
        </div>
    );
};

export default Dashboard;
