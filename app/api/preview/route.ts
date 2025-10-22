import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-helpers'

/**
 * Preview API endpoint for rendering component code in an iframe
 * This endpoint generates a complete HTML page that can be safely rendered in an iframe
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    // Check if request has a body
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    const text = await req.text()
    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'Request body is empty' },
        { status: 400 }
      )
    }

    const body = JSON.parse(text)
    const { code, variants, theme } = body

    console.log('Preview API - Received body:', { hasCode: !!code, codeLength: code?.length, variants, theme })

    if (!code) {
      console.error('Preview API - Missing code field. Body keys:', Object.keys(body))
      return NextResponse.json(
        { error: 'Missing required field: code', receivedKeys: Object.keys(body) },
        { status: 400 }
      )
    }

    // Generate a complete HTML page with the component
    const html = generatePreviewHTML(code, variants, theme)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https://unpkg.com https://cdn.tailwindcss.com;",
      },
    })
  } catch (error) {
    console.error('Preview generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Generate a complete HTML page with React and the component code
 */
function generatePreviewHTML(componentCode: string, variants: Record<string, string[]> = {}, theme?: { colors: Record<string, string> }) {
  // Extract component name from code
  const componentNameMatch = componentCode.match(/export\s+(?:default\s+)?(?:function|const)\s+(\w+)/)
  const componentName = componentNameMatch ? componentNameMatch[1] : 'Component'

  // Generate theme CSS variables
  const themeVars = theme?.colors
    ? Object.entries(theme.colors)
        .map(([key, value]) => `--${key}: ${value};`)
        .join('\n    ')
    : ''

  // Strip import statements and prepare code for browser
  const cleanedCode = stripImportsFromCode(componentCode)

  // Generate demo instances based on variants
  const demoInstances = generateDemoInstances(componentName, variants)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            border: "hsl(var(--border))",
            input: "hsl(var(--input))",
            ring: "hsl(var(--ring))",
            background: "hsl(var(--background))",
            foreground: "hsl(var(--foreground))",
            primary: {
              DEFAULT: "hsl(var(--primary))",
              foreground: "hsl(var(--primary-foreground))",
            },
            secondary: {
              DEFAULT: "hsl(var(--secondary))",
              foreground: "hsl(var(--secondary-foreground))",
            },
            destructive: {
              DEFAULT: "hsl(var(--destructive))",
              foreground: "hsl(var(--destructive-foreground))",
            },
            muted: {
              DEFAULT: "hsl(var(--muted))",
              foreground: "hsl(var(--muted-foreground))",
            },
            accent: {
              DEFAULT: "hsl(var(--accent))",
              foreground: "hsl(var(--accent-foreground))",
            },
            popover: {
              DEFAULT: "hsl(var(--popover))",
              foreground: "hsl(var(--popover-foreground))",
            },
            card: {
              DEFAULT: "hsl(var(--card))",
              foreground: "hsl(var(--card-foreground))",
            },
          },
          borderRadius: {
            lg: "var(--radius)",
            md: "calc(var(--radius) - 2px)",
            sm: "calc(var(--radius) - 4px)",
          },
        },
      },
    }
  </script>
  <style>
    :root {
      ${themeVars || `--background: 0 0% 100%;
      --foreground: 240 10% 3.9%;
      --primary: 240 5.9% 10%;
      --primary-foreground: 0 0% 98%;
      --secondary: 240 4.8% 95.9%;
      --secondary-foreground: 240 5.9% 10%;
      --muted: 240 4.8% 95.9%;
      --muted-foreground: 240 3.8% 46.1%;
      --accent: 240 4.8% 95.9%;
      --accent-foreground: 240 5.9% 10%;
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 0 0% 98%;
      --border: 240 5.9% 90%;
      --input: 240 5.9% 90%;
      --ring: 240 5.9% 10%;
      --radius: 0.5rem;`}
    }
    
    body {
      margin: 0;
      padding: 2rem;
      background-color: hsl(var(--background));
      color: hsl(var(--foreground));
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    .preview-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .preview-section {
      border: 1px solid hsl(var(--border));
      border-radius: var(--radius);
      padding: 1.5rem;
      background-color: hsl(var(--card));
    }
    
    .preview-section h3 {
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: hsl(var(--muted-foreground));
    }
    
    .preview-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel">
    const { useState, useEffect, forwardRef } = React;
    
    // Utility function for className merging
    function cn(...classes) {
      return classes.filter(Boolean).join(' ');
    }
    
    // cva mock for class-variance-authority
    function cva(base, config) {
      return function(props = {}) {
        let classes = base;
        
        if (config?.variants) {
          Object.entries(props).forEach(([key, value]) => {
            if (config.variants[key] && config.variants[key][value]) {
              classes += ' ' + config.variants[key][value];
            }
          });
        }
        
        if (config?.defaultVariants) {
          Object.entries(config.defaultVariants).forEach(([key, value]) => {
            if (!props[key] && config.variants[key] && config.variants[key][value]) {
              classes += ' ' + config.variants[key][value];
            }
          });
        }
        
        if (props.className) {
          classes += ' ' + props.className;
        }
        
        return classes;
      };
    }
    
    // Component code (imports stripped, using mocked dependencies)
    ${cleanedCode}
    
    // Demo App
    function PreviewApp() {
      return (
        <div className="preview-container">
          ${demoInstances}
        </div>
      );
    }
    
    // Render
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<PreviewApp />);
  </script>
