# Developer Leaderboard

A real-time developer score ranking system built with Next.js, featuring live updates, authentication, and competitive leaderboards.

## Features

- 🔐 **User Authentication** - Sign up, sign in, email verification
- 🏆 **Real-time Leaderboard** - Live score updates via WebSocket
- 📊 **Score Submission** - Submit and track your coding achievements
- 🔔 **Live Notifications** - Real-time alerts for high scores and new players
- 📱 **Responsive Design** - Works on desktop and mobile
- 🌙 **Dark Mode** - Modern dark theme by default

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# API Configuration (Required)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/dev

# WebSocket Configuration (Optional - for real-time features)
NEXT_PUBLIC_WS_URL=http://localhost:3002

# Set to false to disable WebSocket entirely (Optional)
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
```

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
# or
yarn install && yarn dev
# or
pnpm install && pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## WebSocket Integration

The app includes real-time features via WebSocket:
- **Real-time leaderboard updates** - See scores update instantly
- **Live notifications** - Get notified of high scores and new players
- **Connection status** - Visual indicators for online/offline state

### Graceful Degradation
If the WebSocket server is not available:
- The app falls back to REST API data
- Connection errors are displayed with retry options  
- All core functionality remains available
- Users can manually refresh data

### Troubleshooting WebSocket Issues
1. **Check the WebSocket URL** in your `.env.local`
2. **Ensure the WebSocket server is running** on the specified port
3. **Check browser console** for connection error details
4. **Use the retry button** in the notifications panel
5. **Disable WebSocket** by setting `NEXT_PUBLIC_ENABLE_WEBSOCKET=false`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
