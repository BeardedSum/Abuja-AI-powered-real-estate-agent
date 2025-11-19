# 🏠 Abuja Realty AI

**AI-Powered Real Estate Platform for Abuja, Nigeria**

An intelligent, multi-agent real estate platform that makes property buying in Abuja easy, transparent, and affordable. Built with Google ADK (Agent Development Kit), this system reduces traditional agent fees from 5-10% to just 0.5-1%.

## 🌟 Features

- **🤖 AI-Powered Multi-Agent System**: Google ADK orchestrates specialized AI agents for search, scheduling, offers, market analysis, and document processing
- **💬 WhatsApp-First Interface**: Primary interaction via WhatsApp Business API (90% of Nigerian users)
- **🌐 Progressive Web App**: Secondary React-based web interface with offline support
- **💰 Transparent Pricing**: 90% lower fees than traditional agents
- **📊 Market Intelligence**: AI-powered property valuation and competitive analysis
- **📄 Document Processing**: Automated verification of C of O, survey plans, and legal documents
- **🗺️ Location Intelligence**: Google Maps integration for neighborhood insights

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js 20+ with Express/TypeScript
- PostgreSQL 16+ (TypeORM)
- Redis (session/cache management)

**AI Agents:**
- Python 3.11+
- Google ADK v1.0.0
- Google Gemini 2.5 Flash & Pro
- FastAPI for agent API

**Frontend:**
- React 18+ with TypeScript
- Vite 5+ (build tool)
- TailwindCSS 4 (styling)
- PWA (offline support)

**Integrations:**
- WhatsApp Business API (Meta Cloud API)
- Google Maps Platform (Places API New)
- Google Gemini API (AI agents)

### Multi-Agent System

The platform uses 6 specialized AI agents:

1. **Orchestrator Agent** - Main coordinator, routes user requests
2. **Search Agent** - Property discovery and recommendations
3. **Showing Agent** - Appointment scheduling
4. **Offer Agent** - Negotiation and offer management
5. **Market Agent** - Pricing analysis and trends (Gemini Pro)
6. **Disclosure Agent** - Document verification and explanations (Gemini Pro)

## 📋 Prerequisites

- Docker & Docker Compose (recommended) **OR**
- Node.js 20+, Python 3.11+, PostgreSQL 16+, Redis 7+
- WhatsApp Business API credentials
- Google Gemini API key
- Google Maps API key

## 🚀 Quick Start (Docker)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Abuja-AI-powered-real-estate-agent
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your API credentials:

```env
# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_VERIFY_TOKEN=your_verify_token

# Google APIs
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
GOOGLE_MAPS_API_KEY=your_maps_api_key

# Database (defaults work for Docker)
DB_USER=user
DB_PASSWORD=password
DB_NAME=abuja_realty
```

### 3. Start All Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Backend API (port 3000)
- ADK Agents (port 8000)
- Frontend PWA (port 5173)

### 4. Initialize Database

```bash
docker-compose exec backend npm run migration:run
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Agent API**: http://localhost:8000
- **API Health**: http://localhost:3000/health

## 🛠️ Local Development Setup

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Agent Setup

```bash
cd agents
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python server.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 📱 WhatsApp Setup

### 1. Create WhatsApp Business App

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create a new Business App
3. Add WhatsApp product
4. Get Phone Number ID and Access Token

### 2. Configure Webhook

1. Set webhook URL: `https://your-domain.com/api/webhooks/whatsapp`
2. Set verify token (same as `WHATSAPP_VERIFY_TOKEN` in `.env`)
3. Subscribe to `messages` events

### 3. Test WhatsApp Integration

Send a message to your WhatsApp Business number:

```
Hi, I'm looking for a 3-bedroom house in Gwarinpa around ₦40M
```

The AI orchestrator will respond and guide you through the property search!

## 🗺️ Google Maps Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project

### 2. Enable APIs

Enable these APIs:
- Maps JavaScript API
- Places API (New)
- Geocoding API
- Directions API

### 3. Create API Key

1. Go to Credentials
2. Create API key
3. Restrict key to your domain and enabled APIs
4. Add to `.env` as `GOOGLE_MAPS_API_KEY`

## 🧠 Google Gemini Setup

### 1. Get API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to `.env` as `GOOGLE_GEMINI_API_KEY`

### 2. Model Access

The platform uses:
- `gemini-2.0-flash-exp` for most agents (fast, cost-effective)
- `gemini-2.5-pro` for market analysis and document processing (more capable)

