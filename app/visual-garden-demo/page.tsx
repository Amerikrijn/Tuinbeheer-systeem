'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ModernPageWrapper } from '@/components/modern-page-wrapper';
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
  Eye,
  Palette,
  TreePine,
  Flower,
  Grid,
  Layout
} from 'lucide-react';

// Mock data for visual garden
const mockGarden = {
  id: 'demo-garden-1',
  name: 'Demo Tuin',
  description: 'Een voorbeeldtuin voor het testen van de Visual Garden Designer',
  width: 10,
  height: 8
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
    z_index: 1,
    plants: [
      { id: '1', name: 'Tomaten', type: 'Groente' },
      { id: '2', name: 'Basilicum', type: 'Kruid' }
    ]
  },
  {
    id: 'bed-2',
    garden_id: 'demo-garden-1',
    name: 'Bloemenvak B1',
    description: 'Kleurrijke bloemen voor het voorjaar',
    size_m2: 4,
    position_x: 6,
    position_y: 2,
    visual_width: 2,
    visual_height: 2,
    color_code: '#3b82f6',
    rotation: 0,
    z_index: 1,
    plants: [
      { id: '3', name: 'Tulpen', type: 'Bol' },
      { id: '4', name: 'Narcissen', type: 'Bol' }
    ]
  },
  {
    id: 'bed-3',
    garden_id: 'demo-garden-1',
    name: 'Kruidentuin C1',
    description: 'Verse kruiden voor in de keuken',
    size_m2: 3,
    position_x: 1,
    position_y: 6,
    visual_width: 2,
    visual_height: 1.5,
    color_code: '#8b5cf6',
    rotation: 0,
    z_index: 1,
    plants: [
      { id: '5', name: 'Peterselie', type: 'Kruid' },
      { id: '6', name: 'Bieslook', type: 'Kruid' }
    ]
  }
];

