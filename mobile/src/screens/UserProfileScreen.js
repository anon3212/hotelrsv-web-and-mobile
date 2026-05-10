import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { BASE_URL } from '../constants/theme';
import { reservationsAPI } from '../services/api';

export default function UserProfileScreen({ onLogout, onBookingPress, onGoHome }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      const data = await reservationsAPI.getUserReservations();
      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#FFA500';
      case 'Confirmed':
        return '#00C853';
      case 'Checked In':
        return '#2196F3';
      case 'Checked Out':
        return '#888';
      case 'Cancelled':
        return '#FF6B6B';
      default:
        return '#888';
    }
  };

  const renderBookingCard = ({ item }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => onBookingPress(item.id)}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.bookingId}>{item.booking_id}</Text>
          <Text style={styles.roomName}>{item.room?.name}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Check-in</Text>
          <Text style={styles.detailValue}>
            {new Date(item.check_in).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Check-out</Text>
          <Text style={styles.detailValue}>
            {new Date(item.check_out).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Room Type</Text>
          <Text style={styles.detailValue}>{item.room?.room_type}</Text>
        </View>
      </View>

      {item.payment_status && (
        <View style={styles.paymentStatus}>
          <Text style={styles.paymentLabel}>Payment:</Text>
          <Text
            style={[
              styles.paymentValue,
              {
                color:
                  item.payment_status === 'Completed'
                    ? '#00C853'
                    : item.payment_status === 'Under Review'
                    ? '#FFA500'
                    : '#888',
              },
            ]}
          >
            {item.payment_status}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={require('../../assets/bg.jpg')} style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.homeBtn}
              onPress={onGoHome}
            >
              <Text style={styles.homeText}>← Home</Text>
            </TouchableOpacity>
            <View style={styles.titleGroup}>
              <Text style={styles.title}>My Profile</Text>
              <Text style={styles.subtitle}>Your Bookings</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={onLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#00C853" />
          </View>
        ) : bookings.length > 0 ? (
          <FlatList
            data={bookings}
            renderItem={renderBookingCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No Bookings Yet</Text>
            <Text style={styles.emptyText}>
              Start exploring and book your perfect room!
            </Text>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleGroup: {
    marginLeft: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  homeBtn: {
    backgroundColor: '#00C853',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  homeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  logoutBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  bookingCard: {
    backgroundColor: '#1C2730',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00C853',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingId: {
    color: '#00C853',
    fontSize: 13,
    fontWeight: 'bold',
  },
  roomName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    color: '#666',
    fontSize: 11,
    marginBottom: 3,
  },
  detailValue: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  paymentLabel: {
    color: '#666',
    fontSize: 11,
    marginRight: 8,
  },
  paymentValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
