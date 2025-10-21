import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Palette, Code, Zap, Search } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center gap-4 px-6 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
            AI-Powered Design System
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Upload PNG spec sheets and let AI generate professional React components. 
            Beautiful, customizable, and production-ready.
          </p>
          <div className="flex gap-4">
            <Link href="/docs/components">
              <Button size="lg">
                Browse Components
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="lg">
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-8 px-6 md:py-12 md:px-12 lg:py-24 lg:px-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Palette className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Theme System</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Customize colors, typography, and spacing. Switch themes in real-time.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload spec sheets and let Claude AI extract specifications and generate code.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Code className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Copy & Paste</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                One-click copy for all components. TypeScript, Tailwind CSS, fully typed.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Search className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Quick Search</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Find components instantly with ⌘K search. Keyboard shortcuts included.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-8 px-6 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
            Start Building Today
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Join the future of design systems. Create beautiful, accessible components
            powered by AI in minutes, not hours.
          </p>
          <Link href="/docs/components">
            <Button size="lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
