// RedTeam Chat Client
class RedTeamChat {
    constructor() {
        this.tcpRunning = false;
        this.udpRunning = false;
        this.clients = [];
        this.messages = [];
        this.serverIP = '127.0.0.1';
        this.eventSource = null;
        
        this.init();
    }
    
    init() {
        // Get server IP from URL or localStorage
        this.serverIP = localStorage.getItem('serverIP') || '127.0.0.1';
        this.updateServerIP();
        
        // Start status updates
        this.startStatusUpdates();
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Enter key to send message
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }
    
    startStatusUpdates() {
        // Update every 2 seconds
        setInterval(() => this.fetchStatus(), 2000);
        this.fetchStatus();
    }
    
    async fetchStatus() {
        try {
            // In a real implementation, this would call your TCP server's HTTP API
            // For now, we'll simulate with localStorage
            const status = JSON.parse(localStorage.getItem('serverStatus') || '{}');
            
            this.tcpRunning = status.tcpRunning || false;
            this.udpRunning = status.udpRunning || false;
            
            this.updateUI();
        } catch (error) {
            console.error('Status fetch error:', error);
        }
    }
    
    updateUI() {
        // Update TCP card
        document.getElementById('tcpStatus').textContent = this.tcpRunning ? 'ONLINE' : 'OFFLINE';
        document.getElementById('tcpStartBtn').disabled = this.tcpRunning;
        document.getElementById('tcpStopBtn').disabled = !this.tcpRunning;
        document.getElementById('tcpCard').style.borderColor = this.tcpRunning ? '#ff0000' : '#2a3139';
        
        // Update UDP card
        document.getElementById('udpStatus').textContent = this.udpRunning ? 'ONLINE' : 'OFFLINE';
        document.getElementById('udpStartBtn').disabled = this.udpRunning;
        document.getElementById('udpStopBtn').disabled = !this.udpRunning;
        document.getElementById('udpCard').style.borderColor = this.udpRunning ? '#ffaa00' : '#2a3139';
        
        // Enable/disable chat
        const chatEnabled = this.tcpRunning || this.udpRunning;
        document.getElementById('messageInput').disabled = !chatEnabled;
        document.getElementById('sendBtn').disabled = !chatEnabled;
    }
    
    updateServerIP() {
        document.getElementById('serverIP').textContent = `${this.serverIP}:4444`;
    }
    
    async startTCPServer() {
        try {
            // In production, this would call your TCP server's HTTP API
            localStorage.setItem('serverStatus', JSON.stringify({
                tcpRunning: true,
                udpRunning: this.udpRunning
            }));
            
            this.addMessage('SYSTEM', '[*] TCP server started on port 4444', 'system');
            this.fetchStatus();
        } catch (error) {
            this.addMessage('ERROR', `[!] Failed to start TCP: ${error}`, 'system');
        }
    }
    
    async stopTCPServer() {
        try {
            localStorage.setItem('serverStatus', JSON.stringify({
                tcpRunning: false,
                udpRunning: this.udpRunning
            }));
            
            this.addMessage('SYSTEM', '[*] TCP server stopped', 'system');
            this.fetchStatus();
        } catch (error) {
            this.addMessage('ERROR', `[!] Failed to stop TCP: ${error}`, 'system');
        }
    }
    
    async startUDPServer() {
        try {
            localStorage.setItem('serverStatus', JSON.stringify({
                tcpRunning: this.tcpRunning,
                udpRunning: true
            }));
            
            this.addMessage('SYSTEM', '[*] UDP server started on port 4445', 'system');
            this.fetchStatus();
        } catch (error) {
            this.addMessage('ERROR', `[!] Failed to start UDP: ${error}`, 'system');
        }
    }
    
    async stopUDPServer() {
        try {
            localStorage.setItem('serverStatus', JSON.stringify({
                tcpRunning: this.tcpRunning,
                udpRunning: false
            }));
            
            this.addMessage('SYSTEM', '[*] UDP server stopped', 'system');
            this.fetchStatus();
        } catch (error) {
            this.addMessage('ERROR', `[!] Failed to stop UDP: ${error}`, 'system');
        }
    }
    
    sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // In production, this would send via WebSocket to your TCP server
        this.addMessage('AGENT', message, 'tcp');
        input.value = '';
    }
    
    addMessage(sender, content, type = 'tcp') {
        const messagesDiv = document.getElementById('chatMessages');
        const time = new Date().toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-time">${time}</span>
                <span class="message-sender">${sender}</span>
            </div>
            <div class="message-content">${this.escapeHTML(content)}</div>
        `;
        
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        // Store in localStorage for logs page
        this.messages.push({
            time,
            sender,
            content,
            type
        });
        localStorage.setItem('chatMessages', JSON.stringify(this.messages.slice(-100)));
    }
    
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    setServerIP(ip) {
        this.serverIP = ip;
        localStorage.setItem('serverIP', ip);
        this.updateServerIP();
    }
}

// Initialize chat when page loads
const chat = new RedTeamChat();

// Global functions for button clicks
function startTCPServer() { chat.startTCPServer(); }
function stopTCPServer() { chat.stopTCPServer(); }
function startUDPServer() { chat.startUDPServer(); }
function stopUDPServer() { chat.stopUDPServer(); }
function sendMessage() { chat.sendMessage(); }