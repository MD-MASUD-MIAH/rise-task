# Rise Task — Political Poster Generator Platform

An AI-powered political poster generation platform built with Next.js and Node.js.

## 🚀 Overview

- **Frontend (`client`)**: Next.js 16 (App Router), React 19, Tailwind CSS, Lucide icons.
- **Backend (`server`)**: Express, TypeScript, Canvas poster generation, Google Gemini AI integration.

## 📁 Project Structure

```
rise-task/
├── client/           # Next.js frontend application
├── server/           # Express & TypeScript backend API
├── package.json      # Monorepo workspace configuration
└── README.md
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or pnpm

### Installation

```bash
# Install all dependencies across the monorepo
npm install
```

### Environment Setup

1. **Client**:
   Create `client/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

2. **Server**:
   Create `server/.env` based on `server/.env.example`.

### Running Locally

```bash
# Run client (frontend)
npm run dev:client

# Run server (backend)
npm run dev:server
```

### Building for Production

```bash
# Build client
npm run build:client

# Build server
npm run build:server
```

## 🌐 Deployment

- **Frontend**: Deployable on [Vercel](https://vercel.com) (Root Directory: `client` or root workspace build).
- **Backend**: Deployable on Render / Railway / VPS.
