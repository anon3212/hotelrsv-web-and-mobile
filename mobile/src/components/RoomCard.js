import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Star, Circle } from 'lucide-react-native';
import { COLORS, BASE_URL } from '../constants/theme';

const { width } = Dimensions.get('window');
const columnWidth = (width - 50) / 2;

export default function RoomCard({ item, onPress }) {
  const rating = (Math.random() * (5 - 3.5) + 3.5).toFixed(1);

  return (
    <TouchableOpacity style={styles.roomCard} onPress={onPress}>
      <Image 
        source={{ uri: `${BASE_URL}${item.image}` }} 
        style={styles.roomImage} 
        resizeMode="cover" 
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.statusBadge}>
            <Circle size={8} fill={item.status === 'Available' ? COLORS.accentGreen : COLORS.error} color="transparent" />
            <Text style={[styles.statusText, { color: item.status === 'Available' ? COLORS.accentGreen : COLORS.error }]}>
              {item.status}
            </Text>
          </View>
          <View style={styles.ratingRow}>
            <Star size={10} color={COLORS.star} fill={COLORS.star} />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>
        <Text style={styles.roomTypeLabel} numberOfLines={1}>{item.room_type}</Text>
        <Text style={styles.priceText}>₱{item.price} <Text style={styles.perNight}>/ night</Text></Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  roomCard: { backgroundColor: COLORS.cardBg, width: columnWidth, borderRadius: 15, marginBottom: 15, overflow: 'hidden' },
  roomImage: { width: '100%', height: 110 },
  cardContent: { padding: 10 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  statusBadge: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 9, marginLeft: 4, fontWeight: 'bold' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { color: COLORS.star, fontSize: 10, marginLeft: 2, fontWeight: 'bold' },
  roomTypeLabel: { color: COLORS.textPrimary, fontSize: 14, fontWeight: 'bold' },
  priceText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: 'bold', marginTop: 5 },
  perNight: { fontSize: 10, color: COLORS.textSecondary },
});