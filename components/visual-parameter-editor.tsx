'use client'

/**
 * Visual Parameter Editor (Theme Mapping Tool)
 * User-friendly interface for mapping spec requirements to theme tokens
 */

import { useState, useMemo, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { CheckCircle2, X } from 'lucide-react'
import {
  extractMappingIssues,
  extractAllEditableProperties,
  type MappingIssue,
  type ExtractedSpec,
  type Theme,
} from '@/lib/mapping-extractor'
import type { ComponentAnalysis } from '@/lib/ai/spec-validator'
import {
  applyMappingsToCode,
  type SpecToThemeMappings,
} from '@/lib/code-mapper'
import { validateComponentAgainstSpec } from '@/lib/ai/spec-validator'
import {
  ColorMappingInput,
  SpacingMappingInput,
  VariantMappingInput,
} from './ui/mapping-inputs'

interface VisualParameterEditorProps {
  componentCode: string
  spec: ExtractedSpec
  validation: ComponentAnalysis
  currentTheme?: Theme
  onApply: (updatedCode: string, newScore: number) => void
  onCancel: () => void
}

export function VisualParameterEditor({
  componentCode,
  spec,
  validation,
  currentTheme,
  onApply,
  onCancel,
}: VisualParameterEditorProps) {
  const [mode, setMode] = useState<'issues' | 'advanced'>('issues')
  
  const [issues] = useState<MappingIssue[]>(() =>
    extractMappingIssues(spec, validation, currentTheme)
  )
  
  const [allProperties] = useState<MappingIssue[]>(() =>
    extractAllEditableProperties(spec, validation, componentCode, currentTheme)
  )
  
  const [mappings, setMappings] = useState<SpecToThemeMappings>({
    colors: [],
    spacing: [],
    variants: [],
  })
  
  // Use refs to prevent infinite loops
  const mappingsRef = useRef(mappings)
  mappingsRef.current = mappings
  
  // Memoize preview code - only recalculate when mappings actually change
  const previewCode = useMemo(() => {
    const hasMappings = mappings.colors.length > 0 || mappings.spacing.length > 0 || mappings.variants.length > 0
    
    if (hasMappings) {
      console.log('🔄 Applying mappings to code')
      return applyMappingsToCode(componentCode, mappings)
    }
    
    return componentCode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentCode, mappings.colors.length, mappings.spacing.length, mappings.variants.length])
  
  // Memoize preview score - only recalculate when preview code changes
  const previewScore = useMemo(() => {
    const hasMappings = mappingsRef.current.colors.length > 0 || mappingsRef.current.spacing.length > 0 || mappingsRef.current.variants.length > 0
    
    if (hasMappings) {
      const newValidation = validateComponentAgainstSpec(previewCode, spec)
      console.log('📊 Validation score:', newValidation.overallMatch)
      return newValidation.overallMatch
    }
    
    return validation.overallMatch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewCode])
  
  const handleColorMapping = (issue: MappingIssue, themeToken: string) => {
    setMappings(prev => ({
      ...prev,
      colors: [
        ...prev.colors.filter(c => c.issueId !== issue.id),
        {
          issueId: issue.id,
          hexValue: issue.currentValue,
          themeToken,
        },
      ],
    }))
  }
  
  const handleSpacingMapping = (issue: MappingIssue, tailwindClass: string) => {
    setMappings(prev => ({
      ...prev,
      spacing: [
        ...prev.spacing.filter(s => s.issueId !== issue.id),
        {
          issueId: issue.id,
          property: issue.title,
          tailwindClass,
        },
      ],
    }))
  }
  
  const handleVariantMapping = (issue: MappingIssue, values: string[]) => {
    // Extract variant key from title (e.g., "Missing variant: size" → "size")
    const variantKey = issue.title.replace('Missing variant: ', '')
    
    setMappings(prev => ({
      ...prev,
      variants: [
        ...prev.variants.filter(v => v.issueId !== issue.id),
        {
          issueId: issue.id,
          variantKey,
          values,
        },
      ],
    }))
  }
  
  const handleApply = () => {
    console.log('🎯 Apply button clicked!')
    console.log('Preview code length:', previewCode.length)
    console.log('Preview score:', previewScore)
    console.log('Mappings:', mappings)
    console.log('First 300 chars of preview code:', previewCode.substring(0, 300))
    onApply(previewCode, previewScore)
  }
  
  // Select which properties to show based on mode
  const displayedProperties = mode === 'issues' ? issues : allProperties
  
  const colorIssues = displayedProperties.filter(i => i.type === 'color')
  const spacingIssues = displayedProperties.filter(i => i.type === 'spacing')
  const variantIssues = displayedProperties.filter(i => i.type === 'variant')
  const typographyIssues = displayedProperties.filter(i => i.type === 'typography')
  
  const scoreImprovement = previewScore - validation.overallMatch
  
  return (
    <Card className="border-border">
      <CardHeader className="border-b">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">Map Spec to Your Theme</CardTitle>
            <CardDescription className="mt-1.5">
              Select theme options that best match your design specifications.
              {issues.length > 0 && ` Fix ${issues.length} ${issues.length === 1 ? 'issue' : 'issues'} below.`}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={mode === 'issues' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('issues')}
          >
            Fix Issues Only ({issues.filter(i => i.isIssue !== false).length})
          </Button>
          <Button
            variant={mode === 'advanced' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('advanced')}
          >
            Advanced: Edit All Properties ({allProperties.length})
          </Button>
        </div>
        
        {/* Score Preview */}
        <div className="flex items-center justify-between mt-4 p-4 bg-muted rounded-lg">
          <div>
            <span className="text-sm text-muted-foreground">Current Score:</span>
            <span className="ml-2 text-2xl font-bold">{validation.overallMatch}/100</span>
          </div>
          <div className="text-right">
            <span className="text-sm text-muted-foreground">Preview Score:</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {previewScore}/100
              </span>
              {scoreImprovement > 0 && (
                <span className="text-sm text-green-600 dark:text-green-400">
                  (+{scoreImprovement})
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {displayedProperties.length === 0 ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm font-medium">
              {mode === 'issues' ? 'All issues have been resolved!' : 'No properties found in spec'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Variant Issues */}
            {variantIssues.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Variant Options ({variantIssues.length})
                </h3>
                {variantIssues.map((issue) => (
                  <VariantMappingInput
                    key={issue.id}
                    title={issue.title}
                    specRequirement={issue.specRequirement}
                    options={issue.options || []}
                    selectedValues={
                      mappings.variants.find(v => v.issueId === issue.id)?.values || issue.options || []
                    }
                    onChange={(values) => handleVariantMapping(issue, values)}
                  />
                ))}
              </div>
            )}
            
            {/* Spacing Issues */}
            {spacingIssues.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Spacing & Sizing ({spacingIssues.length})
                </h3>
                {spacingIssues.map((issue) => (
                  <SpacingMappingInput
                    key={issue.id}
                    title={issue.title}
                    specRequirement={issue.specRequirement}
                    suggestedFix={issue.suggestedFix}
                    options={issue.options || []}
                    value={mappings.spacing.find(s => s.issueId === issue.id)?.tailwindClass || issue.suggestedFix}
                    onChange={(value) => handleSpacingMapping(issue, value)}
                  />
                ))}
              </div>
            )}
            
            {/* Color Issues */}
            {colorIssues.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Colors ({colorIssues.length})
                </h3>
                {colorIssues.map((issue) => (
                  <ColorMappingInput
                    key={issue.id}
                    title={issue.title}
                    specRequirement={issue.specRequirement}
                    currentValue={issue.currentValue}
                    options={issue.options || []}
                    value={mappings.colors.find(c => c.issueId === issue.id)?.themeToken || ''}
                    onChange={(value) => handleColorMapping(issue, value)}
                  />
                ))}
              </div>
            )}
            
            {/* Typography (Advanced Mode) */}
            {typographyIssues.length > 0 && mode === 'advanced' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Typography ({typographyIssues.length})
                </h3>
                {typographyIssues.map((issue) => (
                  <SpacingMappingInput
                    key={issue.id}
                    title={issue.title}
                    specRequirement={issue.specRequirement}
                    suggestedFix={issue.suggestedFix}
                    options={issue.options || []}
                    value={mappings.spacing.find(s => s.issueId === issue.id)?.tailwindClass || issue.suggestedFix}
                    onChange={(value) => handleSpacingMapping(issue, value)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 mt-6 border-t">
          <Button
            onClick={handleApply}
            className="flex-1"
            disabled={displayedProperties.length === 0}
          >
            {mode === 'advanced' ? 'Apply All Changes' : 'Apply Mappings & Update Code'}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
