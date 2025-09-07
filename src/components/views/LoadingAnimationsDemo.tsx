import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  HexSpinner, 
  MatrixDots, 
  CyberProgress, 
  HexGrid, 
  ScanLine, 
  BinaryRain, 
  CyberpunkLoader 
} from '@/components/ui/loading-animations';
import { Play, Pause } from '@phosphor-icons/react';

export function LoadingAnimationsDemo() {
  const [showFullLoader, setShowFullLoader] = useState(false);
  const [progress, setProgress] = useState(45);
  const [isAnimating, setIsAnimating] = useState(true);

  const toggleProgress = () => {
    if (isAnimating) {
      setProgress(prev => prev >= 90 ? 10 : prev + 20);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground terminal-cursor">
          Cyberpunk Loading Animations
        </h1>
        <p className="text-muted-foreground">
          Immersive loading experiences with hexagonal patterns and red glows
        </p>
      </div>

      {/* Controls */}
      <Card className="bg-card/50 backdrop-blur-sm border-border hover-border-flow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAnimating(!isAnimating)}
              className="w-fit"
            >
              {isAnimating ? <Pause size={16} /> : <Play size={16} />}
              {isAnimating ? 'Pause' : 'Play'} Animations
            </Button>
          </CardTitle>
          <CardDescription>
            Control animation playback and test full-screen loader
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => setShowFullLoader(true)}
              className="hover-red-glow"
            >
              Show Full Screen Loader
            </Button>
            <Button
              onClick={toggleProgress}
              variant="outline"
              className="hover-border-flow"
            >
              Update Progress ({progress}%)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Spinner Variations */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle>Hexagonal Spinners</CardTitle>
          <CardDescription>
            Rotating hexagonal patterns with cyberpunk red glow effects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8 justify-center py-8">
            <div className="text-center space-y-2">
              <HexSpinner size="sm" />
              <p className="text-xs text-muted-foreground">Small</p>
            </div>
            <div className="text-center space-y-2">
              <HexSpinner size="md" />
              <p className="text-xs text-muted-foreground">Medium</p>
            </div>
            <div className="text-center space-y-2">
              <HexSpinner size="lg" />
              <p className="text-xs text-muted-foreground">Large</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matrix Dots */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle>Matrix Dots</CardTitle>
          <CardDescription>
            Pulsing dots with matrix-style timing and red glow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8 justify-center py-8">
            <div className="text-center space-y-2">
              <MatrixDots size="sm" />
              <p className="text-xs text-muted-foreground">Small</p>
            </div>
            <div className="text-center space-y-2">
              <MatrixDots size="md" />
              <p className="text-xs text-muted-foreground">Medium</p>
            </div>
            <div className="text-center space-y-2">
              <MatrixDots size="lg" />
              <p className="text-xs text-muted-foreground">Large</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bars */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle>Cyberpunk Progress</CardTitle>
          <CardDescription>
            Hexagonal progress indicators with animated red glow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">With percentage:</p>
              <CyberProgress progress={progress} showPercentage={true} />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Without percentage:</p>
              <CyberProgress progress={progress} showPercentage={false} />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Loading state:</p>
              <CyberProgress progress={25} showPercentage={true} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scanning Line */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle>Scan Line Effect</CardTitle>
          <CardDescription>
            Sweeping scan line for data processing visualization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="text-center space-y-4">
              <ScanLine />
              <p className="text-xs text-muted-foreground font-mono">
                Scanning network protocols...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Binary Rain */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle>Binary Rain</CardTitle>
          <CardDescription>
            Falling binary code animation with cyberpunk styling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="relative">
              <BinaryRain />
              <div className="text-center mt-4">
                <p className="text-xs text-muted-foreground font-mono">
                  Decrypting data streams...
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hexagonal Grid Overlay Demo */}
      <Card className="bg-card/50 backdrop-blur-sm border-border relative overflow-hidden">
        <HexGrid />
        <CardHeader>
          <CardTitle>Hexagonal Grid Overlay</CardTitle>
          <CardDescription>
            Animated hexagonal grid pattern for background effects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-muted-foreground font-mono">
              Background grid pattern with pulsing hexagons
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Perfect for overlay effects and loading screens
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Full Screen Loader */}
      <CyberpunkLoader 
        isVisible={showFullLoader}
        message="Initializing cybersecurity protocols..."
      />

      {/* Auto-dismiss full screen loader */}
      {showFullLoader && (
        <div className="hidden">
          {setTimeout(() => setShowFullLoader(false), 4000)}
        </div>
      )}
    </div>
  );
}