'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ZoomIn, ZoomOut, RotateCcw, Grid, Settings, Save, Eye, EyeOff } from 'lucide-react';

// ===================================================================
// TYPES (Basis implementatie)
// ===================================================================

interface Garden {
  id: string;
  name: string;
  description?: string;
}

interface PlantBed {
  id: string;
  garden_id: string;
  name: string;
  description?: string;
  size_m2?: number;
  // Visual properties (zou uit database moeten komen)
  position_x?: number;
  position_y?: number;
  visual_width?: number;
  visual_height?: number;
  color_code?: string;
  rotation?: number;
  z_index?: number;
}

interface CanvasConfig {
  canvas_width: number;
  canvas_height: number;
  grid_size: number;
  default_zoom: number;
  show_grid: boolean;
  snap_to_grid: boolean;
  background_color: string;
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
  scale: number;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: (id: string) => void;
  onDragStart: (id: string, position: Position) => void;
  onDragMove: (position: Position) => void;
  onDragEnd: () => void;
}

const PlantBedVisual: React.FC<PlantBedVisualProps> = ({
  plantBed,
  scale,
  isSelected,
  isDragging,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd
}) => {
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  const position = {
    x: (plantBed.position_x || 0) * scale,
    y: (plantBed.position_y || 0) * scale
  };
  
  const size = {
    width: (plantBed.visual_width || 2) * scale,
    height: (plantBed.visual_height || 2) * scale
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setDragOffset(offset);
    onSelect(plantBed.id);
    onDragStart(plantBed.id, position);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      };
      onDragMove(newPosition);
    }
  };
  
  const handleMouseUp = () => {
    if (isDragging) {
      onDragEnd();
    }
  };
  
  const color = plantBed.color_code || '#22c55e';
  const borderColor = isSelected ? '#3b82f6' : color;
  const borderWidth = isSelected ? 2 : 1;
  
  return (
    <div
      className={`absolute border-2 cursor-move transition-all duration-200 rounded-md flex items-center justify-center text-white font-semibold shadow-lg ${
        isDragging ? 'shadow-xl z-50' : ''
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        backgroundColor: color,
        borderColor: borderColor,
        borderWidth: borderWidth,
        transform: `rotate(${plantBed.rotation || 0}deg)`,
        zIndex: plantBed.z_index || 0
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="text-center text-sm p-1">
        <div className="truncate">{plantBed.name}</div>
        {plantBed.size_m2 && (
          <div className="text-xs opacity-75">{plantBed.size_m2}m²</div>
        )}
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
  garden: Garden;
  plantBeds: PlantBed[];
  canvasConfig: CanvasConfig;
  onSave: (plantBeds: PlantBed[]) => Promise<void>;
  onCanvasConfigChange: (config: Partial<CanvasConfig>) => Promise<void>;
}

const GardenCanvas: React.FC<GardenCanvasProps> = ({
  garden,
  plantBeds,
  canvasConfig,
  onSave,
  onCanvasConfigChange
}) => {
  const [scale, setScale] = useState(canvasConfig.default_zoom);
  const [selectedPlantBed, setSelectedPlantBed] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(canvasConfig.show_grid);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localPlantBeds, setLocalPlantBeds] = useState<PlantBed[]>(plantBeds);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Canvas dimensions
  const canvasSize = {
    width: canvasConfig.canvas_width * scale,
    height: canvasConfig.canvas_height * scale
  };
  
  // ===================================================================
  // ZOOM CONTROLS
  // ===================================================================
  
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  };
  
  const handleZoomReset = () => {
    setScale(canvasConfig.default_zoom);
  };
  
  const handleZoomToFit = () => {
    if (canvasRef.current) {
      const containerRect = canvasRef.current.getBoundingClientRect();
      const scaleX = containerRect.width / canvasConfig.canvas_width;
      const scaleY = containerRect.height / canvasConfig.canvas_height;
      setScale(Math.min(scaleX, scaleY) * 0.9);
    }
  };
  
  // ===================================================================
  // DRAG AND DROP HANDLERS
  // ===================================================================
  
  const handleDragStart = (id: string, position: Position) => {
    setIsDragging(true);
    setDraggedElementId(id);
  };
  
  const handleDragMove = (position: Position) => {
    if (isDragging && draggedElementId) {
      const newPosition = {
        x: position.x / scale,
        y: position.y / scale
      };
      
      // Snap to grid if enabled
      if (canvasConfig.snap_to_grid) {
        newPosition.x = Math.round(newPosition.x / canvasConfig.grid_size) * canvasConfig.grid_size;
        newPosition.y = Math.round(newPosition.y / canvasConfig.grid_size) * canvasConfig.grid_size;
      }
      
      // Update local state
      setLocalPlantBeds(prev => 
        prev.map(pb => 
          pb.id === draggedElementId 
            ? { ...pb, position_x: newPosition.x, position_y: newPosition.y }
            : pb
        )
      );
      
      setHasUnsavedChanges(true);
    }
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedElementId(null);
  };
  
  // ===================================================================
  // SAVE FUNCTIONALITY
  // ===================================================================
  
  const handleSave = async () => {
    try {
      await onSave(localPlantBeds);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };
  
  // ===================================================================
  // KEYBOARD SHORTCUTS
  // ===================================================================
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case '=':
          case '+':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case '0':
            e.preventDefault();
            handleZoomReset();
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // ===================================================================
  // RENDER
  // ===================================================================
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">{garden.name}</h2>
          <p className="text-sm text-muted-foreground">
            Visual Garden Designer - {canvasConfig.canvas_width}m × {canvasConfig.canvas_height}m
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={hasUnsavedChanges ? 'destructive' : 'secondary'}>
            {hasUnsavedChanges ? 'Unsaved Changes' : 'Saved'}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
          >
            {showGrid ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            Grid
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
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
          <Button variant="outline" size="sm" onClick={handleZoomToFit}>
            Fit
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-8" />
        
        <Badge variant="outline">
          Zoom: {Math.round(scale * 100)}%
        </Badge>
        
        <Badge variant="outline">
          Plant Beds: {localPlantBeds.length}
        </Badge>
        
        {selectedPlantBed && (
          <Badge variant="default">
            Selected: {localPlantBeds.find(pb => pb.id === selectedPlantBed)?.name}
          </Badge>
        )}
      </div>
      
      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 overflow-auto p-4 bg-gray-50"
        style={{ backgroundColor: canvasConfig.background_color }}
      >
        <div
          className="relative border-2 border-gray-300 bg-white shadow-lg"
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
            gridSize={canvasConfig.grid_size}
            scale={scale}
            visible={showGrid}
          />
          
          {/* Plant Beds */}
          {localPlantBeds.map(plantBed => (
            <PlantBedVisual
              key={plantBed.id}
              plantBed={plantBed}
              scale={scale}
              isSelected={selectedPlantBed === plantBed.id}
              isDragging={isDragging && draggedElementId === plantBed.id}
              onSelect={setSelectedPlantBed}
              onDragStart={handleDragStart}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
            />
          ))}
          
          {/* Canvas Info */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs text-gray-600">
            <div>Canvas: {canvasConfig.canvas_width}m × {canvasConfig.canvas_height}m</div>
            <div>Grid: {canvasConfig.grid_size}m</div>
            <div>Scale: {Math.round(scale * 100)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GardenCanvas;