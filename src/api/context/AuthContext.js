import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import QRCode from 'qrcode.react';
import API from '../api';
import { AuthContext } from '../context/AuthContext'; // Assuming you have this context

const Dashboard = () => {
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState('Disconnected');
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        // Fetch initial status
        API.get('/whatsapp/status').then(res => {
            setIsConnected(res.data.isConnected);
            setStatus(res.data.isConnected ? 'Connected' : 'Disconnected');
        });

        const socket = io('http://localhost:5000');
        
        // Listen for QR code for THIS user
        socket.on(`qr_${user._id}`, (data) => {
            setQrCode(data.qr);
            setStatus('Scan the QR Code');
        });

        // Listen for status updates for THIS user
        socket.on(`status_${user._id}`, (data) => {
            setStatus(data.message);
            setIsConnected(data.connected);
            if(data.connected) setQrCode(''); // Clear QR on successful connection
        });

        return () => {
            socket.disconnect();
        };
    }, [user._id]);

    const handleConnect = () => {
        setStatus('Initializing...');
        API.post('/whatsapp/connect').catch(err => setStatus('Error connecting.'));
    };
    
    const handleLogout = () => {
        setStatus('Logging out...');
        API.post('/whatsapp/logout').then(() => {
            setIsConnected(false);
            setStatus('Disconnected');
        });
    };

    return (
        <div>
            <h2>WhatsApp Connection</h2>
            <p>Status: <strong>{status}</strong></p>

            {!isConnected && !qrCode && <button onClick={handleConnect}>Connect to WhatsApp</button>}
            {isConnected && <button onClick={handleLogout}>Logout from WhatsApp</button>}

            {qrCode && (
                <div>
                    <p>Scan this QR code with your WhatsApp app.</p>
                    <QRCode value={qrCode} />
                </div>
            )}
            
            {/* Keyword Management Component would go here */}
            {/* <KeywordManager /> */}
        </div>
    );
};

export default Dashboard;
