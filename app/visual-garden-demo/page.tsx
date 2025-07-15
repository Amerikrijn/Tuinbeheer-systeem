'use client'

import React, { useState, useEffect } from 'react';
import GardenCanvas from '@/components/visual-garden-designer/GardenCanvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Maximize, 
  Minimize, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Save,
  Settings,
  Move,
  Eye
} from 'lucide-react';

// ===================================================================
// MOCK DATA (Would come from API in production)
// ===================================================================

const mockGarden = {
  id: 'demo-garden-1',
  name: 'Demo Tuin',
  description: 'Een voorbeeldtuin voor het testen van de Visual Garden Designer'
};

const mockPlantBeds = [
  {
    id: 'bed-1',
    garden_id: 'demo-garden-1',
    name: 'Groentevak A1',
    description: 'Hoofdgroentevak met seizoensgroenten',
    size_m2: 6,
    position_x: 2,
    position_y: 3,
    visual_width: 3,
    visual_height: 2,
    color_code: '#22c55e',
    rotation: 0,
    z_index: 1
  },
  {
    id: 'bed-2',
    garden_id: 'demo-garden-1',
    name: 'Kruidenvak B1',
    description: 'Kruidentuin met diverse keukenkruiden',
    size_m2: 4,
    position_x: 6,
    position_y: 2,
    visual_width: 2,
    visual_height: 2,
    color_code: '#8b5cf6',
    rotation: 0,
    z_index: 1
  },
  {
    id: 'bed-3',
    garden_id: 'demo-garden-1',
    name: 'Bloemenbed C1',
    description: 'Kleurrijke bloemenweide',
    size_m2: 8,
    position_x: 10,
    position_y: 4,
    visual_width: 4,
    visual_height: 2,
    color_code: '#f59e0b',
    rotation: 0,
    z_index: 1
  },
  {
    id: 'bed-4',
    garden_id: 'demo-garden-1',
    name: 'Fruitbomen D1',
    description: 'Kleine fruitbomen en struiken',
    size_m2: 12,
    position_x: 3,
    position_y: 8,
    visual_width: 3,
    visual_height: 4,
    color_code: '#dc2626',
    rotation: 0,
    z_index: 1
  }
];

const mockCanvasConfig = {
  canvas_width: 20,
  canvas_height: 15,
  grid_size: 1,
  default_zoom: 1,
  show_grid: true,
  snap_to_grid: true,
  background_color: '#f8fafc'
};

// ===================================================================
// DEMO PAGE COMPONENT
// ===================================================================

