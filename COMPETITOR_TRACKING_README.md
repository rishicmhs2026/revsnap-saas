# Real-Time Competitor Tracking System

## Overview

The RevSnap Competitor Tracking System provides real-time monitoring of competitor prices with advanced analytics, price alerts, and market intelligence. The system is built with Next.js, TypeScript, and includes both mock data for testing and real web scraping capabilities for production use.

## Features

### 🚀 Real-Time Tracking
- **Continuous Monitoring**: Track competitor prices at configurable intervals (5 minutes to 1 hour)
- **Live Updates**: Real-time price updates with WebSocket support
- **Multiple Competitors**: Monitor Amazon, Best Buy, Walmart, and other major retailers
- **Price Alerts**: Instant notifications for significant price changes

### 📊 Advanced Analytics
- **Market Position Analysis**: Compare your pricing against competitors
- **Price History Charts**: Visualize price trends over time
- **AI Recommendations**: Get intelligent pricing suggestions
- **Competitive Intelligence**: Understand market dynamics

### 🛡️ Robust Architecture
- **Error Handling**: Automatic retry mechanisms and failure recovery
- **Rate Limiting**: Respect competitor website rate limits
- **Mock Data**: Safe testing environment with realistic data simulation
- **Scalable Design**: Built for high-volume tracking operations

## System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes     │    │   Tracking      │
│   (React)       │◄──►│   (Next.js)      │◄──►│   Service       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WebSocket     │    │   Mock Data      │    │   Puppeteer     │
│   Client        │    │   Service        │    │   Scraping      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Components

### 1. Frontend (`src/app/competitor-tracking/page.tsx`)
- Real-time dashboard with live price updates
- Interactive controls for tracking configuration
- Price alerts and market analysis display
- Responsive design with dark theme

### 2. API Routes (`src/app/api/competitor-tracking/route.ts`)
- RESTful endpoints for tracking operations
- Support for one-time and continuous tracking
- Job management (start/stop/status)

### 3. Tracking Service (`src/lib/realtime-tracking.ts`)
- Background job management
- Interval-based tracking execution
- Error handling and recovery
- WebSocket broadcasting

### 4. Competitor Tracker (`src/lib/competitor-tracking.ts`)
- Web scraping with Puppeteer
- API integrations for major retailers
- Rate limiting and anti-detection measures
- Data normalization and validation

### 5. Mock Data Service (`src/lib/mock-data.ts`)
- Realistic price simulation
- Network delay simulation
- Failure simulation for testing
- Persistent price state

## API Endpoints

### GET `/api/competitor-tracking`
One-time competitor price tracking

**Parameters:**
- `productId` (required): Product identifier
- `competitors` (required): Comma-separated list of competitors
- `action` (optional): Special actions (start-tracking, stop-tracking, get-status)

**Example:**
```bash
curl "http://localhost:3000/api/competitor-tracking?productId=wireless-headphones&competitors=amazon,bestbuy,walmart"
```

### POST `/api/competitor-tracking`
Start continuous tracking

**Body:**
```json
{
  "productId": "wireless-headphones",
  "competitors": ["amazon", "bestbuy", "walmart"],
  "yourPrice": 95.00
}
```

### POST `/api/websocket`
WebSocket API for real-time operations

**Actions:**
- `start-tracking`: Start continuous monitoring
- `stop-tracking`: Stop active tracking
- `get-status`: Get tracking status

## Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Enable mock data for testing (set to 'false' for real scraping)
USE_MOCK_DATA=true

# WebSocket URL for real-time updates
NEXT_PUBLIC_WS_URL=http://localhost:3000

