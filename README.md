# AI-Powered Design System

A complete design system CMS that allows admins to upload PNG spec sheets and have AI automatically generate professional UI components.

## 🎯 Features

- **AI Component Generation** - Upload PNG → AI extracts specs → Auto-generates React components
- **Theme System** - HSL-based themes with real-time switching
- **Admin Panel** - Manage themes, components, and configurations
- **Public UI** - Browse, search, and copy components
- **AI Integration** - MCP Server, Registry API, llms.txt for AI tools
- **Tailwind-First** - Maximum flexibility using Tailwind utilities

## 🚀 Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **AI**: Anthropic Claude API (Vision + Code Generation)
- **Hosting**: Vercel

## 📦 Current Status

**✅ Part 1 Complete: Initial Setup**
- Next.js app initialized
- Dependencies installed
- Project structure created
- Tailwind configured with HSL color system
- Utility functions created
- All 20 tests passing

**Next Up: Part 2 - Supabase Backend**

## 🧪 Testing

```bash
npm run test:part1  # Test Part 1 setup
```

## 🎨 Customization

This system is 100% customizable. See documentation:
- `../CUSTOMIZATION_GUIDE.md` - Complete theming guide
- `../LAYOUT_PHILOSOPHY.md` - Tailwind-first approach
- `../TRUE_FROM_SCRATCH.md` - Full build guide

## 📝 License

MIT
