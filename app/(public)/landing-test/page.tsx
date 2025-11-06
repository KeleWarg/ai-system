import { Button } from '@/components/registry/button'
import { ArrowRight, Download, Sparkles, Zap, Code, Palette } from 'lucide-react'

export default function LandingTestPage() {
  return (
    <div className="min-h-screen bg-bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-bg-neutral-subtle to-bg-white py-24 px-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-bg/10 text-primary-bg text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Built with AI Design System
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-fg-heading">
              Ship Faster with
              <br />
              <span className="text-primary-bg">AI-Powered Components</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-fg-caption max-w-3xl mx-auto">
              Generate production-ready React components from design specs. 
              Beautiful, accessible, and fully customizable.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                variant="primary" 
                size="large"
                leftIcon={<Download className="h-5 w-5" />}
              >
                Get Started
              </Button>
              <Button 
                variant="secondary" 
                size="large"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                View Components
              </Button>
            </div>
            
            <p className="text-sm text-fg-caption">
              Free forever • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-fg-heading mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-fg-caption max-w-2xl mx-auto">
              A complete design system powered by AI, ready to use in your projects
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-lg border border-fg-stroke-ui bg-bg-neutral-subtle">
              <div className="w-12 h-12 rounded-lg bg-primary-bg/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary-bg" />
              </div>
              <h3 className="text-xl font-semibold text-fg-heading mb-2">
                AI Generation
              </h3>
              <p className="text-fg-caption mb-6">
                Upload design specs and get production-ready React components in seconds.
              </p>
              <Button variant="ghost" size="small">
                Learn More
              </Button>
            </div>
            
            <div className="p-8 rounded-lg border border-fg-stroke-ui bg-bg-neutral-subtle">
              <div className="w-12 h-12 rounded-lg bg-primary-bg/10 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-primary-bg" />
              </div>
              <h3 className="text-xl font-semibold text-fg-heading mb-2">
                Copy & Paste
              </h3>
              <p className="text-fg-caption mb-6">
                One-click copy for all components. TypeScript, Tailwind CSS, fully typed.
              </p>
              <Button variant="ghost" size="small">
                Explore
              </Button>
            </div>
            
            <div className="p-8 rounded-lg border border-fg-stroke-ui bg-bg-neutral-subtle">
              <div className="w-12 h-12 rounded-lg bg-primary-bg/10 flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-primary-bg" />
              </div>
              <h3 className="text-xl font-semibold text-fg-heading mb-2">
                Dynamic Theming
              </h3>
              <p className="text-fg-caption mb-6">
                Switch themes in real-time. HSL-based color system for maximum flexibility.
              </p>
              <Button variant="ghost" size="small">
                Try It
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-bg-neutral-subtle">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-fg-heading mb-4">
            Ready to Build?
          </h2>
          <p className="text-lg text-fg-caption mb-8">
            Start creating beautiful components with AI today. No setup required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              variant="primary" 
              size="large"
              leftIcon={<Sparkles className="h-5 w-5" />}
            >
              Create Component
            </Button>
            <Button 
              variant="white" 
              size="large"
            >
              Browse Library
            </Button>
          </div>
        </div>
      </section>

      {/* Button Variants Showcase */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-bg-white">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-fg-heading mb-4">
              Button Component Showcase
            </h2>
            <p className="text-lg text-fg-caption">
              Testing the Button component from our AI Design System registry
            </p>
          </div>
          
          <div className="space-y-12">
            {/* Variants */}
            <div>
              <h3 className="text-xl font-semibold text-fg-heading mb-4">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="white">White</Button>
              </div>
            </div>
            
            {/* Sizes */}
            <div>
              <h3 className="text-xl font-semibold text-fg-heading mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="small">Small</Button>
                <Button variant="primary" size="base">Base</Button>
                <Button variant="primary" size="large">Large</Button>
              </div>
            </div>
            
            {/* With Icons */}
            <div>
              <h3 className="text-xl font-semibold text-fg-heading mb-4">With Icons</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" leftIcon={<Download className="h-5 w-5" />}>
                  Download
                </Button>
                <Button variant="secondary" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Continue
                </Button>
                <Button variant="ghost" leftIcon={<Sparkles className="h-5 w-5" />}>
                  AI Magic
                </Button>
              </div>
            </div>
            
            {/* States */}
            <div>
              <h3 className="text-xl font-semibold text-fg-heading mb-4">States</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Enabled</Button>
                <Button variant="primary" disabled>Disabled</Button>
                <Button variant="primary" state="focused">Focused</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}