export default function VisualGardenDemo() {
  const [selectedBed, setSelectedBed] = useState(null);
  const [viewMode, setViewMode] = useState('design'); // 'design' or 'preview'
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  const handleBedClick = (bed) => {
    setSelectedBed(bed);
  };

  const handleSave = () => {
    setIsLoading(true);
    // Mock save operation
    setTimeout(() => {
      setIsLoading(false);
      alert('Tuin opgeslagen!');
    }, 1000);
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setSelectedBed(null);
  };

  return (
    <ModernPageWrapper
      title="Visual Garden Designer"
      subtitle={`Ontwerp je tuin visueel - ${mockGarden.name}`}
      maxWidth="full"
      headerActions={
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Demo Mode
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setViewMode(viewMode === 'design' ? 'preview' : 'design')}
          >
            {viewMode === 'design' ? <Eye className="h-4 w-4 mr-1" /> : <Layout className="h-4 w-4 mr-1" />}
            {viewMode === 'design' ? 'Preview' : 'Design'}
          </Button>
          <Button 
            size="sm" 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Opslaan
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-full">
        {/* Main Canvas Area */}
        <div className="xl:col-span-3 space-y-4">
          {/* Toolbar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
                    <Grid className="h-4 w-4 mr-1" />
                    {showGrid ? 'Verberg' : 'Toon'} Grid
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600 min-w-[60px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{mockGarden.width}m × {mockGarden.height}m</Badge>
                  <Badge variant="outline">{mockPlantBeds.length} plantvakken</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Garden Canvas */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5 text-green-600" />
                {mockGarden.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-green-50">
                <div 
                  className="relative bg-gradient-to-br from-green-100 to-green-200"
                  style={{
                    width: `${mockGarden.width * 40 * zoom}px`,
                    height: `${mockGarden.height * 40 * zoom}px`,
                    minWidth: '600px',
                    minHeight: '400px'
                  }}
                >
                  {/* Grid overlay */}
                  {showGrid && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: `
                          linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: `${40 * zoom}px ${40 * zoom}px`
                      }}
                    />
                  )}

                  {/* Plant beds */}
                  {mockPlantBeds.map((bed) => (
                    <div
                      key={bed.id}
                      className={`absolute border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedBed?.id === bed.id 
                          ? 'border-blue-500 shadow-lg z-10' 
                          : 'border-gray-400 hover:border-gray-600'
                      }`}
                      style={{
                        left: `${bed.position_x * 40 * zoom}px`,
                        top: `${bed.position_y * 40 * zoom}px`,
                        width: `${bed.visual_width * 40 * zoom}px`,
                        height: `${bed.visual_height * 40 * zoom}px`,
                        backgroundColor: bed.color_code,
                        opacity: 0.7,
                        transform: `rotate(${bed.rotation}deg)`,
                        zIndex: bed.z_index
                      }}
                      onClick={() => handleBedClick(bed)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center p-1">
                        <div className="text-center">
                          <div className="text-xs font-medium text-white bg-black bg-opacity-50 px-1 py-0.5 rounded">
                            {bed.name}
                          </div>
                          {bed.plants && bed.plants.length > 0 && (
                            <div className="text-xs text-white bg-black bg-opacity-30 px-1 mt-1 rounded">
                              {bed.plants.length} planten
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Automatisch opgeslagen</span>
                  </div>
                  <div>Totale oppervlakte: {mockGarden.width * mockGarden.height} m²</div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedBed && (
                    <Badge variant="outline">
                      {selectedBed.name} geselecteerd
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Properties */}
        <div className="space-y-4">
          {/* Selected Bed Properties */}
          {selectedBed ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flower className="h-5 w-5 text-purple-600" />
                  {selectedBed.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Beschrijving:</span>
                    <p className="text-gray-600 mt-1">{selectedBed.description}</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Grootte:</span>
                    <p className="text-gray-600">{selectedBed.size_m2} m²</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Positie:</span>
                    <p className="text-gray-600">X: {selectedBed.position_x}m, Y: {selectedBed.position_y}m</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Afmetingen:</span>
                    <p className="text-gray-600">{selectedBed.visual_width}m × {selectedBed.visual_height}m</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Kleur:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: selectedBed.color_code }}
                      />
                      <span className="text-gray-600">{selectedBed.color_code}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Planten ({selectedBed.plants?.length || 0})</h4>
                  {selectedBed.plants && selectedBed.plants.length > 0 ? (
                    <div className="space-y-1">
                      {selectedBed.plants.map((plant) => (
                        <div key={plant.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Flower className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="text-sm font-medium">{plant.name}</div>
                            <div className="text-xs text-gray-500">{plant.type}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Nog geen planten toegevoegd</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Eigenschappen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm">
                  Selecteer een plantvak om de eigenschappen te bekijken en te bewerken.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Garden Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5 text-green-600" />
                Tuin Informatie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">Naam:</span>
                <p className="text-gray-600">{mockGarden.name}</p>
              </div>
              <div className="text-sm">
                <span className="font-medium">Beschrijving:</span>
                <p className="text-gray-600">{mockGarden.description}</p>
              </div>
              <div className="text-sm">
                <span className="font-medium">Afmetingen:</span>
                <p className="text-gray-600">{mockGarden.width}m × {mockGarden.height}m</p>
              </div>
              <div className="text-sm">
                <span className="font-medium">Totale oppervlakte:</span>
                <p className="text-gray-600">{mockGarden.width * mockGarden.height} m²</p>
              </div>
              <div className="text-sm">
                <span className="font-medium">Plantvakken:</span>
                <p className="text-gray-600">{mockPlantBeds.length} vakken</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Snelle Acties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Move className="h-4 w-4 mr-2" />
                Verplaats Mode
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Palette className="h-4 w-4 mr-2" />
                Verander Kleuren
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Maximize className="h-4 w-4 mr-2" />
                Volledig Scherm
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernPageWrapper>
  );
}