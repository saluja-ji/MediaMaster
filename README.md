# MediaMaster: AI-Driven Social Media Management Platform

An advanced social media management platform powered by AI that helps creators maximize their online engagement and monetization potential through predictive analytics, content optimization, shadowban prevention, auto-engagement, and comprehensive monetization tracking.

## Features

- **Engagement Prediction AI**: Advanced analysis to predict post performance before publishing
- **Shadowban & Spam Protection**: Proactive detection and avoidance of platform-specific content issues
- **Content Optimization**: AI-powered recommendations for improving content engagement
- **Monetization Suite with Brand Partnerships**: Track revenue across platforms and discover potential brand partnerships
- **AI Auto-Engage Assistant**: Intelligent interaction management with your audience
- **Real ROI Tracking**: Accurate measurement of your social media investment returns
- **Multi-Platform Support**: Manage accounts across Twitter, Instagram, Facebook, Pinterest, Snapchat, Threads, Reddit, Discord, WhatsApp, Telegram, Medium, Tumblr, Mastodon and more

## Technology Stack

- **Frontend**: React with TypeScript, TailwindCSS, Shadcn/UI components
- **Backend**: Node.js, Express API
- **AI Integration**: OpenAI GPT-4o API
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Docker containerization with Docker Compose

## Getting Started

### Prerequisites

- Node.js v20+
- PostgreSQL (for local development without Docker)
- Docker and Docker Compose (for containerized deployment)
- OpenAI API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/saluja-ji/MediaMaster.git
   cd MediaMaster
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Then add your OpenAI API key and database configuration to the `.env` file.

4. For local development with PostgreSQL:
   ```bash
   # Create the database
   createdb mediamaster

   # Apply the database schema
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Docker Deployment

1. Build and start the containers (application and PostgreSQL database):
   ```bash
   docker-compose up -d
   ```

2. The application will be available at `http://localhost:5000`

3. For production deployment with HTTPS, see the detailed instructions in `deployment/DOCKER_DEPLOYMENT.md`

## Project Structure

```
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions and API clients
│   │   └── pages/      # Main application pages
├── server/             # Backend Express server
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API route definitions
│   ├── storage.ts      # Data storage interface
│   └── openai.ts       # OpenAI integration
├── shared/             # Shared types and schemas
├── deployment/         # Deployment configuration
├── docker-compose.yml  # Docker Compose configuration
└── Dockerfile          # Docker build configuration
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| NODE_ENV | Environment mode (development/production) | Yes |
| PORT | Port to run the server on | Yes |
| OPENAI_API_KEY | Your OpenAI API key | Yes |
| DATABASE_URL | PostgreSQL connection string | Yes for DB mode |
| PGHOST | PostgreSQL host | Auto set by DATABASE_URL |
| PGPORT | PostgreSQL port | Auto set by DATABASE_URL |
| PGUSER | PostgreSQL username | Auto set by DATABASE_URL |
| PGPASSWORD | PostgreSQL password | Auto set by DATABASE_URL |
| PGDATABASE | PostgreSQL database name | Auto set by DATABASE_URL |

Additional optional social media API keys are available in `.env.example`.

## License

This project is licensed under the MIT License - see the LICENSE file for details.