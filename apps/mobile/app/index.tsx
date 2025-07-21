import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="leaf" size={40} color="#16a34a" />
          </View>
          <Text style={styles.title}>Tuinbeheer Systeem</Text>
          <Text style={styles.subtitle}>
            Welkom bij uw persoonlijke tuinbeheer app. Beheer uw tuinen, plantvakken en houd bij wat u heeft geplant.
          </Text>
        </View>

        {/* Main Actions */}
        <View style={styles.actionsContainer}>
          <Link href="/gardens" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="grid" size={32} color="#16a34a" />
              </View>
              <Text style={styles.actionTitle}>Mijn Tuinen</Text>
              <Text style={styles.actionDescription}>
                Bekijk en beheer al uw tuinen
              </Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="add-circle" size={32} color="#16a34a" />
            </View>
            <Text style={styles.actionTitle}>Nieuwe Tuin</Text>
            <Text style={styles.actionDescription}>
              Maak een nieuwe tuin aan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="flower" size={32} color="#16a34a" />
            </View>
            <Text style={styles.actionTitle}>Planten Catalogus</Text>
            <Text style={styles.actionDescription}>
              Ontdek nieuwe planten voor uw tuin
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="calendar" size={32} color="#16a34a" />
            </View>
            <Text style={styles.actionTitle}>Tuinkalender</Text>
            <Text style={styles.actionDescription}>
              Plan uw tuinwerkzaamheden
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Overzicht</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Tuinen</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Plantvakken</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Planten</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#dcfce7',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
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
  actionIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#dcfce7',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    flex: 1,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});