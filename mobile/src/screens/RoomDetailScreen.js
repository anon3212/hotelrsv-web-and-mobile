import React from 'react';
import { 
  View, Text, ImageBackground, StyleSheet, 
  TouchableOpacity, ScrollView 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { BASE_URL } from '../constants/theme';

export default function RoomDetailScreen({ route, onBack }) {
  const { item } = route.params;

  return (
    <View style={styles.container}>
      {/* Top Image Header */}
      <ImageBackground 
        source={{ uri: `${BASE_URL}${item.image}` }} 
        style={styles.headerImage}
      >
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Feather name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.tagContainer}>
          <View style={[styles.tag, { backgroundColor: '#00BFA5' }]}>
            <Text style={styles.tagText}>Available</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: '#3F51B5' }]}>
            <Text style={styles.tagText}>{item.category || 'Deluxe'}</Text>
          </View>
        </View>
      </ImageBackground>

      {/* Details Section */}
      <ScrollView style={styles.detailsContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{item.name || 'Deluxe Room'}</Text>
        <Text style={styles.subInfo}>Room #{item.id} · 2nd Floor</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₱{item.price || '1,499'}</Text>
          <Text style={styles.perNight}> /night</Text>
        </View>

        {/* Amenities Grid */}
        <View style={styles.amenitiesGrid}>
          <AmenityItem icon="bed-king-outline" label="King Bed" />
          <AmenityItem icon="wifi" label="WiFi" />
          <AmenityItem icon="snowflake" label="A/C" />
          <AmenityItem icon="bathtub-outline" label="En Suite" />
          <AmenityItem icon="television" label="Smart TV" />
        </View>

        {/* Date Selection Placeholder */}
        <View style={styles.dateRow}>
          <DateBox label="Check-in" date="May 10, 2026" />
          <DateBox label="Check-out" date="May 13, 2026" />
        </View>

        {/* Summary Box */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>Total (3 nights)</Text>
          <Text style={styles.summaryPrice}>₱4,497</Text>
        </View>

        <TouchableOpacity style={styles.bookBtn}>
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Sub-components for cleaner code
const AmenityItem = ({ icon, label }) => (
  <View style={styles.amenityChip}>
    <MaterialCommunityIcons name={icon} size={18} color="#888" />
    <Text style={styles.amenityLabel}>{label}</Text>
  </View>
);

const DateBox = ({ label, date }) => (
  <View style={styles.dateBox}>
    <Text style={styles.dateLabel}>{label}</Text>
    <Text style={styles.dateValue}>{date}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F17' },
  headerImage: { width: '100%', height: 350, justifyContent: 'flex-start', padding: 20 },
  backButton: { width: 45, height: 45, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  tagContainer: { flexDirection: 'row', position: 'absolute', bottom: 20, left: 20, gap: 10 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tagText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  detailsContent: { flex: 1, padding: 25, marginTop: -20, backgroundColor: '#0B0F17', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', fontFamily: 'serif' },
  subInfo: { color: '#666', fontSize: 14, marginTop: 5 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginVertical: 20 },
  price: { color: '#00BFA5', fontSize: 26, fontWeight: 'bold' },
  perNight: { color: '#666', fontSize: 16 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  amenityChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2129', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, width: '31%', gap: 5 },
  amenityLabel: { color: '#ccc', fontSize: 12 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  dateBox: { width: '48%', backgroundColor: '#1A2129', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#222' },
  dateLabel: { color: '#444', fontSize: 12, marginBottom: 5 },
  dateValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  summaryBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0, 191, 165, 0.1)', padding: 18, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(0, 191, 165, 0.2)', marginBottom: 30 },
  summaryText: { color: '#888', fontSize: 16 },
  summaryPrice: { color: '#00BFA5', fontSize: 20, fontWeight: 'bold' },
  bookBtn: { backgroundColor: '#111', paddingVertical: 18, borderRadius: 15, alignItems: 'center' },
  bookBtnText: { color: '#222', fontSize: 18, fontWeight: 'bold' } // Low contrast as per reference
});