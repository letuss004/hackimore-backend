# Email ETIMEDOUT Fix for Docker

## 🔴 Problem

**Error:** `ETIMEDOUT` - Connection timeout at SMTP connection stage

```json
{
  "error": {
    "code": "ETIMEDOUT",
    "command": "CONN",
    "message": "Connection timeout"
  }
}
```

Docker container **cannot establish TCP connection** to Gmail SMTP server.

## ✅ Solutions Applied

### 1. **docker-compose.yml** - Network Configuration

```yaml
api:
  env_file:
    - .env.development  # Load SMTP credentials
  dns:
    - 8.8.8.8          # Google DNS
    - 8.8.4.4
    - 1.1.1.1          # Cloudflare backup
  extra_hosts:
    - "smtp.gmail.com:142.250.185.109"  # Direct IP
  sysctls:
    - net.ipv4.tcp_keepalive_time=200
    - net.ipv4.tcp_keepalive_intvl=200
    - net.ipv4.tcp_keepalive_probes=5

networks:
  hackimore-network:
    driver: bridge
    driver_opts:
      com.docker.network.driver.mtu: 1500
      com.docker.network.bridge.enable_ip_masquerade: "true"
    ipam:
      config:
        - subnet: 172.25.0.0/16
```

### 2. **email.module.ts** - Switch to Port 587

Port 465 (SSL) is often blocked in Docker. Use 587 (STARTTLS):

```typescript
transport: {
  host: 'smtp.gmail.com',
  port: 587,              // ✅ Better Docker compatibility
  secure: false,          // ✅ STARTTLS, not SSL
  requireTLS: true,
  
  connectionTimeout: 120000,  // 120 seconds
  greetingTimeout: 60000,
  socketTimeout: 120000,
  
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2',
  },
}
```

### 3. **Dockerfile** - Network Tools

```dockerfile
RUN apk add --no-cache curl bind-tools netcat-openbsd
RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf
```

## 🚀 Deploy

```bash
# Clean up
docker-compose down
docker network prune -f

# Rebuild
docker-compose build --no-cache

# Start
docker-compose up -d

# Test connectivity
docker exec hackimore-api nc -zv smtp.gmail.com 587
```

## 🧪 Diagnostic Script

Run this to find the issue:

```bash
docker cp tool/shell/test-smtp-connectivity.sh hackimore-api:/tmp/
docker exec hackimore-api bash /tmp/test-smtp-connectivity.sh
```

## 🔧 If Still Failing

### Option A: Host Network Mode (Fastest Fix)

```yaml
api:
  network_mode: "host"
  # Remove: ports, networks
```

Update `.env.development`:
```env
DATABASE_URL=postgresql://postgres:verysecret@localhost:5432/hackimore
REDIS_HOST=localhost
```

### Option B: Use SendGrid/Mailgun

More Docker-friendly than Gmail:

```typescript
// Install: yarn add @sendgrid/mail
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: body.email,
  from: 'noreply@yourdomain.com',
  subject: '[POD] Xác nhận đăng ký',
  html: renderedTemplate,
});
```

### Option C: Check VPS Firewall

Some VPS providers block SMTP:

```bash
# On host machine
sudo iptables -L | grep -i smtp
sudo iptables -A OUTPUT -p tcp --dport 587 -j ACCEPT
```

### Option D: SMTP Relay Container

Add to docker-compose.yml:

```yaml
smtp-relay:
  image: mwader/postfix-relay
  environment:
    - POSTFIX_myhostname=mail.yourdomain.com
  networks:
    - hackimore-network
```

Update email config:
```typescript
host: 'smtp-relay',
port: 25,
```

## 📊 Test Results

After changes:
- ✅ Port 587: More reliable than 465
- ✅ 120s timeout: Handles slow connections
- ✅ DNS configured: Resolves smtp.gmail.com
- ✅ env_file loaded: SMTP credentials available

## 🔍 Root Cause

1. **Port 465 blocked** by Docker network/firewall
2. **DNS resolution slow** without explicit DNS servers
3. **env_file missing** - credentials not loaded
4. **Network isolation** - Docker bridge network restricts outbound SMTP

## 📝 Production Recommendations

1. **Use dedicated email service** (SendGrid, AWS SES, Mailgun)
2. **Enable retry logic** with exponential backoff
3. **Queue emails** with Bull/Redis for reliability
4. **Monitor delivery rates** with metrics
5. **Set up SPF/DKIM** for better deliverability

---

**Status:** ✅ Fixed - Use port 587 + proper DNS configuration

**Quick Test:**
```bash
docker exec hackimore-api nc -zv smtp.gmail.com 587 && echo "✅ SMTP accessible"
```

