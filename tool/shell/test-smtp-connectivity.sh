#!/bin/bash
# SMTP Connectivity Test Script for Docker
# Run this inside the container to diagnose email issues

echo "========================================="
echo "SMTP Connectivity Diagnostic"
echo "========================================="
echo ""

# Test 1: DNS Resolution
echo "1. Testing DNS resolution for smtp.gmail.com..."
nslookup smtp.gmail.com 8.8.8.8
if [ $? -eq 0 ]; then
    echo "✅ DNS resolution: SUCCESS"
else
    echo "❌ DNS resolution: FAILED"
fi
echo ""

# Test 2: Ping Google DNS
echo "2. Testing connectivity to Google DNS (8.8.8.8)..."
ping -c 3 8.8.8.8
if [ $? -eq 0 ]; then
    echo "✅ Google DNS ping: SUCCESS"
else
    echo "❌ Google DNS ping: FAILED"
fi
echo ""

# Test 3: Port 587 connectivity
echo "3. Testing SMTP port 587 (STARTTLS)..."
timeout 10 nc -zv smtp.gmail.com 587
if [ $? -eq 0 ]; then
    echo "✅ Port 587: OPEN"
else
    echo "❌ Port 587: BLOCKED or TIMEOUT"
fi
echo ""

# Test 4: Port 465 connectivity
echo "4. Testing SMTP port 465 (SSL)..."
timeout 10 nc -zv smtp.gmail.com 465
if [ $? -eq 0 ]; then
    echo "✅ Port 465: OPEN"
else
    echo "❌ Port 465: BLOCKED or TIMEOUT"
fi
echo ""

# Test 5: Check environment variables
echo "5. Checking SMTP environment variables..."
if [ -n "$SMTP_GMAIL_USER" ]; then
    echo "✅ SMTP_GMAIL_USER: Set (${SMTP_GMAIL_USER})"
else
    echo "❌ SMTP_GMAIL_USER: NOT SET"
fi

if [ -n "$SMTP_GMAIL_PASS" ]; then
    echo "✅ SMTP_GMAIL_PASS: Set (${#SMTP_GMAIL_PASS} characters)"
else
    echo "❌ SMTP_GMAIL_PASS: NOT SET"
fi
echo ""

# Test 6: Check /etc/resolv.conf
echo "6. Checking DNS configuration (/etc/resolv.conf)..."
cat /etc/resolv.conf
echo ""

# Test 7: Check routing
echo "7. Checking default route..."
ip route
echo ""

# Test 8: Test HTTPS connectivity
echo "8. Testing HTTPS connectivity to gmail.com..."
timeout 10 curl -I https://gmail.com
if [ $? -eq 0 ]; then
    echo "✅ HTTPS to gmail.com: SUCCESS"
else
    echo "❌ HTTPS to gmail.com: FAILED"
fi
echo ""

echo "========================================="
echo "Diagnostic Complete"
echo "========================================="
echo ""
echo "Recommendations:"
echo "- If DNS fails: Check docker-compose.yml DNS settings"
echo "- If ports blocked: Check firewall or use different network mode"
echo "- If env vars missing: Check .env.development is loaded"
echo "- If route issues: Try network_mode: host in docker-compose.yml"
echo ""