</body>
</html>`
}

/**
 * Generate demo instances of the component based on variants
 */
function generateDemoInstances(componentName: string, variants: Record<string, string[]>): string {
  const sections: string[] = []

  // Generate variant sections
  if (variants.type && variants.type.length > 0) {
    const items = variants.type
      .filter((v: string) => !['enabled', 'hover', 'focused', 'pressed', 'disabled'].includes(v))
      .map((variant: string) => `<${componentName} variant="${variant}">${variant}</${componentName}>`)
      .join('\n            ')

    sections.push(`
          <div className="preview-section">
            <h3>Variants</h3>
            <div className="preview-grid">
              ${items}
            </div>
          </div>`)
  }

  // Generate size sections
  if (variants.size && variants.size.length > 0) {
    const items = variants.size
      .map((size: string) => `<${componentName} size="${size}">${size}</${componentName}>`)
      .join('\n            ')

    sections.push(`
          <div className="preview-section">
            <h3>Sizes</h3>
            <div className="preview-grid">
              ${items}
            </div>
          </div>`)
  }

  // Generate state sections
  if (variants.state && variants.state.some((s: string) => ['disabled'].includes(s))) {
    sections.push(`
          <div className="preview-section">
            <h3>States</h3>
            <div className="preview-grid">
              <${componentName}>Default</${componentName}>
              <${componentName} disabled>Disabled</${componentName}>
            </div>
          </div>`)
  }

  // Generate icon sections if applicable
  if (variants.icon && variants.icon.some((i: string) => i === 'left' || i === 'right')) {
    const leftIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>`
    const rightIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>`

    const items: string[] = []
    if (variants.icon.includes('left')) {
      items.push(`<${componentName}>${leftIcon} Left Icon</${componentName}>`)
    }
    if (variants.icon.includes('right')) {
      items.push(`<${componentName}>Right Icon ${rightIcon}</${componentName}>`)
    }

    sections.push(`
          <div className="preview-section">
            <h3>With Icons</h3>
            <div className="preview-grid">
              ${items.join('\n            ')}
            </div>
          </div>`)
  }

  // Default preview if no variants
  if (sections.length === 0) {
    sections.push(`
          <div className="preview-section">
            <h3>Preview</h3>
            <div className="preview-grid">
              <${componentName}>Default</${componentName}>
            </div>
          </div>`)
  }

  return sections.join('\n')
}

/**
 * Strip import statements and TypeScript types from component code
 * Makes the code compatible with Babel in the browser
 */
function stripImportsFromCode(code: string): string {
  let cleaned = code

  // Remove all import statements (including multiline)
  cleaned = cleaned.replace(/import\s+(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"][^'"]*['"];?/g, (match) => {
    return `// ${match.trim().replace(/\n/g, ' ')}`
  })

  // Remove interface and type definitions (comment them out)
  cleaned = cleaned.replace(/(export\s+)?interface\s+\w+[\s\S]*?\{[\s\S]*?\n\}/g, (match) => {
    return `/* ${match} */`
  })

  cleaned = cleaned.replace(/(export\s+)?type\s+\w+\s*=[\s\S]*?;/g, (match) => {
    return `// ${match.trim()}`
  })

  // Remove type annotations from React.forwardRef
  cleaned = cleaned.replace(
    /React\.forwardRef<([^,]+),\s*([^>]+)>/g,
    'React.forwardRef'
  )

  // Remove type annotations from function parameters
  cleaned = cleaned.replace(/\(\s*\{([^}]+)\}\s*:\s*[^)]+\)/g, (match) => {
    // Extract just the parameter names
    const paramsMatch = match.match(/\{([^}]+)\}/)
    if (paramsMatch) {
      return `({ ${paramsMatch[1]} })`
    }
    return match
  })

  // Remove return type annotations
  cleaned = cleaned.replace(/\)\s*:\s*[^{]+{/g, ') {')

  // Remove variable type annotations
  cleaned = cleaned.replace(/const\s+(\w+)\s*:\s*[^=]+=\s*/g, 'const $1 = ')

  // Remove 'as' type assertions
  cleaned = cleaned.replace(/\s+as\s+\w+/g, '')

  // Clean up typeof in cva calls (keep the typeof, just remove VariantProps wrapper)
  // This is already handled in the code since cva is mocked

  // Clean up multiple spaces and newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
  cleaned = cleaned.replace(/\s{2,}/g, ' ')

  return cleaned
}

