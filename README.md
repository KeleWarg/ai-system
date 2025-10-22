# AI Design System

An intelligent design system platform that transforms visual specifications into production-ready React components using AI.

## Overview

Upload a design spec, select a theme, and generate professional, accessible UI components instantly. Built for teams who want to maintain design consistency while accelerating development workflows.

## Key Features

- **AI-Powered Generation** - Convert design specifications into React/TypeScript components
- **Dynamic Theming** - Real-time theme switching with HSL-based color system
- **Component Library** - Browse, preview, and integrate components with live documentation
- **Admin Dashboard** - Manage themes, components, and system settings
- **Developer-Friendly** - Built with Tailwind CSS for maximum customization

## Tech Stack

- Next.js 15 with TypeScript
- Tailwind CSS v4
- Supabase (Database & Authentication)
- Claude AI (Vision & Code Generation)
- Radix UI Components

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Anthropic API key

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/ai-design-system.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run the development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Usage

### For Admins

1. **Create Themes** - Define color palettes, typography, and spacing
2. **Generate Components** - Upload design specs to create new components
3. **Manage Library** - Organize and maintain your component collection

### For Developers

1. **Browse Components** - Explore available components with live previews
2. **Copy Code** - Grab component code with one click
3. **Customize** - Adapt components to your needs using Tailwind utilities

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/ai-design-system)

Or deploy manually:

```bash
vercel --prod
```

## Documentation

- Component API reference available in the admin panel
- Theme customization guide in `/admin/themes`
- AI generation settings in `/admin/settings`

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

MIT © 2025

---

Built with ❤️ using Next.js and Claude AI
