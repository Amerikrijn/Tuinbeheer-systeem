import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getGardens, type Garden } from '@tuinbeheer/shared';

export default function GardensScreen() {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadGardens = async () => {
    try {
      setLoading(true);
      const data = await getGardens();
      setGardens(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load gardens:', error);
      Alert.alert(
        'Fout',
        'Kon tuinen niet laden. Controleer uw internetverbinding.',
        [{ text: 'OK' }]
      );
      setGardens([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGardens();
    setRefreshing(false);
  };

  useEffect(() => {
    loadGardens();
  }, []);

  const renderGardenCard = ({ item: garden }: { item: Garden }) => (
    <Link href={`/garden/${garden.id}`} asChild>
      <TouchableOpacity style={styles.gardenCard}>
        <View style={styles.cardHeader}>
          <View style={styles.gardenIcon}>
            <Ionicons name="leaf" size={24} color="#16a34a" />
          </View>
          <View style={styles.gardenInfo}>
            <Text style={styles.gardenName}>{garden.name}</Text>
            <Text style={styles.gardenDescription}>
              {garden.description || 'Geen beschrijving'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
        
        <View style={styles.cardDetails}>
          {garden.location && (
            <View style={styles.detailRow}>
              <Ionicons name="location" size={16} color="#6b7280" />
              <Text style={styles.detailText}>{garden.location}</Text>
            </View>
          )}
          
          {(garden.length && garden.width) && (
            <View style={styles.detailRow}>
              <Ionicons name="resize" size={16} color="#6b7280" />
              <Text style={styles.detailText}>
                {garden.length}m × {garden.width}m
              </Text>
            </View>
          )}
          
          {garden.established_date && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={16} color="#6b7280" />
              <Text style={styles.detailText}>
                Aangelegd: {new Date(garden.established_date).getFullYear()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Link>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="leaf" size={48} color="#16a34a" />
          <Text style={styles.loadingText}>Tuinen laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={gardens}
        renderItem={renderGardenCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#16a34a']}
            tintColor="#16a34a"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>Nog geen tuinen</Text>
            <Text style={styles.emptyDescription}>
              Begin met het aanmaken van uw eerste tuin om uw planten te beheren.
            </Text>
            <TouchableOpacity style={styles.createButton}>
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.createButtonText}>Eerste tuin aanmaken</Text>
            </TouchableOpacity>
          </View>
        }
        ListHeaderComponent={
          gardens.length > 0 ? (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Mijn Tuinen</Text>
              <Text style={styles.headerSubtitle}>
                {gardens.length} {gardens.length === 1 ? 'tuin' : 'tuinen'}
              </Text>
            </View>
          ) : null
        }
      />
      
      {gardens.length > 0 && (
        <TouchableOpacity style={styles.fab}>
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      )}
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
  listContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  gardenCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gardenIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#dcfce7',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  gardenInfo: {
    flex: 1,
  },
  gardenName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  gardenDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  cardDetails: {
    paddingLeft: 60,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  createButton: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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