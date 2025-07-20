'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ZoomIn, ZoomOut, RotateCcw, Grid, Settings, Save, Eye, EyeOff, Flower2, Trash2, Edit, Plus } from 'lucide-react';
import { getMockPlantBeds, getMockGarden, type PlantBed, type Garden, type Plant } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

// ===================================================================
// TYPES
// ===================================================================

interface PlantBedPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface PlantPosition {
  id: string;
  bedId: string;
  x: number;
  y: number;
  size: number;
}

interface Position {
  x: number;
  y: number;
}

// ===================================================================
// PLANT BED VISUAL COMPONENT
// ===================================================================

interface PlantBedVisualProps {
  plantBed: PlantBed;
  position: PlantBedPosition;
  plantPositions: PlantPosition[];
  scale: number;
  isSelected: boolean;
  isDragging: boolean;
  showPlants: boolean;
  onSelect: (bed: PlantBed) => void;
  onDragStart: (id: string, position: Position) => void;
  onDragMove: (position: Position) => void;
  onDragEnd: () => void;
  onPlantSelect: (plant: Plant) => void;
  onPlantDragStart: (plantId: string, bedId: string, position: Position) => void;
  getPlantColor: (plant: Plant) => string;
}

const PlantBedVisual: React.FC<PlantBedVisualProps> = ({
  plantBed,
  position,
  plantPositions,
  scale,
  isSelected,
  isDragging,
  showPlants,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onPlantSelect,
  onPlantDragStart,
  getPlantColor
}) => {
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  const scaledPosition = {
    x: position.x * scale,
    y: position.y * scale
  };
  
  const scaledSize = {
    width: position.width * scale,
    height: position.height * scale
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setDragOffset(offset);
    onSelect(plantBed);
    onDragStart(plantBed.id, scaledPosition);
  };
  
  const handlePlantMouseDown = (e: React.MouseEvent, plant: Plant) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setDragOffset(offset);
    onPlantSelect(plant);
    onPlantDragStart(plant.id, plantBed.id, scaledPosition);
  };
  
  const getSunColor = (exp: string) => {
    switch (exp) {
      case "full-sun":
        return "bg-yellow-100 border-yellow-300"
      case "partial-sun":
        return "bg-orange-100 border-orange-300"
      case "shade":
        return "bg-gray-100 border-gray-300"
      default:
        return "bg-green-100 border-green-300"
    }
  }
  
  const borderColor = isSelected ? 'border-blue-500' : '';
  const borderWidth = isSelected ? 'border-4' : 'border-2';
  
  return (
    <div
      className={`absolute rounded-lg shadow-lg cursor-move transition-all duration-200 hover:shadow-xl ${getSunColor(plantBed.sunExposure)} ${borderColor} ${borderWidth} ${
        isDragging ? 'shadow-2xl ring-2 ring-green-500' : ''
      }`}
      style={{
        left: scaledPosition.x,
        top: scaledPosition.y,
        width: scaledSize.width,
        height: scaledSize.height,
        transform: `rotate(${position.rotation}deg)`,
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        if (!isDragging) onSelect(plantBed);
      }}
    >
      <div className="p-2 h-full flex flex-col justify-between relative">
        <div>
          <div className="flex items-center justify-between mb-1">
            <Badge variant="outline" className="text-xs font-bold">
              {plantBed.id}
            </Badge>
          </div>
          <div className="font-semibold text-xs leading-tight mb-1">{plantBed.name}</div>
          <div className="text-xs text-gray-600 leading-tight">{plantBed.location}</div>
        </div>
        <div className="text-xs flex items-center justify-between">
          <span className="text-gray-600">{plantBed.size}</span>
          <span className="font-medium">{plantBed.plants.length} planten</span>
        </div>

        {/* Plants within the bed */}
        {showPlants && plantPositions
          .filter(plantPos => plantPos.bedId === plantBed.id)
          .map(plantPos => {
            const plant = plantBed.plants.find(p => p.id === plantPos.id);
            if (!plant) return null;
            return (
              <div
                key={plant.id}
                className="absolute rounded-full cursor-pointer transition-all duration-200 hover:scale-110 border-2 border-white shadow-md"
                style={{
                  left: plantPos.x,
                  top: plantPos.y,
                  width: plantPos.size,
                  height: plantPos.size,
                  backgroundColor: getPlantColor(plant),
                }}
                onMouseDown={(e) => handlePlantMouseDown(e, plant)}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlantSelect(plant);
                }}
                title={`${plant.name} (${plant.color})`}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Flower2 className="h-2 w-2 text-white" />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

// ===================================================================
// GRID OVERLAY COMPONENT
// ===================================================================

interface GridOverlayProps {
  canvasSize: { width: number; height: number };
  gridSize: number;
  scale: number;
  visible: boolean;
}

const GridOverlay: React.FC<GridOverlayProps> = ({
  canvasSize,
  gridSize,
  scale,
  visible
}) => {
  if (!visible) return null;
  
  const scaledGridSize = gridSize * scale;
  const lines = [];
  
  // Vertical lines
  for (let x = 0; x <= canvasSize.width; x += scaledGridSize) {
    lines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={canvasSize.height}
        stroke="#e5e7eb"
        strokeWidth="1"
        opacity="0.5"
      />
    );
  }
  
  // Horizontal lines
  for (let y = 0; y <= canvasSize.height; y += scaledGridSize) {
    lines.push(
      <line
        key={`h-${y}`}
        x1={0}
        y1={y}
        x2={canvasSize.width}
        y2={y}
        stroke="#e5e7eb"
        strokeWidth="1"
        opacity="0.5"
      />
    );
  }
  
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: canvasSize.width,
        height: canvasSize.height
      }}
    >
      {lines}
    </svg>
  );
};

