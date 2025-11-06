import { getComponentBySlug } from '@/lib/db/components'
import { getCurrentUser } from '@/lib/auth-helpers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeBlockEnhanced } from '@/components/code-block-enhanced'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ComponentPreviewReal } from '@/components/component-preview-real'
import { Package, Layers, Code2, Palette, Edit } from 'lucide-react'

export default async function ComponentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const component = await getComponentBySlug(slug)
  const currentUser = await getCurrentUser()
  
  // Check if user can edit (admin or editor)
  const userRole = (currentUser?.dbUser as { role?: string } | undefined)?.role
  const canEdit = userRole === 'admin' || userRole === 'editor'

  if (!component) {
    notFound()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Layers className="h-3 w-3" />
              {component.category}
            </Badge>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/components/${slug}/properties`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Properties
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/components/${slug}/remap`}>
                  <Palette className="h-4 w-4 mr-2" />
                  Remap Styles
                </Link>
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
            {component.name}
          </h1>
          <p className="text-lg text-fg-caption">
            {component.description}
          </p>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="preview" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-5">
          <TabsTrigger value="preview" className="gap-2">
            <Layers className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="gap-2">
            <Code2 className="h-4 w-4" />
            Code
          </TabsTrigger>
          <TabsTrigger value="props" className="gap-2">
            <Package className="h-4 w-4" />
            Props
          </TabsTrigger>
          {component.prompts && (
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
          )}
          <TabsTrigger value="installation">Install</TabsTrigger>
        </TabsList>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Component Preview
            </h2>
            <p className="text-fg-caption">
              Real component rendering using Next.js dynamic imports.
            </p>
          </div>
          
          <ComponentPreviewReal 
            slug={component.slug}
            componentName={component.component_name || component.name}
            componentCode={component.code}
            variants={component.variants as Record<string, string[]>}
            description={component.description}
            spacing={[
              "Base height: 40px, Padding: 12px 16px",
              "Large height: 48px, Padding: 14px 20px",
              "Small height: 32px, Padding: 8px 12px",
              "Icon spacing: 8px gap"
            ]}
          />
        </TabsContent>

        {/* Code Tab */}
        <TabsContent value="code" className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Component Code
            </h2>
            <p className="text-fg-caption">
              Copy and paste this into your project.
            </p>
          </div>
          <CodeBlockEnhanced
            code={component.code}
            language="tsx"
            filename={`${component.slug}.tsx`}
          />

          {/* Variants */}
          {component.variants && Object.keys(component.variants).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(component.variants).map(([key, values]) => (
                    <div key={key}>
                      <h3 className="font-medium mb-2 capitalize">{key}</h3>
                      <div className="flex flex-wrap gap-2">
                        {values.map((value) => (
                          <Badge key={value} variant="secondary">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Props Tab */}
        <TabsContent value="props">
          <Card>
            <CardHeader>
              <CardTitle>Component Props</CardTitle>
            </CardHeader>
            <CardContent>
              {component.props && component.props.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Name</th>
                        <th className="text-left p-2 font-medium">Type</th>
                        <th className="text-left p-2 font-medium">Required</th>
                        <th className="text-left p-2 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {component.props.map((prop, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-mono text-sm">{prop.name}</td>
                          <td className="p-2 font-mono text-sm text-fg-caption">
                            {prop.type}
                          </td>
                          <td className="p-2">
                            {prop.required ? (
                              <Badge variant="destructive">Required</Badge>
                            ) : (
                              <Badge variant="secondary">Optional</Badge>
                            )}
                          </td>
                          <td className="p-2 text-sm">{prop.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-fg-caption">
                  No props documentation available.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Prompts Tab */}
        {component.prompts && (
          <TabsContent value="prompts" className="space-y-4">
            {component.prompts.basic && component.prompts.basic.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Basic Prompts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {component.prompts.basic.map((prompt, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-md bg-bg-neutral text-sm"
                    >
                      {prompt}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {component.prompts.advanced && component.prompts.advanced.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Prompts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {component.prompts.advanced.map((prompt, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-md bg-bg-neutral text-sm"
                    >
                      {prompt}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Installation Tab */}
        <TabsContent value="installation">
          <div className="space-y-4">
            {/* Quick Start */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Start - Copy & Paste</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-fg-caption">
                  The easiest way to use this component is to copy the code directly.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Step 1: Copy the component code</h4>
                  <p className="text-xs text-fg-caption">
                    Use the "Code" tab above to copy the component code, then save it to your project.
                  </p>
                  <CodeBlockEnhanced
                    code={`// Save to: components/ui/${component.slug}.tsx
// Copy the code from the Code tab above`}
                    language="typescript"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Step 2: Install dependencies</h4>
                  <CodeBlockEnhanced
                    code={`npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge${
                      component.installation?.dependencies
                        ? ' ' + component.installation.dependencies.join(' ')
                        : ''
                    }`}
                    language="bash"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Step 3: Use the component</h4>
                  <CodeBlockEnhanced
                    code={`import { ${component.component_name} } from '@/components/ui/${component.slug}'

export default function MyPage() {
  return (
    <${component.component_name} variant="primary">
      Click me
    </${component.component_name}>
  )
}`}
                    language="tsx"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dependencies */}
            {(component.installation?.dependencies?.length > 0 ||
              component.installation?.devDependencies?.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Dependencies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {component.installation.dependencies &&
                    component.installation.dependencies.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-2 text-sm">Dependencies</h3>
                        <CodeBlockEnhanced
                          code={`npm install ${component.installation.dependencies.join(' ')}`}
                          language="bash"
                        />
                      </div>
                    )}
                  {component.installation.devDependencies &&
                    component.installation.devDependencies.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-2 text-sm">Dev Dependencies</h3>
                        <CodeBlockEnhanced
                          code={`npm install -D ${component.installation.devDependencies.join(' ')}`}
                          language="bash"
                        />
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Alternative Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Alternative Installation Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Method 1: Fetch via API</h4>
                  <CodeBlockEnhanced
                    code={`// Fetch component code programmatically
const res = await fetch('https://your-domain.com/api/registry/${component.slug}')
const { code, dependencies } = await res.json()

// Save code to your project
// Install dependencies: npm install ...`}
                    language="typescript"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Method 2: Git Submodule</h4>
                  <CodeBlockEnhanced
                    code={`# Add this repo as a submodule
git submodule add https://github.com/your-org/ai-design-system.git packages/design-system

# Import component
import { ${component.component_name} } from '@/packages/design-system/components/registry/${component.slug}'`}
                    language="bash"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Method 3: npm Package (Coming Soon)</h4>
                  <CodeBlockEnhanced
                    code={`npm install @ai-design-system/components
import { ${component.component_name} } from '@ai-design-system/components'`}
                    language="bash"
                  />
                  <p className="text-xs text-fg-caption">
                    Run <code className="px-1 py-0.5 bg-bg-neutral rounded">npm run generate-package</code> to create an installable package.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Setup Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Setup Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">1. Utility Function</h4>
                  <p className="text-xs text-fg-caption mb-2">
                    Add this to your <code className="px-1 py-0.5 bg-bg-neutral rounded">lib/utils.ts</code>:
                  </p>
                  <CodeBlockEnhanced
                    code={`import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`}
                    language="typescript"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">2. Tailwind CSS</h4>
                  <p className="text-xs text-fg-caption mb-2">
                    Ensure Tailwind CSS is configured with CSS variables support.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">3. Theme Variables</h4>
                  <p className="text-xs text-fg-caption mb-2">
                    Copy theme CSS variables from <code className="px-1 py-0.5 bg-bg-neutral rounded">lib/color-system.ts</code> or fetch from your active theme API.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

