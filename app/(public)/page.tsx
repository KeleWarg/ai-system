import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Palette, Code, Zap, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center gap-8 pb-8 pt-12 md:pt-16 lg:pt-20 px-6">
        <div className="flex max-w-[980px] w-full flex-col items-center gap-6 text-center">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI-Powered Components
          </Badge>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1] bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Design System
            <br className="hidden sm:inline" />
            Built by AI
          </h1>
          <p className="max-w-[750px] text-xl text-muted-foreground sm:text-2xl leading-relaxed">
            Upload design specs and let Claude AI generate production-ready React components.
            Beautiful, accessible, and fully customizable.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/docs/components">
              <Button size="lg" className="gap-2 h-12 px-8 text-base">
                Browse Components
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 px-6">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group relative flex flex-col gap-6 rounded-lg border bg-card p-8 transition-all hover:border-primary hover:shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Palette className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Dynamic Theming</h3>
              <p className="text-muted-foreground leading-relaxed">
                Customize colors, typography, and spacing. Switch themes in real-time with instant preview.
              </p>
            </div>
          </div>

          <div className="group relative flex flex-col gap-6 rounded-lg border bg-card p-8 transition-all hover:border-primary hover:shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Zap className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">AI Generation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload design specs and let Claude AI extract details and generate production-ready code.
              </p>
            </div>
          </div>

          <div className="group relative flex flex-col gap-6 rounded-lg border bg-card p-8 transition-all hover:border-primary hover:shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Code className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Copy & Paste</h3>
              <p className="text-muted-foreground leading-relaxed">
                One-click copy for all components. TypeScript, Tailwind CSS, fully typed and documented.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 px-6">
        <div className="mx-auto flex max-w-[58rem] w-full flex-col items-center justify-center gap-6 text-center">
          <h2 className="font-extrabold text-4xl leading-tight sm:text-5xl md:text-6xl tracking-tight">
            Start Building Today
          </h2>
          <p className="max-w-[85%] text-xl leading-relaxed text-muted-foreground">
            Join the future of design systems. Create beautiful, accessible components
            powered by AI in minutes, not hours.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/docs/components">
              <Button size="lg" className="gap-2 h-12 px-8 text-base">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/admin/components/new">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                Create Component
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