// ===================================================================
// MAIN GARDEN CANVAS COMPONENT
// ===================================================================

interface GardenCanvasProps {
  onNavigateToEdit?: (bedId: string) => void;
  onNavigateToAddPlant?: (bedId: string) => void;
  onNavigateToEditPlant?: (bedId: string, plantId: string) => void;
}

const GardenCanvas: React.FC<GardenCanvasProps> = ({
  onNavigateToEdit,
  onNavigateToAddPlant,
  onNavigateToEditPlant
}) => {
  const { toast } = useToast();
  const [garden, setGarden] = useState<Garden | null>(null);
  const [plantBeds, setPlantBeds] = useState<PlantBed[]>([]);
  const [positions, setPositions] = useState<PlantBedPosition[]>([]);
  const [plantPositions, setPlantPositions] = useState<PlantPosition[]>([]);
  const [scale, setScale] = useState(1);
  const [selectedPlantBed, setSelectedPlantBed] = useState<PlantBed | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [draggedPlantId, setDraggedPlantId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showPlants, setShowPlants] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const GRID_SIZE = 20;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  
  // Canvas dimensions
  const canvasSize = {
    width: CANVAS_WIDTH * scale,
    height: CANVAS_HEIGHT * scale
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const beds = getMockPlantBeds();
      const gardenData = getMockGarden();
      setPlantBeds(beds);
      setGarden(gardenData);

      // Initialize positions
      const initialPositions: PlantBedPosition[] = beds.map((bed, index) => {
        const sizeMap = {
          "Klein (< 5m²)": { width: 80, height: 60 },
          "Gemiddeld (5-15m²)": { width: 120, height: 100 },
          "Groot (15-30m²)": { width: 160, height: 140 },
        } as const;
        const size = sizeMap[bed.size as keyof typeof sizeMap] ?? { width: 100, height: 80 };
        return {
          id: bed.id,
          x: 100 + (index % 3) * 200,
          y: 100 + Math.floor(index / 3) * 180,
          width: size.width,
          height: size.height,
          rotation: 0,
        };
      });
      setPositions(initialPositions);

      // Initialize plant positions
      const initialPlantPositions: PlantPosition[] = [];
      beds.forEach((bed) => {
        bed.plants.forEach((plant, plantIndex) => {
          const bedPosition = initialPositions.find(p => p.id === bed.id);
          if (bedPosition) {
            const plantsPerRow = Math.ceil(Math.sqrt(bed.plants.length));
            const row = Math.floor(plantIndex / plantsPerRow);
            const col = plantIndex % plantsPerRow;
            const plantSpacing = Math.min(bedPosition.width, bedPosition.height) / (plantsPerRow + 1);
            
            initialPlantPositions.push({
              id: plant.id,
              bedId: bed.id,
              x: (col + 1) * plantSpacing - 10,
              y: (row + 1) * plantSpacing - 10,
              size: 20
            });
          }
        });
      });
      setPlantPositions(initialPlantPositions);
      setLoading(false);
    };
    loadData();
  }, []);

  const getPlantColor = (plant: Plant) => {
    const colorMap: { [key: string]: string } = {
      'Rood': '#ef4444',
      'Roze': '#ec4899',
      'Geel': '#eab308',
      'Wit': '#f8fafc',
      'Paars': '#8b5cf6',
      'Blauw': '#3b82f6',
      'Oranje': '#f97316',
      'Groen': '#22c55e',
    };
    return colorMap[plant.color] || '#22c55e';
  };
  
  // ===================================================================
  // ZOOM CONTROLS
  // ===================================================================
  
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.3));
  };
  
  const handleZoomReset = () => {
    setScale(1);
  };
  
  // ===================================================================
  // DRAG AND DROP HANDLERS
  // ===================================================================
  
  const handleDragStart = (id: string, position: Position) => {
    setIsDragging(true);
    setDraggedElementId(id);
  };

  const handlePlantDragStart = (plantId: string, bedId: string, position: Position) => {
    setIsDragging(true);
    setDraggedPlantId(plantId);
  };
  
  const handleDragMove = (position: Position) => {
    if (isDragging && draggedElementId) {
      const newPosition = {
        x: position.x / scale,
        y: position.y / scale
      };
      
      // Snap to grid
      newPosition.x = Math.round(newPosition.x / GRID_SIZE) * GRID_SIZE;
      newPosition.y = Math.round(newPosition.y / GRID_SIZE) * GRID_SIZE;
      
      // Update local state
      setPositions(prev => 
        prev.map(pos => 
          pos.id === draggedElementId 
            ? { ...pos, x: Math.max(0, newPosition.x), y: Math.max(0, newPosition.y) }
            : pos
        )
      );
      
      setHasUnsavedChanges(true);
    } else if (isDragging && draggedPlantId) {
      const bedId = plantPositions.find(p => p.id === draggedPlantId)?.bedId;
      const bedPos = positions.find(p => p.id === bedId);
      if (bedPos) {
        const relativeX = (position.x / scale) - bedPos.x;
        const relativeY = (position.y / scale) - bedPos.y;
        const constrainedX = Math.max(5, Math.min(relativeX, bedPos.width - 25));
        const constrainedY = Math.max(5, Math.min(relativeY, bedPos.height - 25));
        
        setPlantPositions(prev =>
          prev.map(p => (p.id === draggedPlantId ? { ...p, x: constrainedX, y: constrainedY } : p))
        );
        setHasUnsavedChanges(true);
      }
    }
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedElementId(null);
    setDraggedPlantId(null);
  };
  
  // ===================================================================
  // SAVE FUNCTIONALITY
  // ===================================================================
  
  const handleSave = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Layout opgeslagen",
        description: "De tuinlayout is succesvol opgeslagen.",
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het opslaan.",
        variant: "destructive",
      });
    }
  };

  const deletePlant = (plantId: string) => {
    setPlantBeds(prev => prev.map(bed => ({
      ...bed,
      plants: bed.plants.filter(plant => plant.id !== plantId)
    })));
    setPlantPositions(prev => prev.filter(pos => pos.id !== plantId));
    setSelectedPlant(null);
    setHasUnsavedChanges(true);
    toast({
      title: "Plant verwijderd",
      description: "De plant is succesvol verwijderd.",
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  // ===================================================================
  // RENDER
  // ===================================================================
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">{garden?.name || 'Tuin Layout Designer'}</h2>
          <p className="text-sm text-muted-foreground">
            Versleep plantvakken en planten om je tuin opnieuw in te delen
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={hasUnsavedChanges ? 'destructive' : 'secondary'}>
            {hasUnsavedChanges ? 'Niet opgeslagen' : 'Opgeslagen'}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPlants(!showPlants)}
          >
            <Flower2 className="h-4 w-4" />
            {showPlants ? 'Verberg Planten' : 'Toon Planten'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
          >
            {showGrid ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            Raster
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Opslaan
          </Button>
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-4 border-b bg-muted/50">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-8" />
        
        <Badge variant="outline">
          Zoom: {Math.round(scale * 100)}%
        </Badge>
        
        <Badge variant="outline">
          Plantvakken: {plantBeds.length}
        </Badge>
        
        {selectedPlantBed && (
          <Badge variant="default">
            Geselecteerd: {selectedPlantBed.name}
          </Badge>
        )}
      </div>
      
      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 overflow-auto p-4 bg-green-50"
        style={{
          backgroundImage: `radial-gradient(circle, #10b981 1px, transparent 1px)`,
          backgroundSize: `${GRID_SIZE * scale}px ${GRID_SIZE * scale}px`,
        }}
        onMouseMove={(e) => {
          if (!canvasRef.current) return;
          const rect = canvasRef.current.getBoundingClientRect();
          const position = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          };
          handleDragMove(position);
        }}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <div
          className="relative bg-white shadow-lg border-2 border-gray-300"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            minWidth: canvasSize.width,
            minHeight: canvasSize.height
          }}
        >
          {/* Grid Overlay */}
          <GridOverlay
            canvasSize={canvasSize}
            gridSize={GRID_SIZE}
            scale={scale}
            visible={showGrid}
          />
          
          {/* Plant Beds */}
          {positions.map(position => {
            const plantBed = plantBeds.find(bed => bed.id === position.id);
            if (!plantBed) return null;
            
            return (
              <PlantBedVisual
                key={plantBed.id}
                plantBed={plantBed}
                position={position}
                plantPositions={plantPositions}
                scale={scale}
                isSelected={selectedPlantBed?.id === plantBed.id}
                isDragging={isDragging && draggedElementId === plantBed.id}
                showPlants={showPlants}
                onSelect={setSelectedPlantBed}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                onPlantSelect={setSelectedPlant}
                onPlantDragStart={handlePlantDragStart}
                getPlantColor={getPlantColor}
              />
            );
          })}
          
          {/* Canvas Info */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs text-gray-600">
            <div>Canvas: {CANVAS_WIDTH}×{CANVAS_HEIGHT}px</div>
            <div>Raster: {GRID_SIZE}px</div>
            <div>Schaal: {Math.round(scale * 100)}%</div>
          </div>
        </div>
      </div>

      {/* Plant Detail Dialog */}
      <Dialog open={!!selectedPlant} onOpenChange={() => setSelectedPlant(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-full border-2 border-white"
                style={{ backgroundColor: selectedPlant ? getPlantColor(selectedPlant) : '#22c55e' }}
              />
              {selectedPlant?.name}
            </DialogTitle>
            <DialogDescription className="space-y-3">
              {selectedPlant && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Kleur:</span>
                      <div className="font-medium">{selectedPlant.color}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Hoogte:</span>
                      <div className="font-medium">{selectedPlant.height}cm</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <div className="font-medium">
                        <Badge variant="secondary">{selectedPlant.status}</Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Plantdatum:</span>
                      <div className="font-medium">{selectedPlant.plantedDate}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        const bedId = plantPositions.find(p => p.id === selectedPlant.id)?.bedId;
                        if (bedId && onNavigateToEditPlant) {
                          onNavigateToEditPlant(bedId, selectedPlant.id);
                        }
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Bewerken
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deletePlant(selectedPlant.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Verwijderen
                    </Button>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Bed Detail Dialog */}
      <Dialog open={!!selectedPlantBed && !selectedPlant} onOpenChange={() => setSelectedPlantBed(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg font-bold px-3 py-1">
                {selectedPlantBed?.id}
              </Badge>
              {selectedPlantBed?.name}
            </DialogTitle>
            <DialogDescription className="space-y-3">
              {selectedPlantBed && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Locatie:</span>
                      <div className="font-medium">{selectedPlantBed.location}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Grootte:</span>
                      <div className="font-medium">{selectedPlantBed.size}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Aantal planten:</span>
                      <div className="font-medium">{selectedPlantBed.plants.length}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        if (onNavigateToEdit) {
                          onNavigateToEdit(selectedPlantBed.id);
                        }
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Bewerken
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (onNavigateToAddPlant) {
                          onNavigateToAddPlant(selectedPlantBed.id);
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Plant Toevoegen
                    </Button>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GardenCanvas;