import { getComponentBySlug } from '@/lib/db/components'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeBlock } from '@/components/code-block'
import { Badge } from '@/components/ui/badge'

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
    <div className="container py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline">{component.category}</Badge>
          <span className="text-sm text-muted-foreground">
            Updated {new Date(component.updated_at).toLocaleDateString()}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-2">
          {component.name}
        </h1>
        <p className="text-lg text-muted-foreground">
          {component.description}
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="code" className="space-y-4">
        <TabsList>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="props">Props</TabsTrigger>
          {component.prompts && (
            <TabsTrigger value="prompts">AI Prompts</TabsTrigger>
          )}
          {component.installation && (
            <TabsTrigger value="installation">Installation</TabsTrigger>
          )}
        </TabsList>

        {/* Code Tab */}
        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Component Code</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={component.code}
                language="tsx"
                filename={`${component.slug}.tsx`}
              />
            </CardContent>
          </Card>

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