## 📊 Database Schema

### Core Entities

- **Users**: WhatsApp users, preferences
- **Properties**: Listings with details, media, location
- **PropertyMedia**: Images, videos, floor plans
- **Showings**: Scheduled viewings
- **Offers**: Purchase offers and negotiations
- **Conversations**: Chat history with agents
- **AgentSessions**: AI agent session state

## 🧪 Testing

### Test Backend API

```bash
curl http://localhost:3000/health
```

### Test Agent API

```bash
curl http://localhost:8000/health
```

### Test Property Search

```bash
curl -X POST http://localhost:8000/tool/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "search_properties",
    "parameters": {
      "property_type": "house",
      "min_price": 30000000,
      "max_price": 50000000,
      "bedrooms": 3,
      "neighborhood": "Gwarinpa"
    }
  }'
```

## 📁 Project Structure

```
abuja-realty-ai/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── entities/     # TypeORM database models
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── config/       # Configuration
│   │   └── server.ts     # Main server file
│   ├── Dockerfile
│   └── package.json
├── agents/               # Python ADK agents
│   ├── tools/            # Custom ADK tools
│   ├── orchestrator_agent.py
│   ├── search_agent.py
│   ├── showing_agent.py
│   ├── offer_agent.py
│   ├── market_agent.py
│   ├── disclosure_agent.py
│   ├── server.py         # FastAPI server
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/             # React PWA
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API clients
│   │   ├── types/        # TypeScript types
│   │   └── App.tsx
│   ├── public/           # Static assets
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml    # Docker orchestration
├── .env.example          # Environment template
└── README.md
```

## 🌍 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use production database credentials
- [ ] Configure CORS for your domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure WhatsApp webhook with production URL
- [ ] Restrict Google API keys to production domain
- [ ] Set up monitoring and logging
- [ ] Configure backups for PostgreSQL
- [ ] Set up Redis persistence

### Deploy to Cloud

**Recommended Platforms:**
- **Backend/Agents**: Google Cloud Run, AWS ECS, or DigitalOcean App Platform
- **Database**: Managed PostgreSQL (Google Cloud SQL, AWS RDS, DigitalOcean Managed DB)
- **Redis**: Managed Redis (Google Cloud Memorystore, AWS ElastiCache)
- **Frontend**: Vercel, Netlify, or Cloudflare Pages

### Environment Variables for Production

Update `.env` with production values:

```env
NODE_ENV=production
BACKEND_PORT=3000
DATABASE_URL=postgresql://user:pass@production-db-host:5432/abuja_realty
REDIS_URL=redis://production-redis-host:6379
CORS_ORIGIN=https://your-domain.com
VITE_API_URL=https://api.your-domain.com
```

## 🔐 Security

- All API keys are stored in environment variables
- Database passwords are not committed to git
- CORS is configured to restrict origins
- Rate limiting is enabled on all API endpoints
- WhatsApp webhook verification prevents unauthorized access
- Google API keys should be restricted to specific domains/IPs

## 📝 API Documentation

### Backend API Endpoints

**Properties:**
- `GET /api/properties` - Search properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property (admin)
- `PATCH /api/properties/:id/status` - Update status

**Showings:**
- `POST /api/showings` - Schedule showing
- `GET /api/showings/user/:user_id` - Get user showings
- `PATCH /api/showings/:id/status` - Update showing status

**Offers:**
- `POST /api/offers` - Create offer
- `GET /api/offers/user/:user_id` - Get user offers
- `PATCH /api/offers/:id/status` - Update offer status

**Webhooks:**
- `POST /api/webhooks/whatsapp` - WhatsApp message webhook
- `GET /api/webhooks/whatsapp` - WhatsApp verification

### Agent API Endpoints

- `POST /agent/query` - Query AI orchestrator
- `POST /tool/execute` - Execute specific tool
- `GET /health` - Health check

## 🤝 Contributing

This is a comprehensive project. Contributions are welcome!

## 📄 License

MIT License

## 🙋 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@abujarealty.ai
- WhatsApp: +234 XXX XXX XXXX

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Virtual property tours (360° photos)
- [ ] Mortgage calculator and pre-approval
- [ ] Property valuation ML model
- [ ] Multi-language support (Hausa, Yoruba, Igbo)
- [ ] Expansion to Lagos, Port Harcourt, Kano

---

**Built with ❤️ for the Nigerian real estate market**

Powered by Google ADK, Gemini AI, and modern web technologies.