# API Keys (add your actual keys for production)
RAINFOREST_API_KEY=your_rainforest_api_key_here
EBAY_API_KEY=your_ebay_api_key_here
```

### Tracking Configuration

The system supports configurable tracking intervals:

- **5 minutes**: High-frequency monitoring for volatile markets
- **15 minutes**: Standard monitoring (default)
- **30 minutes**: Moderate monitoring
- **1 hour**: Low-frequency monitoring

## Usage

### Starting the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Using the Dashboard

1. **Navigate to Competitor Tracking**: Visit `/competitor-tracking`
2. **Configure Tracking**:
   - Select product to monitor
   - Set your current price
   - Choose tracking interval
   - Select competitors to monitor
3. **Start Tracking**: Click "Start Tracking" button
4. **Monitor Results**: View real-time updates, price alerts, and market analysis

### API Usage Examples

#### Start Real-Time Tracking
```bash
curl -X POST "http://localhost:3000/api/websocket" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "start-tracking",
    "productId": "wireless-headphones",
    "competitors": ["amazon", "bestbuy", "walmart"],
    "interval": 15,
    "yourPrice": 95.00
  }'
```

#### Check Tracking Status
```bash
curl -X POST "http://localhost:3000/api/websocket" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get-status",
    "productId": "wireless-headphones"
  }'
```

#### Stop Tracking
```bash
curl -X POST "http://localhost:3000/api/websocket" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "stop-tracking",
    "jobId": "tracking-wireless-headphones-1234567890"
  }'
```

## Troubleshooting

### Common Issues

1. **Mock Data Not Updating**
   - Ensure `USE_MOCK_DATA=true` in `.env.local`
   - Check browser console for errors
   - Verify tracking is active

2. **WebSocket Connection Issues**
   - Check `NEXT_PUBLIC_WS_URL` configuration
   - Verify server is running
   - Check browser network tab for connection errors

3. **Tracking Not Starting**
   - Verify API endpoints are accessible
   - Check server logs for errors
   - Ensure all required parameters are provided

4. **Rate Limiting Issues**
   - Increase tracking intervals
   - Check competitor website status
   - Verify API keys are valid

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=true
NODE_ENV=development
```

### Performance Optimization

1. **Reduce Tracking Frequency**: Use longer intervals for less critical products
2. **Limit Competitors**: Only track essential competitors
3. **Enable Caching**: Implement Redis for data caching
4. **Use CDN**: Serve static assets from CDN

## Production Deployment

### Prerequisites

1. **Database**: Set up PostgreSQL or MongoDB for data persistence
2. **Redis**: For caching and session management
3. **API Keys**: Obtain valid API keys for competitor services
4. **SSL Certificate**: For secure WebSocket connections

### Environment Setup

```env
# Production settings
NODE_ENV=production
USE_MOCK_DATA=false

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/revsnap

# Redis
REDIS_URL=redis://localhost:6379

# API Keys
RAINFOREST_API_KEY=your_production_key
EBAY_API_KEY=your_production_key

# WebSocket
NEXT_PUBLIC_WS_URL=https://yourdomain.com
```

### Deployment Steps

1. **Build Application**:
   ```bash
   npm run build
   ```

2. **Set Environment Variables**:
   Configure all production environment variables

3. **Start Application**:
   ```bash
   npm start
   ```

4. **Monitor Logs**:
   ```bash
   tail -f logs/app.log
   ```

## Security Considerations

1. **Rate Limiting**: Implement API rate limiting
2. **Authentication**: Add user authentication for tracking access
3. **Data Encryption**: Encrypt sensitive competitor data
4. **Input Validation**: Validate all user inputs
5. **CORS Configuration**: Configure CORS for production domains

## Future Enhancements

1. **Machine Learning**: Implement ML-based price prediction
2. **Advanced Analytics**: Add more sophisticated market analysis
3. **Mobile App**: Develop native mobile applications
4. **Integration APIs**: Add integrations with e-commerce platforms
5. **Automated Actions**: Implement automated price adjustments

## Support

For technical support or questions about the competitor tracking system:

1. Check the troubleshooting section above
2. Review server logs for error details
3. Verify configuration settings
4. Test with mock data first

## License

This project is part of the RevSnap B2B SaaS platform. All rights reserved. 