import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from '@phosphor-icons/react'
import { useTheme, THEME_CONFIGS, ThemeColor } from '@/hooks/useTheme'

export function ThemeSelector() {
  const { currentTheme, changeTheme, availableThemes } = useTheme()

  const handleThemeChange = (themeId: ThemeColor) => {
    changeTheme(themeId)
  }

  return (
    <Card className="panel-dark">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Theme Color Scheme
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose your preferred cyberpunk color scheme
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {availableThemes.map((theme) => (
            <div
              key={theme.id}
              className={`
                relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-300
                hover-border-flow
                ${currentTheme === theme.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-card/50'
                }
              `}
              onClick={() => handleThemeChange(theme.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground">{theme.name}</h3>
                {currentTheme === theme.id && (
                  <Check className="w-5 h-5 text-primary" weight="bold" />
                )}
              </div>
              
              {/* Theme Preview */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-6 h-6 rounded-full border-2 border-border"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div
                  className="w-6 h-6 rounded-full border-2 border-border"
                  style={{ backgroundColor: theme.colors.accent }}
                />
                <div className="flex-1 h-2 bg-muted rounded">
                  <div
                    className="h-full w-3/4 rounded"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                </div>
              </div>
              
              {/* Sample UI Elements */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="text-xs h-6 px-2"
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: theme.colors.primaryForeground,
                      border: 'none'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleThemeChange(theme.id)
                    }}
                  >
                    Primary
                  </Button>
                  <Badge
                    variant="outline"
                    className="text-xs h-6 px-2"
                    style={{
                      borderColor: theme.colors.accent,
                      color: theme.colors.accent,
                      backgroundColor: 'transparent'
                    }}
                  >
                    Accent
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Sample UI with {theme.name.toLowerCase()} styling
                </div>
              </div>
              
              {currentTheme === theme.id && (
                <div className="absolute inset-0 rounded-lg pointer-events-none">
                  <div
                    className="absolute inset-0 rounded-lg opacity-20"
                    style={{
                      background: `linear-gradient(45deg, ${theme.colors.primary}20, transparent)`
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Theme changes apply instantly across the entire application. All cyberpunk effects 
            and animations will adapt to your selected color scheme.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}