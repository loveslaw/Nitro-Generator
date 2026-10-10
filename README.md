# 🎁 Discord Nitro Generator & Checker

A blazing fast, multi-threaded Discord Nitro gift code generator, API validator, and webhook dispatcher built with Node.js.

---

## ✨ Features
- **Concurrent Asynchronous Workers**: Configurable multi-threaded architecture with worker pooling for maximum throughput.
- **Discord API v10 Validation**: Real-time validation against Discord entitlement endpoints (`/api/v10/entitlements/gift-codes`).
- **Smart Rate-Limit Handling**: Automatically detects HTTP 429 status and parses `Retry-After` headers to prevent IP shadowbanning.
- **Discord Webhook Alerts**: Instant rich embed delivery to Discord channels upon discovering valid gift codes.
- **Export & Storage**: Automatically appends valid codes into `valid_codes.txt`.
- **Docker Support**: Containerized Dockerfile ready for one-command cloud deployment.

---

## 📁 Repository Structure
```
Nitro-Generator/
├── app.js           # Core asynchronous generator & checker engine
├── config.yml       # Thread count, delay, webhook, and proxy configuration
├── Dockerfile       # Container definition for 24/7 cloud deployment
├── package.json     # Node.js dependencies and run scripts
├── .gitignore       # Exclusion rules for local modules & output
└── README.md        # Comprehensive documentation
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ installed on your system.

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/loveslaw/Nitro-Generator.git
   cd Nitro-Generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure `config.yml`:
   ```yaml
   settings:
     threads: 5
     check_delay_ms: 150
     code_length: 16

   webhook:
     enabled: true
     url: "YOUR_DISCORD_WEBHOOK_URL"
   ```

4. Run the generator:
   ```bash
   npm start
   ```

### 🐳 Docker Deployment
```bash
docker build -t nitro-generator .
docker run -d --name nitro-gen nitro-generator
```

---

## ⚠️ Disclaimer
This software is designed solely for educational, vulnerability research, and security benchmarking purposes. Automated interactions with Discord APIs must comply with Discord's Terms of Service.
