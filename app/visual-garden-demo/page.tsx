'use client'

import React, { useState, useEffect } from 'react';
import GardenCanvas from '@/components/visual-garden-designer/GardenCanvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

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
      setSaveMessage('Plant bed positions saved successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
      
    } catch (error) {
      setErrorMessage('Failed to save plant bed positions. Please try again.');
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
      setSaveMessage('Canvas configuration updated successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
      
    } catch (error) {
      setErrorMessage('Failed to update canvas configuration. Please try again.');
      console.error('Canvas config update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===================================================================
  // RENDER
  // ===================================================================

  return (
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
              <span>Saving...</span>
            </div>
          </Card>
        </div>
      )}

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
            <CardTitle className="text-lg">⚡ Real-time</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Alle wijzigingen worden in real-time getoond. Opslaan met Ctrl/Cmd + S.
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
              <Badge variant="outline" className="mb-1">Raster</Badge>
              <div className="text-muted-foreground">{canvasConfig.grid_size}m</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Canvas */}
      <Card className="h-[800px]">
        <GardenCanvas
          garden={mockGarden}
          plantBeds={plantBeds}
          canvasConfig={canvasConfig}
          onSave={handleSave}
          onCanvasConfigChange={handleCanvasConfigChange}
        />
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
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Toetsenbord Shortcuts</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <kbd>Ctrl/Cmd + S</kbd> - Opslaan</li>
                <li>• <kbd>Ctrl/Cmd + Plus</kbd> - Inzoomen</li>
                <li>• <kbd>Ctrl/Cmd + Min</kbd> - Uitzoomen</li>
                <li>• <kbd>Ctrl/Cmd + 0</kbd> - Zoom reset</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}