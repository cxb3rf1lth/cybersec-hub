import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Palette, Keyboard } from '@/lib/phosphor-icons-wrapper';
import { useTheme, THEME_CONFIGS, ThemeColor } from '@/hooks/useTheme';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function ThemeSelector() {
  const { currentTheme, changeTheme, availableThemes } = useTheme();

  const handleThemeChange = (themeId: ThemeColor) => {
    changeTheme(themeId);
    toast.success(`Theme changed to ${THEME_CONFIGS[themeId].name}`, {
      description: 'Your cyberpunk interface has been updated with the new color scheme.',
      duration: 2000
    });
  };

  const quickSwitchToNextTheme = () => {
    const themes: ThemeColor[] = ['red', 'purple', 'blue', 'green'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    handleThemeChange(themes[nextIndex]);
  };

  // Keyboard shortcuts for theme switching
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey) {
        const themes: ThemeColor[] = ['red', 'purple', 'blue', 'green'];
        switch (event.key) {
          case 'R':
            event.preventDefault();
            handleThemeChange('red');
            break;
          case 'P':
            event.preventDefault();
            handleThemeChange('purple');
            break;
          case 'B':
            event.preventDefault();
            handleThemeChange('blue');
            break;
          case 'G':
            event.preventDefault();
            handleThemeChange('green');
            break;
          case 'T':
            event.preventDefault();
            quickSwitchToNextTheme();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentTheme]);

  return (
    <Card className="panel-dark">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Theme Color Scheme
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose your preferred cyberpunk color scheme. Changes apply instantly across the entire interface.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={quickSwitchToNextTheme}
            className="hover-border-flow"
            title="Quick switch to next theme (Ctrl+Shift+T)"
          >
            <Keyboard className="w-4 h-4 mr-2" />
            Quick Switch
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {availableThemes.map((theme) => (
            <div
              key={theme.id}
              className={`
                relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-500
                hover-border-flow group
                ${currentTheme === theme.id 
                  ? 'border-primary bg-primary/10 shadow-lg' 
                  : 'border-border bg-card/50 hover:bg-card/70'
                }
              `}
              onClick={() => handleThemeChange(theme.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {theme.name}
                </h3>
                {currentTheme === theme.id && (
                  <div className="flex items-center gap-1">
                    <Check className="w-5 h-5 text-primary animate-in fade-in duration-300" weight="bold" />
                    <Badge variant="outline" className="text-xs border-primary text-primary">
                      Active
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Theme Preview */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-6 h-6 rounded-full border-2 border-border transition-transform group-hover:scale-110"
                  style={{ 
                    backgroundColor: theme.colors.primary,
                    boxShadow: `0 0 12px ${theme.colors.primary}40`
                  }}
                />
                <div
                  className="w-6 h-6 rounded-full border-2 border-border transition-transform group-hover:scale-110"
                  style={{ 
                    backgroundColor: theme.colors.accent,
                    boxShadow: `0 0 12px ${theme.colors.accent}40`
                  }}
                />
                <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                  <div
                    className="h-full w-3/4 rounded transition-all duration-500 group-hover:w-full"
                    style={{ 
                      backgroundColor: theme.colors.primary,
                      boxShadow: `0 0 8px ${theme.colors.primary}60`
                    }}
                  />
                </div>
              </div>
              
              {/* Sample UI Elements */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="text-xs h-6 px-2 transition-all hover:scale-105"
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: theme.colors.primaryForeground,
                      border: 'none',
                      boxShadow: `0 0 8px ${theme.colors.primary}50`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleThemeChange(theme.id);
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
                
                <div className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  Experience the power of {theme.name.toLowerCase()} cyberpunk styling
                </div>
              </div>
              
              {currentTheme === theme.id && (
                <div className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden">
                  <div
                    className="absolute inset-0 rounded-lg opacity-20 animate-pulse"
                    style={{
                      background: `linear-gradient(45deg, ${theme.colors.primary}40, transparent, ${theme.colors.accent}30)`
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-lg opacity-10"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${theme.colors.accent}50, transparent 70%)`
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Live Preview Section */}
        <div className="mt-6 p-4 border border-border rounded-lg bg-card/30">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live Preview: {THEME_CONFIGS[currentTheme].name}
          </h4>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" className="hover-red-glow">
              Primary Action
            </Button>
            <Button size="sm" variant="outline" className="hover-border-flow">
              Secondary
            </Button>
            <Badge className="bg-accent text-accent-foreground">
              Status Badge
            </Badge>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary matrix-pulse" />
              <span className="text-xs text-muted-foreground">Active indicator</span>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-border">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
            <div>
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Real-time updates:</strong> Theme changes apply instantly across the entire application including all cyberpunk effects, animations, glows, and interactive elements.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                <strong className="text-foreground">Persistent setting:</strong> Your theme preference is automatically saved and will be restored when you return.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}