export default function VisualGardenDemoPage() {
  const [plantBeds, setPlantBeds] = useState(mockPlantBeds);
  const [canvasConfig, setCanvasConfig] = useState(mockCanvasConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

  // ===================================================================
  // SAVE HANDLERS
  // ===================================================================

  const handleSave = async (updatedPlantBeds: typeof plantBeds) => {
    setIsLoading(true);
    setSaveMessage(null);
    setErrorMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, this would be an API call:
      // await fetch('/api/gardens/demo-garden-1/plant-beds/positions', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ positions: updatedPlantBeds })
      // });

      setPlantBeds(updatedPlantBeds);
      setSaveMessage('Plantvak posities succesvol opgeslagen!');
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
      
    } catch (error) {
      setErrorMessage('Fout bij het opslaan van plantvak posities. Probeer opnieuw.');
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCanvasConfigChange = async (configUpdates: Partial<typeof canvasConfig>) => {
    setIsLoading(true);
    setSaveMessage(null);
    setErrorMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In production, this would be an API call:
      // await fetch('/api/gardens/demo-garden-1/canvas-config', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(configUpdates)
      // });

      setCanvasConfig(prev => ({ ...prev, ...configUpdates }));
      setSaveMessage('Canvas configuratie succesvol bijgewerkt!');
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
      
    } catch (error) {
      setErrorMessage('Fout bij het bijwerken van canvas configuratie. Probeer opnieuw.');
      console.error('Canvas config update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===================================================================
  // ZOOM AND FULLSCREEN HANDLERS
  // ===================================================================

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const handleResetZoom = () => setZoom(1);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // ===================================================================
  // RENDER
  // ===================================================================

  const renderFullscreen = () => (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Fullscreen Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Eye className="h-6 w-6 text-green-600" />
                {mockGarden.name} - Volledig Scherm
              </h1>
              <p className="text-gray-600">Visuele weergave van plantvakken op schaal</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleZoomOut}
                className="bg-white/80"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetZoom}
                className="bg-white/80"
              >
                {Math.round(zoom * 100)}%
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleZoomIn}
                className="bg-white/80"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button 
                onClick={() => handleSave(plantBeds)}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Opslaan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Opslaan
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={toggleFullscreen}
                className="bg-white/80"
              >
                <Minimize className="h-4 w-4 mr-2" />
                Verlaten
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {saveMessage && (
        <Alert className="mx-4 mt-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{saveMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mx-4 mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Fullscreen Canvas */}
      <div className="h-full p-4" style={{ height: 'calc(100vh - 120px)' }}>
        <div 
          className="h-full bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'top left'
          }}
        >
          <GardenCanvas
            garden={mockGarden}
            plantBeds={plantBeds}
            canvasConfig={canvasConfig}
            onSave={handleSave}
            onCanvasConfigChange={handleCanvasConfigChange}
            isFullscreen={true}
          />
        </div>
      </div>

      {/* Fullscreen Instructions */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="container mx-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Move className="h-4 w-4 text-blue-600" />
              <span>Sleep plantvakken om ze te verplaatsen</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-purple-600" />
              <span>Plantvakken zijn op schaal weergegeven</span>
            </div>
            <div className="flex items-center gap-2">
              <ZoomIn className="h-4 w-4 text-orange-600" />
              <span>Zoom in/uit voor detail werk</span>
            </div>
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4 text-green-600" />
              <span>Sla wijzigingen op met Ctrl+S</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNormal = () => (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Visual Garden Designer - Demo</h1>
        <p className="text-muted-foreground">
          Interactieve demo van de Visual Garden Designer functionaliteit. 
          Sleep plantvakken rond, zoom in/uit en pas configuratie aan.
        </p>
      </div>

      {/* Status Messages */}
      {saveMessage && (
        <Alert className="mb-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{saveMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Opslaan...</span>
            </div>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetZoom}
          >
            {Math.round(zoom * 100)}%
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => handleSave(plantBeds)}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Opslaan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Opslaan
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={toggleFullscreen}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Maximize className="h-4 w-4 mr-2" />
            Volledig Scherm
          </Button>
        </div>
      </div>

      {/* Feature Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">🎯 Drag & Drop</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Sleep plantvakken rond op het canvas. Automatisch snappen naar raster indien ingeschakeld.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">🔍 Zoom & Pan</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Zoom in/uit voor detail werk. Toetsenbord shortcuts: Ctrl/Cmd + Plus/Min/0
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">📺 Volledig Scherm</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Bekijk je tuin op volledig scherm met alle plantvakken op schaal weergegeven.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Demo Data Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">📊 Demo Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <Badge variant="outline" className="mb-1">Tuin</Badge>
              <div className="text-muted-foreground">{mockGarden.name}</div>
            </div>
            <div>
              <Badge variant="outline" className="mb-1">Canvas</Badge>
              <div className="text-muted-foreground">{canvasConfig.canvas_width}m × {canvasConfig.canvas_height}m</div>
            </div>
            <div>
              <Badge variant="outline" className="mb-1">Plantvakken</Badge>
              <div className="text-muted-foreground">{plantBeds.length} vakken</div>
            </div>
            <div>
              <Badge variant="outline" className="mb-1">Zoom</Badge>
              <div className="text-muted-foreground">{Math.round(zoom * 100)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Canvas */}
      <Card className="h-[600px]">
        <div 
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            height: '100%'
          }}
        >
          <GardenCanvas
            garden={mockGarden}
            plantBeds={plantBeds}
            canvasConfig={canvasConfig}
            onSave={handleSave}
            onCanvasConfigChange={handleCanvasConfigChange}
            isFullscreen={false}
          />
        </div>
      </Card>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">🎮 Instructies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Muis Bediening</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Klik en sleep om plantvakken te verplaatsen</li>
                <li>• Klik op een plantvak om het te selecteren</li>
                <li>• Scroll om in/uit te zoomen</li>
                <li>• Plantvakken zijn verplaatsbaar binnen het canvas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Toetsenbord Shortcuts</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <kbd>Ctrl/Cmd + S</kbd> - Opslaan</li>
                <li>• <kbd>Ctrl/Cmd + Plus</kbd> - Inzoomen</li>
                <li>• <kbd>Ctrl/Cmd + Min</kbd> - Uitzoomen</li>
                <li>• <kbd>Ctrl/Cmd + 0</kbd> - Zoom reset</li>
                <li>• <kbd>F11</kbd> - Volledig scherm</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return isFullscreen ? renderFullscreen() : renderNormal();
}