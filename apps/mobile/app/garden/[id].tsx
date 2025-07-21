import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { 
  getGarden, 
  getPlantBeds, 
  type Garden, 
  type PlantBedWithPlants,
  METERS_TO_PIXELS,
  metersToPixels,
  parsePlantBedDimensions
} from '@tuinbeheer/shared';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_PADDING = 20;
const AVAILABLE_WIDTH = SCREEN_WIDTH - (CANVAS_PADDING * 2);

export default function GardenDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [garden, setGarden] = useState<Garden | null>(null);
  const [plantBeds, setPlantBeds] = useState<PlantBedWithPlants[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'visual' | 'list'>('visual');

  useEffect(() => {
    if (id) {
      loadGardenData();
    }
  }, [id]);

  const loadGardenData = async () => {
    try {
      setLoading(true);
      const [gardenData, plantBedsData] = await Promise.all([
        getGarden(id),
        getPlantBeds(id),
      ]);
      
      setGarden(gardenData);
      setPlantBeds(plantBedsData || []);
    } catch (error) {
      console.error('Error loading garden data:', error);
      Alert.alert(
        'Fout',
        'Kon tuingegevens niet laden.',
        [
          { text: 'Probeer opnieuw', onPress: loadGardenData },
          { text: 'Terug', onPress: () => router.back() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const getCanvasSize = () => {
    if (!garden?.length || !garden?.width) {
      return { 
        width: AVAILABLE_WIDTH, 
        height: 300,
        scale: 1
      };
    }
    
    const lengthMeters = parseFloat(garden.length);
    const widthMeters = parseFloat(garden.width);
    
    if (isNaN(lengthMeters) || isNaN(widthMeters) || lengthMeters <= 0 || widthMeters <= 0) {
      return { 
        width: AVAILABLE_WIDTH, 
        height: 300,
        scale: 1
      };
    }
    
    // Calculate ideal pixel dimensions
    const idealWidth = metersToPixels(lengthMeters);
    const idealHeight = metersToPixels(widthMeters);
    
    // Scale to fit mobile screen
    const scaleX = AVAILABLE_WIDTH / idealWidth;
    const scaleY = 400 / idealHeight; // Max height of 400px
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up
    
    return {
      width: idealWidth * scale,
      height: idealHeight * scale,
      scale
    };
  };

  const { width: canvasWidth, height: canvasHeight, scale } = getCanvasSize();

  const renderPlantBed = (bed: PlantBedWithPlants, index: number) => {
    // Calculate bed dimensions
    let bedWidth = metersToPixels(2) * scale; // Default 2x2 meters
    let bedHeight = metersToPixels(2) * scale;
    
    if (bed.size) {
      const dims = parsePlantBedDimensions(bed.size);
      if (dims) {
        bedWidth = dims.lengthPixels * scale;
        bedHeight = dims.widthPixels * scale;
      }
    }

    const positionX = (bed.position_x || 100) * scale;
    const positionY = (bed.position_y || 100) * scale;

    const colors = [
      '#dcfce7', '#dbeafe', '#e0e7ff', '#fef3c7', '#fce7f3', '#f3e8ff',
    ];
    const backgroundColor = colors[index % colors.length];

    return (
      <TouchableOpacity
        key={bed.id}
        style={[
          styles.plantBed,
          {
            left: positionX,
            top: positionY,
            width: bedWidth,
            height: bedHeight,
            backgroundColor,
          },
        ]}
        onPress={() => router.push(`/plantbed/${bed.id}`)}
      >
        <View style={styles.plantBedContent}>
          <Text style={styles.plantBedName} numberOfLines={1}>
            {bed.name}
          </Text>
          <Text style={styles.plantBedInfo}>
            {bed.plants.length} 🌸
          </Text>
          {bed.size && (
            <Text style={styles.plantBedSize} numberOfLines={1}>
              {bed.size}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderListView = () => (
    <View style={styles.listContainer}>
      {plantBeds.map((bed, index) => (
        <TouchableOpacity
          key={bed.id}
          style={styles.listItem}
          onPress={() => router.push(`/plantbed/${bed.id}`)}
        >
          <View style={styles.listItemIcon}>
            <Ionicons name="leaf" size={24} color="#16a34a" />
          </View>
          <View style={styles.listItemContent}>
            <Text style={styles.listItemTitle}>{bed.name}</Text>
            <Text style={styles.listItemSubtitle}>
              {bed.size || 'Geen afmetingen'} • {bed.plants.length} planten
            </Text>
            {bed.description && (
              <Text style={styles.listItemDescription} numberOfLines={2}>
                {bed.description}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="leaf" size={48} color="#16a34a" />
          <Text style={styles.loadingText}>Tuin laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!garden) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Tuin niet gevonden</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Terug</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.gardenName}>{garden.name}</Text>
          {garden.description && (
            <Text style={styles.gardenDescription}>{garden.description}</Text>
          )}
          
          <View style={styles.gardenStats}>
            {garden.location && (
              <View style={styles.statItem}>
                <Ionicons name="location" size={16} color="#6b7280" />
                <Text style={styles.statText}>{garden.location}</Text>
              </View>
            )}
            {(garden.length && garden.width) && (
              <View style={styles.statItem}>
                <Ionicons name="resize" size={16} color="#6b7280" />
                <Text style={styles.statText}>
                  {garden.length}m × {garden.width}m
                </Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Ionicons name="leaf" size={16} color="#6b7280" />
              <Text style={styles.statText}>
                {plantBeds.length} plantvakken
              </Text>
            </View>
          </View>
        </View>

        {/* View Mode Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'visual' && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode('visual')}
          >
            <Ionicons 
              name="grid" 
              size={20} 
              color={viewMode === 'visual' ? '#ffffff' : '#6b7280'} 
            />
            <Text style={[
              styles.toggleButtonText,
              viewMode === 'visual' && styles.toggleButtonTextActive,
            ]}>
              Visueel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'list' && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons 
              name="list" 
              size={20} 
              color={viewMode === 'list' ? '#ffffff' : '#6b7280'} 
            />
            <Text style={[
              styles.toggleButtonText,
              viewMode === 'list' && styles.toggleButtonTextActive,
            ]}>
              Lijst
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {viewMode === 'visual' ? (
          <View style={styles.visualContainer}>
            <Text style={styles.visualTitle}>Tuinindeling</Text>
            <View style={styles.canvasContainer}>
              <View
                style={[
                  styles.canvas,
                  { width: canvasWidth, height: canvasHeight },
                ]}
              >
                {/* Grid */}
                <View style={styles.grid} />
                
                {/* Plant Beds */}
                {plantBeds.map((bed, index) => renderPlantBed(bed, index))}
                
                {/* Empty State */}
                {plantBeds.length === 0 && (
                  <View style={styles.emptyCanvas}>
                    <Ionicons name="leaf-outline" size={32} color="#9ca3af" />
                    <Text style={styles.emptyCanvasText}>
                      Nog geen plantvakken
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <Text style={styles.canvasHint}>
              💡 Tik op een plantvak om het te beheren
            </Text>
          </View>
        ) : (
          renderListView()
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  gardenName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  gardenDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 16,
  },
  gardenStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#16a34a',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 6,
  },
  toggleButtonTextActive: {
    color: '#ffffff',
  },
  visualContainer: {
    padding: 20,
  },
  visualTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  canvasContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  canvas: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#d1fae5',
    borderStyle: 'dashed',
  },
  grid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  plantBed: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#16a34a',
    padding: 4,
  },
  plantBedContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plantBedName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  plantBedInfo: {
    fontSize: 10,
    color: '#6b7280',
  },
  plantBedSize: {
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
  },
  emptyCanvas: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -25 }],
    alignItems: 'center',
  },
  emptyCanvasText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  canvasHint: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
  },
  listContainer: {
    padding: 20,
  },
  listItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listItemIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#dcfce7',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  listItemDescription: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: '#16a34a',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});