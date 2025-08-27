"use client"

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Leaf, Palette, Calendar, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DUTCH_FLOWERS, 
  FlowerData, 
  getPopularFlowers, 
  getFlowersByCategory, 
  searchFlowers,
  FLOWER_CATEGORIES,
  FLOWER_COLORS 
} from '@/lib/dutch-flowers';

interface FlowerSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  showDetails?: boolean;
  showCategories?: boolean;
  showPopularFirst?: boolean;
}

export function FlowerSelector({ 
  value, 
  onValueChange, 
  placeholder = "Zoek een bloem...",
  showDetails = true,
  showCategories = true,
  showPopularFirst = true
}: FlowerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredFlowers, setFilteredFlowers] = useState<FlowerData[]>([]);
  const [selectedFlower, setSelectedFlower] = useState<FlowerData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize flowers
  useEffect(() => {
    let flowers = DUTCH_FLOWERS;
    
    if (showPopularFirst) {
      flowers = [...flowers].sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return a.name.localeCompare(b.name);
      });
    }
    
    setFilteredFlowers(flowers);
  }, [showPopularFirst]);

  // Filter flowers based on search and category
  useEffect(() => {
    let flowers = DUTCH_FLOWERS;

    // Apply search filter
    if (searchQuery.trim()) {
      flowers = searchFlowers(searchQuery);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      flowers = flowers.filter(flower => flower.category === selectedCategory);
    }

    // Sort: popular first, then alphabetically
    if (showPopularFirst) {
      flowers = [...flowers].sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    setFilteredFlowers(flowers);
  }, [searchQuery, selectedCategory, showPopularFirst]);

  // Set selected flower based on value
  useEffect(() => {
    if (value) {
      const flower = DUTCH_FLOWERS.find(f => f.name === value);
      setSelectedFlower(flower || null);
    } else {
      setSelectedFlower(null);
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFlowerSelect = (flower: FlowerData) => {
    onValueChange(flower.name);
    setSelectedFlower(flower);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClearSelection = () => {
    onValueChange('');
    setSelectedFlower(null);
    setSearchQuery('');
  };

  const popularFlowers = getPopularFlowers().slice(0, 8);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Selected flower display */}
      {selectedFlower && !isOpen ? (
        <div className="w-full">
          <Button
            variant="outline"
            className="w-full justify-between h-auto p-3"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
              <div className="text-left">
                <div className="font-medium">{selectedFlower.name}</div>
                {selectedFlower.scientificName && (
                  <div className="text-xs text-gray-500 italic">
                    {selectedFlower.scientificName}
                  </div>
                )}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
          
          {/* Flower details */}
          {showDetails && (
            <Card className="mt-2 border-green-200 dark:border-green-700">
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                    <span className="text-gray-600">Bloei:</span>
                    <span className="font-medium">{selectedFlower.bloeiperiode}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Palette className="h-3 w-3 text-purple-500" />
                    <span className="text-gray-600">Kleur:</span>
                    <div className="flex gap-1">
                      {selectedFlower.kleur.slice(0, 3).map((color) => (
                        <Badge key={color} variant="secondary" className="px-1 py-0 text-xs">
                          {color}
                        </Badge>
                      ))}
                      {selectedFlower.kleur.length > 3 && (
                        <Badge variant="secondary" className="px-1 py-0 text-xs">
                          +{selectedFlower.kleur.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 text-gray-600">
                    <Badge variant="outline" className="text-xs">
                      {FLOWER_CATEGORIES[selectedFlower.category]}
                    </Badge>
                    {selectedFlower.popular && (
                      <Badge variant="outline" className="ml-1 text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        Populair
                      </Badge>
                    )}
                  </div>
                  {selectedFlower.description && (
                    <div className="col-span-2 text-xs text-gray-600 mt-1">
                      <Info className="h-3 w-3 inline mr-1" />
                      {selectedFlower.description}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-gray-500 hover:text-gray-700"
            onClick={handleClearSelection}
          >
            Andere bloem kiezen
          </Button>
        </div>
      ) : (
        /* Search input */
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="pl-10"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Dropdown content */}
      {isOpen && (
        <Card className="absolute z-50 w-full mt-1 max-h-80 overflow-y-auto border shadow-lg">
          <CardContent className="p-0">
            {/* Category filter */}
            {showCategories && (
              <div className="p-3 border-b bg-gray-50">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Alle categorieën" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle categorieën</SelectItem>
                    {Object.entries(FLOWER_CATEGORIES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Popular flowers (when no search) */}
            {!searchQuery && showPopularFirst && (
              <div className="p-3 border-b bg-green-50 dark:bg-green-950/30">
                <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Populaire bloemen</h4>
                <div className="grid grid-cols-2 gap-1">
                  {popularFlowers.map((flower) => (
                    <Button
                      key={flower.name}
                      variant="ghost"
                      size="sm"
                      className="justify-start h-8 text-xs"
                      onClick={() => handleFlowerSelect(flower)}
                    >
                                              <Leaf className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
                      {flower.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Filtered flowers list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredFlowers.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {searchQuery ? 'Geen bloemen gevonden' : 'Geen bloemen beschikbaar'}
                </div>
              ) : (
                filteredFlowers.map((flower) => (
                  <Button
                    key={flower.name}
                    variant="ghost"
                                            className="w-full justify-start p-3 h-auto hover:bg-green-50 dark:hover:bg-green-950/30 border-b border-gray-100 dark:border-gray-700"
                    onClick={() => handleFlowerSelect(flower)}
                  >
                    <div className="flex items-center gap-3 w-full">
                                              <Leaf className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div className="text-left flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {flower.name}
                          {flower.popular && (
                                                      <Badge variant="secondary" className="px-1 py-0 text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300">
                            Populair
                          </Badge>
                          )}
                        </div>
                        {flower.scientificName && (
                          <div className="text-xs text-gray-500 italic">
                            {flower.scientificName}
                          </div>
                        )}
                        <div className="text-xs text-gray-600 mt-1">
                          <span className="mr-3">{flower.bloeiperiode}</span>
                          <Badge variant="outline" className="text-xs">
                            {FLOWER_CATEGORIES[flower.category]}
                          </Badge>
                        </div>
                        <div className="flex gap-1 mt-1">
                          {flower.kleur.slice(0, 4).map((color) => (
                            <div 
                              key={color} 
                              className="w-3 h-3 rounded-full border border-gray-300"
                              style={{ 
                                backgroundColor: getColorHex(color),
                              }}
                              title={color}
                            />
                          ))}
                          {flower.kleur.length > 4 && (
                            <div className="text-xs text-gray-500 ml-1">
                              +{flower.kleur.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper function to get color hex values
function getColorHex(color: string): string {
  const colorMap: { [key: string]: string } = {
    'Wit': '#ffffff',
    'Geel': '#ffd700',
    'Roze': '#ffc0cb',
    'Rood': '#ff0000',
    'Paars': '#8a2be2',
    'Blauw': '#0000ff',
    'Oranje': '#ffa500',
    'Groen': '#00ff00'
  };
  
  return colorMap[color] || '#cccccc';
}