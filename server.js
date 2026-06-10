const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
    console.log(`⚡ ডিভাইস কানেক্টেড: ${socket.id}`);

    socket.on('join-room', (role) => {
        socket.join(role);
        console.log(`👥 রোল যুক্ত হয়েছে: ${role}`);
    });

    // চাইল্ড ও সিসিটিভি ডাটা স্ট্রিমিং
    socket.on('child-data-stream', (data) => io.to('parent').emit('parent-receive-data', data));
    socket.on('parent-to-child-command', (cmd) => io.to('child').emit('child-execute-command', cmd));
    
    // সিসিটিভি এবং স্ক্রিন শেয়ারিং WebRTC সিগন্যালিং
    socket.on('webrtc-signal', (signalData) => socket.broadcast.emit('webrtc-signal-receive', signalData));

    socket.on('disconnect', () => console.log(`🔴 ডিসকানেক্টেড: ${socket.id}`));
});

// রাউটার কন্ট্রোল এপিআই
app.post('/api/router-control', (req, res) => {
    console.log(`🔄 রাউটার অ্যাকশন: ${req.body.action} আইপি: ${req.body.routerIp}`);
    res.status(200).json({ success: true, message: 'কমান্ড সফলভাবে পাঠানো হয়েছে' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 সার্ভার রানিং পোর্ট: ${PORT}`));
