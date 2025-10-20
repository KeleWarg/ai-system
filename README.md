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

**✅ Part 2 Complete: Supabase Backend**
- Database schema created (users, themes, components)
- Row Level Security policies
- TypeScript types and client utilities
- Database helper functions
- 13/16 tests passing (needs Supabase credentials)
- See `SUPABASE_SETUP.md` for setup instructions

**✅ Part 3 Complete: Authentication**
- Middleware for protected routes
- Auth helper functions and hooks
- Login page with Supabase auth
- Logout and user API routes
- Role-based permissions (admin/editor)
- All 17/17 tests passing

**✅ Part 4 Complete: Theme System**
- ThemeProvider with real-time updates
- useTheme hook for theme management
- CSS variable generator and validation
- Theme API routes (CRUD operations)
- HSL color utilities (validation, hex conversion)
- All 19/19 tests passing

**✅ Part 5 Complete: Admin Panel**
- Admin dashboard with stats
- Theme management (CRUD, activate)
- Admin sidebar with navigation
- Reusable UI components
- Permission-based actions
- All 20/20 tests passing

**Next Up: Part 6 - AI Integration**

## 🧪 Testing

```bash
npm run test:part1  # Test Part 1 setup (20/20 passing)
npm run test:part2  # Test Part 2 Supabase backend (13/16 passing)
npm run test:part3  # Test Part 3 Authentication (17/17 passing)
npm run test:part4  # Test Part 4 Theme System (19/19 passing)
npm run test:part5  # Test Part 5 Admin Panel (20/20 passing)
```

## 🎨 Customization

This system is 100% customizable. See documentation:
- `../CUSTOMIZATION_GUIDE.md` - Complete theming guide
- `../LAYOUT_PHILOSOPHY.md` - Tailwind-first approach
- `../TRUE_FROM_SCRATCH.md` - Full build guide

## 📝 License

MIT
