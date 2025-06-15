# 🎤 ElevenLabs Clone - AI Voice Synthesis Platform

A modern, full-stack AI voice synthesis platform built with Next.js 15, TypeScript, and Zustand. This project replicates the core functionality of ElevenLabs with text-to-speech conversion, voice selection, and audio playback.

![ElevenLabs Clone](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue) ![Zustand](https://img.shields.io/badge/Zustand-5.0-orange) ![Tailwind](https://img.shields.io/badge/Tailwind-4.0-blue)

## ✨ Features

### 🎯 Core Functionality
- **Text-to-Speech Generation** - Convert text to natural-sounding speech using StyleTTS2
- **Multiple Voice Selection** - Choose from various AI voices (Andreas, Amused Woman, Sleepy Voice)
- **Real-time Audio Playback** - Full-featured audio player with progress and volume controls
- **Voice History** - Track and replay previously generated audio clips
- **Credits System** - Monitor usage with built-in credit management

### 🎨 User Experience
- **Modern UI/UX** - Clean, professional interface inspired by ElevenLabs
- **Responsive Design** - Fully optimized for desktop and mobile devices
- **Real-time Progress** - Visual feedback during audio generation
- **Mobile-First** - Touch-friendly mobile interface with dedicated controls

### 🏗️ Technical Stack
- **Next.js 15** - Latest React framework with App Router
- **TypeScript** - Full type safety throughout the application
- **Zustand** - Lightweight state management for audio and UI state
- **Tailwind CSS** - Utility-first styling with custom design system
- **Prisma** - Type-safe database ORM
- **NextAuth** - Secure authentication system
- **AWS S3** - Scalable audio file storage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- AWS S3 bucket
- StyleTTS2 API backend running

### Installation

1. **Clone and install**
   ```bash
   git clone <your-repo-url>
   cd elevenlabs-frontend
   npm install
   ```

2. **Environment setup**
   Create `.env.local` with:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/elevenlabs_clone"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   AWS_ACCESS_KEY_ID="your-aws-key"
   AWS_SECRET_ACCESS_KEY="your-aws-secret"
   AWS_REGION="us-east-1"
   S3_BUCKET="elevenlabs-clone"
   STYLETTS2_API_URL="http://localhost:8000"
   STYLETTS2_API_KEY="your-api-key"
   ```

3. **Database setup**
   ```bash
   npm run db:push
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## 🏛️ Architecture

```
src/
├── app/                     # Next.js App Router
├── components/client/       # React components
│   ├── speech-synthesis/    # TTS components
│   ├── page-layout.tsx     # Main layout
│   ├── sidebar.tsx         # Navigation
│   └── playbar.tsx         # Audio player
├── stores/                 # Zustand state management
│   ├── audio-store.ts      # Audio playback
│   ├── voice-store.ts      # Voice selection
│   └── ui-store.ts         # UI state
├── actions/tts.ts          # Server actions
└── lib/history.ts          # History management
```

## 🎮 Usage

1. **Text Input** - Enter text (up to 5,000 characters)
2. **Voice Selection** - Choose from available voices
3. **Generate** - Click generate to create speech
4. **Playback** - Use the audio player controls
5. **History** - Access previous generations

## 🔧 API Integration

Connects to StyleTTS2 backend:
```json
POST /generate
{
  "text": "Hello, world!",
  "target_voice": "3"
}
```

## 📱 Mobile Support

- Responsive design for all devices
- Touch-friendly controls
- Mobile settings button
- Slide-out navigation

## 🛠️ Development

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code linting
npm run type-check   # TypeScript check
npm run db:studio    # Database GUI
```

## 🚀 Deployment

Deploy to Vercel:
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

---

Built with the T3 Stack: Next.js, TypeScript, Tailwind CSS, Prisma, NextAuth
