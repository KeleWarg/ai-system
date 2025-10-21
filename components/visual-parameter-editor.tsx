'use client'

/**
 * Visual Parameter Editor
 * No-code interface for fixing component validation issues
 */

import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import {
  SpacingInput,
  ColorInput,
  TypographyInput,
  VariantManager,
} from './ui/property-input'
import {
  parseComponentProperties,
  groupProperties,
  type ExtractedSpec,
} from '@/lib/component-parser'
import type { ComponentAnalysis } from '@/lib/ai/spec-validator'
import {
  updateComponentProperty,
  validateUpdatedCode,
  type EditableProperty,
} from '@/lib/component-updater'

interface VisualParameterEditorProps {
  componentCode: string
  spec: ExtractedSpec
  validation: ComponentAnalysis
  onApply: (updatedCode: string) => void
  onCancel: () => void
}

export function VisualParameterEditor({
  componentCode,
  spec,
  validation,
  onApply,
  onCancel,
}: VisualParameterEditorProps) {
  const [code, setCode] = useState(componentCode)
  const [properties, setProperties] = useState(() =>
    parseComponentProperties(componentCode, spec, validation)
  )
  
  useEffect(() => {
    setCode(componentCode)
    setProperties(parseComponentProperties(componentCode, spec, validation))
  }, [componentCode, spec, validation])
  
  const grouped = groupProperties(properties)
  
  const issueCount = {
    spacing: grouped.spacing.issues.length,
    colors: grouped.colors.issues.length,
    typography: grouped.typography.issues.length,
    variants: grouped.variants.issues.length,
  }
  
  const totalIssues = Object.values(issueCount).reduce((a, b) => a + b, 0)
  
  const handlePropertyChange = (property: EditableProperty, newValue: string) => {
    const updatedCode = updateComponentProperty(code, property, newValue)
    setCode(updatedCode)
    
    // Re-parse properties with updated code
    const updatedProperties = parseComponentProperties(updatedCode, spec, validation)
    setProperties(updatedProperties)
  }
  
  const handleApply = () => {
    const { valid, errors } = validateUpdatedCode(code)
    
    if (!valid) {
      alert(`Code validation failed:\n${errors.join('\n')}`)
      return
    }
    
    onApply(code)
  }
  
  return (
    <Card className="p-6 border-2 border-purple-500 bg-purple-50 dark:bg-purple-950/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              🎨 Visual Editor
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Adjust properties visually without editing code
            </p>
          </div>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
          >
            ✕
          </Button>
        </div>
        
        {/* Issue Summary */}
        {totalIssues > 0 && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg p-3">
            <p className="text-sm font-medium text-red-600">
              {totalIssues} {totalIssues === 1 ? 'issue' : 'issues'} found that need fixing
            </p>
          </div>
        )}
        
        {/* Property Tabs */}
        <Tabs defaultValue="spacing" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="spacing">
              Spacing
              {issueCount.spacing > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {issueCount.spacing}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="colors">
              Colors
              {issueCount.colors > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {issueCount.colors}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="typography">
              Typography
              {issueCount.typography > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {issueCount.typography}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="variants">
              Variants
              {issueCount.variants > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {issueCount.variants}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          {/* Spacing Tab */}
          <TabsContent value="spacing" className="space-y-4">
            <Accordion type="multiple" defaultValue={grouped.spacing.issues.length > 0 ? ['issues'] : []}>
              {grouped.spacing.issues.length > 0 && (
                <AccordionItem value="issues" className="border-red-200">
                  <AccordionTrigger className="text-red-600 font-semibold">
                    Issues to Fix ({grouped.spacing.issues.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {grouped.spacing.issues.map((prop) => (
                        <SpacingInput
                          key={prop.id}
                          label={prop.name}
                          tailwindValue={prop.tailwindClass || ''}
                          pixelValue={prop.pixelValue || 0}
                          property={prop.cssProperty || 'height'}
                          hasIssue={prop.hasIssue}
                          recommendation={prop.recommendation}
                          onChange={(tw) => handlePropertyChange(prop, tw)}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {grouped.spacing.optional.length > 0 && (
                <AccordionItem value="optional">
                  <AccordionTrigger>
                    Optional Adjustments ({grouped.spacing.optional.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {grouped.spacing.optional.map((prop) => (
                        <SpacingInput
                          key={prop.id}
                          label={prop.name}
                          tailwindValue={prop.tailwindClass || ''}
                          pixelValue={prop.pixelValue || 0}
                          property={prop.cssProperty || 'height'}
                          onChange={(tw) => handlePropertyChange(prop, tw)}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </TabsContent>
          
          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-4">
            <Accordion type="multiple" defaultValue={grouped.colors.issues.length > 0 ? ['issues'] : []}>
              {grouped.colors.issues.length > 0 && (
                <AccordionItem value="issues" className="border-red-200">
                  <AccordionTrigger className="text-red-600 font-semibold">
                    Issues to Fix ({grouped.colors.issues.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {grouped.colors.issues.map((prop) => (
                        <ColorInput
                          key={prop.id}
                          label={prop.name}
                          currentValue={prop.currentValue}
                          hasIssue={prop.hasIssue}
                          recommendation={prop.recommendation}
                          onChange={(val) => handlePropertyChange(prop, val)}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {grouped.colors.optional.length > 0 && (
                <AccordionItem value="optional">
                  <AccordionTrigger>
                    Optional Adjustments ({grouped.colors.optional.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {grouped.colors.optional.map((prop) => (
                        <ColorInput
                          key={prop.id}
                          label={prop.name}
                          currentValue={prop.currentValue}
                          onChange={(val) => handlePropertyChange(prop, val)}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </TabsContent>
          
          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-4">
            <Accordion type="multiple" defaultValue={grouped.typography.issues.length > 0 ? ['issues'] : []}>
              {grouped.typography.issues.length > 0 && (
                <AccordionItem value="issues" className="border-red-200">
                  <AccordionTrigger className="text-red-600 font-semibold">
                    Issues to Fix ({grouped.typography.issues.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {grouped.typography.issues.map((prop) => (
                        <TypographyInput
                          key={prop.id}
                          label={prop.name}
                          tailwindValue={prop.tailwindClass || ''}
                          pixelValue={prop.pixelValue || 0}
                          property={prop.cssProperty as 'fontSize' | 'fontWeight'}
                          hasIssue={prop.hasIssue}
                          recommendation={prop.recommendation}
                          onChange={(val) => handlePropertyChange(prop, val)}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {grouped.typography.optional.length > 0 && (
                <AccordionItem value="optional">
                  <AccordionTrigger>
                    Optional Adjustments ({grouped.typography.optional.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {grouped.typography.optional.map((prop) => (
                        <TypographyInput
                          key={prop.id}
                          label={prop.name}
                          tailwindValue={prop.tailwindClass || ''}
                          pixelValue={prop.pixelValue || 0}
                          property={prop.cssProperty as 'fontSize' | 'fontWeight'}
                          onChange={(val) => handlePropertyChange(prop, val)}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </TabsContent>
          
          {/* Variants Tab */}
          <TabsContent value="variants" className="space-y-4">
            <Accordion type="multiple" defaultValue={grouped.variants.issues.length > 0 ? ['issues'] : []}>
              {grouped.variants.issues.length > 0 && (
                <AccordionItem value="issues" className="border-red-200">
                  <AccordionTrigger className="text-red-600 font-semibold">
                    Issues to Fix ({grouped.variants.issues.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {grouped.variants.issues.map((prop) => (
                        <VariantManager
                          key={prop.id}
                          label={prop.name}
                          variantKey={prop.variantKey || ''}
                          values={prop.variantValues || []}
                          hasIssue={prop.hasIssue}
                          recommendation={prop.recommendation}
                          onAdd={(val) => {
                            const updated = [...(prop.variantValues || []), val]
                            handlePropertyChange(prop, updated.join(','))
                          }}
                          onRemove={(val) => {
                            const updated = (prop.variantValues || []).filter((v) => v !== val)
                            handlePropertyChange(prop, updated.join(','))
                          }}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {grouped.variants.optional.length > 0 && (
                <AccordionItem value="optional">
                  <AccordionTrigger>
                    Optional Adjustments ({grouped.variants.optional.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {grouped.variants.optional.map((prop) => (
                        <VariantManager
                          key={prop.id}
                          label={prop.name}
                          variantKey={prop.variantKey || ''}
                          values={prop.variantValues || []}
                          onAdd={(val) => {
                            const updated = [...(prop.variantValues || []), val]
                            handlePropertyChange(prop, updated.join(','))
                          }}
                          onRemove={(val) => {
                            const updated = (prop.variantValues || []).filter((v) => v !== val)
                            handlePropertyChange(prop, updated.join(','))
                          }}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </TabsContent>
        </Tabs>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleApply}
            variant="default"
            className="flex-1"
          >
            ✅ Apply Changes & Re-Validate
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  )
}

