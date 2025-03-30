# AI-Driven Social Media Management Platform

An advanced social media management platform powered by AI for engagement prediction, content optimization, shadowban prevention, auto-engagement, and monetization tracking.

## Features

- **Engagement Prediction**: AI-driven analysis to predict post performance
- **Shadowban & Spam Protection**: Detect and avoid potential content issues
- **Content Optimization**: Get AI recommendations for improving content
- **Monetization Suite**: Track revenue across multiple platforms
- **Auto-Engage Assistant**: Intelligent interaction with your audience
- **Multi-Platform Support**: Manage accounts across Twitter, Instagram, Facebook, Pinterest, Snapchat, Threads, Reddit, Discord, WhatsApp, Telegram, Medium, Tumblr, Mastodon and more

## Technology Stack

- **Frontend**: React with TypeScript, TailwindCSS, Shadcn/UI
- **Backend**: Node.js, Express
- **AI Integration**: OpenAI API
- **Database**: In-memory storage (with option for PostgreSQL)

## Getting Started

### Prerequisites

- Node.js v16+
- Docker and Docker Compose (for containerized deployment)
- OpenAI API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/social-media-ai-platform.git
   cd social-media-ai-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Then add your OpenAI API key to the `.env` file.

4. Start the development server:
   ```bash
   npm run dev
   ```

### Docker Deployment

1. Build and start the container:
   ```bash
   docker-compose up -d
   ```

2. The application will be available at `http://localhost:5000`

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.