import { getComponentBySlug } from '@/lib/db/components'
import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeBlockEnhanced } from '@/components/code-block-enhanced'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Package, Layers, Code2 } from 'lucide-react'

export default async function ComponentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const component = await getComponentBySlug(slug)

  if (!component) {
    notFound()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Layers className="h-3 w-3" />
            {component.category}
          </Badge>
        </div>
        <div className="space-y-2">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
            {component.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            {component.description}
          </p>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="code" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-4">
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
          {component.installation && (
            <TabsTrigger value="installation">Install</TabsTrigger>
          )}
        </TabsList>

        {/* Code Tab */}
        <TabsContent value="code" className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Component Code
            </h2>
            <p className="text-muted-foreground">
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
                          <td className="p-2 font-mono text-sm text-muted-foreground">
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
                <p className="text-sm text-muted-foreground">
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
                      className="p-3 rounded-md bg-muted text-sm"
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
                      className="p-3 rounded-md bg-muted text-sm"
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
        {component.installation && (
          <TabsContent value="installation">
            <Card>
              <CardHeader>
                <CardTitle>Installation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {component.installation.dependencies &&
                  component.installation.dependencies.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Dependencies</h3>
                      <CodeBlock
                        code={`npm install ${component.installation.dependencies.join(' ')}`}
                        language="bash"
                      />
                    </div>
                  )}
                {component.installation.devDependencies &&
                  component.installation.devDependencies.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Dev Dependencies</h3>
                      <CodeBlock
                        code={`npm install -D ${component.installation.devDependencies.join(' ')}`}
                        language="bash"
                      />
                    </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

