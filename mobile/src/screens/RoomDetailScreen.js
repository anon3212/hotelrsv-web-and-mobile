import React, { useState, useEffect } from 'react';
import { 
  View, Text, ImageBackground, StyleSheet, 
  TouchableOpacity, ScrollView, Platform 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { BASE_URL } from '../constants/theme';

export default function RoomDetailScreen({ route, onBack, onBooking }) {
  const { item } = route.params;

  // 1. Setup State for Dates
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('checkIn'); // track which box was clicked

  // 2. Logic to calculate nights and total
  const calculateDetails = () => {
    const diffTime = Math.abs(checkOut - checkIn);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const pricePerNight = item.price_per_night || item.price || 1499; // Fallback to 1499
    return { nights, total: nights * pricePerNight };
  };

  const { nights, total } = calculateDetails();

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (!selectedDate) return;

    if (pickerMode === 'checkIn') {
      setCheckIn(selectedDate);
      // Ensure check-out is at least 1 day after check-in
      if (selectedDate >= checkOut) {
        setCheckOut(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000));
      }
    } else {
      if (selectedDate > checkIn) {
        setCheckOut(selectedDate);
      }
    }
  };

  const openPicker = (mode) => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const handleBooking = () => {
    onBooking({
      ...item,
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
    });
  };

  return (
    <View style={styles.container}>
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
            <Text style={styles.tagText}>{item.room_type || 'Deluxe'}</Text>
          </View>
        </View>
      </ImageBackground>

      <ScrollView style={styles.detailsContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{item.room_number ? `Room ${item.room_number}` : item.name}</Text>
        <Text style={styles.subInfo}>{item.description || '2nd Floor · Luxury Suite'}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₱{item.price_per_night || item.price || '1,499'}</Text>
          <Text style={styles.perNight}> /night</Text>
        </View>

        <View style={styles.amenitiesGrid}>
          <AmenityItem icon="bed-king-outline" label="King Bed" />
          <AmenityItem icon="wifi" label="WiFi" />
          <AmenityItem icon="snowflake" label="A/C" />
          <AmenityItem icon="bathtub-outline" label="En Suite" />
          <AmenityItem icon="television" label="Smart TV" />
        </View>

        {/* 3. Clickable Date Boxes */}
        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateBoxWrapper} onPress={() => openPicker('checkIn')}>
            <DateBox label="Check-in" date={checkIn.toLocaleDateString()} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.dateBoxWrapper} onPress={() => openPicker('checkOut')}>
            <DateBox label="Check-out" date={checkOut.toLocaleDateString()} />
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={pickerMode === 'checkIn' ? checkIn : checkOut}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
            onChange={handleDateChange}
            minimumDate={pickerMode === 'checkIn' ? new Date() : new Date(checkIn.getTime() + 24 * 60 * 60 * 1000)}
          />
        )}

        {/* 4. Dynamic Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>Total ({nights} nights)</Text>
          <Text style={styles.summaryPrice}>₱{total.toLocaleString()}</Text>
        </View>

        <TouchableOpacity style={styles.bookBtn} onPress={handleBooking}>
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const AmenityItem = ({ icon, label }) => (
  <View style={styles.amenityChip}>
    <MaterialCommunityIcons name={icon} size={18} color="#00BFA5" />
    <Text style={styles.amenityLabel}>{label}</Text>
  </View>
);

const DateBox = ({ label, date }) => (
  <View style={styles.dateBoxInner}>
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
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  subInfo: { color: '#666', fontSize: 14, marginTop: 5 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginVertical: 20 },
  price: { color: '#00BFA5', fontSize: 26, fontWeight: 'bold' },
  perNight: { color: '#666', fontSize: 16 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  amenityChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2129', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, width: '31%', gap: 5 },
  amenityLabel: { color: '#ccc', fontSize: 11 },
  dateRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20,
    marginTop: 10 
  },
  dateBoxWrapper: { 
    width: '48%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateBoxInner: { 
    backgroundColor: '#1A2129', 
    padding: 15, 
    borderRadius: 15, 
    borderWidth: 1.5,           
    borderColor: '#333',        
    minHeight: 70,              
    justifyContent: 'center' 
  },
  dateLabel: { 
    color: '#00BFA5',           
    fontSize: 12, 
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase', 
    letterSpacing: 0.5
  },
  dateValue: { 
    color: '#FFFFFF',           
    fontSize: 16,               
    fontWeight: 'bold' 
  },
  summaryBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0, 191, 165, 0.1)', padding: 18, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(0, 191, 165, 0.2)', marginBottom: 30 },
  summaryText: { color: '#888', fontSize: 16 },
  summaryPrice: { color: '#00BFA5', fontSize: 22, fontWeight: 'bold' },
  bookBtn: { backgroundColor: '#00BFA5', paddingVertical: 18, borderRadius: 15, alignItems: 'center' },
  bookBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});