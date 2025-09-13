# Complete DigitalOcean Deployment Guide

## Full-Stack Node.js + React Application with Socket.IO

**Project**: AlgoSphere  
**Domain**: thinktogether.tech  
**Technologies**: Node.js, React, Socket.IO, Nginx, PM2  
**Date**: September 13, 2025

---

## Phase 1: Server Setup and Prerequisites

### 1. Create and Access DigitalOcean Droplet

```bash
# Create Ubuntu 22.04 LTS Droplet on DigitalOcean
# Note your public IP (e.g., 143.110.176.130)

# SSH into your server
ssh root@your_droplet_ip
```

### 2. Update System and Install Node.js

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
sudo apt install -y nodejs npm git

# Verify installations
node -v
npm -v
git --version
```

### 3. Install and Configure Nginx

```bash
# Install Nginx web server
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### 4. Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable

# Check firewall status
sudo ufw status
```

---

## Phase 2: Code Deployment

### 5. Clone Your Repository

```bash
# Clone your project from GitHub
git clone https://github.com/yousuff22/AlgoSphere.git
cd AlgoSphere
```

### 6. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

### 7. Build Frontend for Production

```bash
# Build React app for production
cd ~/AlgoSphere/Frontend
npm run build

# This creates a 'dist' folder with optimized static files
```

### 8. Configure Backend to Serve Frontend

```bash
# Copy built frontend files to backend's public directory
rm -rf ../backend/public/*
cp -r dist/* ../backend/public/
```

**Your backend/index.js should already have:**

```javascript
// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// Handle React Router - serve index.html for all routes
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
```

---

## Phase 3: Nginx Configuration

### 9. Create Nginx Server Block

```bash
# Create configuration file for your domain
sudo nano /etc/nginx/sites-available/thinktogether.tech
```

**Add this configuration:**

```nginx
server {
    listen 80;
    server_name thinktogether.tech www.thinktogether.tech;

    # Handle Socket.IO WebSocket connections
    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Handle API routes (if you have any)
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve the React app and handle client-side routing
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 10. Enable Nginx Site

```bash
# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/thinktogether.tech /etc/nginx/sites-enabled/

# Remove default Nginx site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx to apply changes
sudo systemctl reload nginx
```

---

## Phase 4: Process Management

### 11. Install and Configure PM2

```bash
# Install PM2 globally for process management
sudo npm install -g pm2

# Kill any existing Node processes
sudo pkill -f node
```

### 12. Start Backend with PM2

```bash
# Start your backend application
cd ~/AlgoSphere/backend
pm2 start index.js --name "algosphere-backend"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions provided by the command above
```

### 13. Monitor Your Application

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs algosphere-backend

# Restart if needed
pm2 restart algosphere-backend
```

---

## Phase 5: Domain and SSL Setup

### 14. Configure Domain DNS

- Go to your domain registrar (where you bought thinktogether.tech)
- Add an A record pointing to your server IP (143.110.176.130)
- Wait for DNS propagation (can take up to 24 hours)

### 15. Install SSL Certificate (Optional but Recommended)

```bash
# Install Certbot for Let's Encrypt SSL
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d thinktogether.tech -d www.thinktogether.tech

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Phase 6: Application Code Configuration

### 16. Frontend Socket.IO Configuration

**In your `Frontend/src/App.jsx`:**

```javascript
// For production, connect to your domain
const socket = io("https://thinktogether.tech", {
  transports: ["websocket", "polling"],
  secure: true,
});
```

### 17. Vite Configuration (for development)

**In your `Frontend/vite.config.js`:**

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: [
      "thinktogether.tech",
      "www.thinktogether.tech",
      "143.110.176.130",
    ],
  },
});
```

---

## Phase 7: Deployment Workflow

### 18. Future Updates Process

```bash
# When you make changes locally:
# 1. Commit and push to GitHub
git add .
git commit -m "Your changes"
git push origin main

# 2. On server, pull updates
cd ~/AlgoSphere
git pull origin main

# 3. Rebuild and redeploy
cd Frontend
npm run build
rm -rf ../backend/public/*
cp -r dist/* ../backend/public/

# 4. Restart the application
pm2 restart algosphere-backend
```

---

## Common Troubleshooting Commands

### Check Service Status

```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check PM2 processes
pm2 status

# Check ports in use
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :80
```

### View Logs

```bash
# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Application logs
pm2 logs algosphere-backend

# System logs
sudo journalctl -u nginx -f
```

### Restart Services

```bash
# Restart Nginx
sudo systemctl restart nginx

# Restart application
pm2 restart algosphere-backend

# Reload Nginx configuration
sudo nginx -t && sudo systemctl reload nginx
```

---

## Key Concepts Explained

### 1. **Nginx as Reverse Proxy**

- Routes incoming HTTP requests to your Node.js application
- Handles SSL termination and static file serving
- Provides load balancing capabilities

### 2. **Static File Serving**

- React build files are served directly by the Node.js backend
- Optimized for production with minified and compressed assets

### 3. **WebSocket Proxying**

- Special Nginx configuration for Socket.IO real-time connections
- Handles WebSocket upgrade headers properly

### 4. **Process Management with PM2**

- Keeps your Node.js application running continuously
- Automatically restarts on crashes
- Provides logging and monitoring capabilities

### 5. **SSL/HTTPS Configuration**

- Let's Encrypt provides free SSL certificates
- Nginx handles SSL termination
- Automatic certificate renewal

### 6. **Domain and DNS**

- A record points your domain to server IP
- Nginx server blocks handle multiple domains
- DNS propagation can take up to 24 hours

---

## Production Checklist

- [ ] Server created and accessible via SSH
- [ ] Node.js, npm, and git installed
- [ ] Nginx installed and configured
- [ ] Firewall configured (ports 22, 80, 443)
- [ ] Repository cloned and dependencies installed
- [ ] Frontend built for production
- [ ] Static files copied to backend public folder
- [ ] Nginx server block configured for domain
- [ ] PM2 installed and application started
- [ ] Domain DNS configured
- [ ] SSL certificate installed (optional)
- [ ] Application accessible via domain

---

## Final Result

Your application is now successfully deployed and accessible at:

- **HTTP**: http://thinktogether.tech
- **HTTPS**: https://thinktogether.tech (if SSL configured)

**Features Working:**

- ✅ Real-time collaboration with Socket.IO
- ✅ Multiple users in same rooms
- ✅ Code synchronization
- ✅ Voice chat functionality
- ✅ Production-optimized static files
- ✅ Automatic process management
- ✅ SSL encryption (if configured)

---

**Document Created**: September 13, 2025  
**Last Updated**: September 13, 2025  
**Application Status**: Successfully Deployed  
**URL**: https://thinktogether.tech
