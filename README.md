This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Copy environment variables and configure socket settings:

```bash
cp .env.example .env
```

Required for real-time chat (see `.env.example`):

| Variable | Description |
|----------|-------------|
| `SOCKET_PORT` | Port for the dedicated Socket.IO server (default `3001`) |
| `NEXT_PUBLIC_SOCKET_URL` | Browser WebSocket URL (e.g. `http://localhost:3001`) |
| `SOCKET_SERVER_URL` | Next.js server-side URL to call internal emit API |
| `SOCKET_CORS_ORIGIN` | Allowed browser origin for socket CORS (e.g. `http://localhost:3000`) |
| `SOCKET_INTERNAL_SECRET` | Shared secret for Next → socket internal API |

Run the development servers (Next.js + socket server):

```bash
npm install
npm run dev
```

- Next.js app: [http://localhost:3000](http://localhost:3000)
- Socket server: port `3001` (configurable via `SOCKET_PORT`)

Run processes separately if needed:

```bash
npm run dev:next
npm run dev:socket
```

Production (after `npm run build`):

```bash
npm run start
npm run start:socket
```

Or use PM2 with `ecosystem.config.cjs` to run both apps.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
