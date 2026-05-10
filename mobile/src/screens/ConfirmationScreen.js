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
} from 'react-native';
import { BASE_URL } from '../constants/theme';
import { reservationsAPI } from '../services/api';

export default function ConfirmationScreen({ route, onComplete }) {
  const { reservationId } = route.params;
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservationDetails();
  }, []);

  const fetchReservationDetails = async () => {
    try {
      const data = await reservationsAPI.getReservationDetail(reservationId);
      setReservation(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ImageBackground source={require('../../assets/bg.jpg')} style={styles.container}>
        <View style={styles.overlay}>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#00C853" />
            <Text style={styles.loadingText}>Loading your booking...</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  if (!reservation) {
    return (
      <ImageBackground source={require('../../assets/bg.jpg')} style={styles.container}>
        <View style={styles.overlay}>
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>Failed to load booking details</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('../../assets/bg.jpg')} style={styles.container}>
      <View style={styles.overlay}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.successIcon}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Booking Received!</Text>
            <Text style={styles.statusBadge}>
              {reservation.payment_status === 'Under Review'
                ? 'Payment Under Review'
                : reservation.payment_status}
            </Text>
          </View>

          {/* Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              Thank you, {reservation.guest_name}! We've received your payment details.
              Our team is verifying the transaction. You'll receive a notification once
              your booking is officially confirmed.
            </Text>
          </View>

          {/* Booking Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Booking Details</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Booking ID</Text>
              <Text style={styles.detailValue}>{reservation.booking_id}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Room</Text>
              <Text style={styles.detailValue}>{reservation.room?.name}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Check-in</Text>
              <Text style={styles.detailValue}>
                {new Date(reservation.check_in).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Check-out</Text>
              <Text style={styles.detailValue}>
                {new Date(reservation.check_out).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Amount</Text>
              <Text style={styles.priceValue}>₱{reservation.total_price || reservation.room?.price || 0}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>{reservation.payment_method}</Text>
            </View>

            {reservation.payment_reference && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reference No.</Text>
                <Text style={styles.detailValue}>{reservation.payment_reference}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.primaryButton} onPress={onComplete}>
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>

          {/* Support Info */}
          <View style={styles.supportContainer}>
            <Text style={styles.supportText}>Need help?</Text>
            <Text style={styles.supportEmail}>Contact: bookinn@gmail.com</Text>
            <Text style={styles.supportPhone}>0926 967 3682</Text>
          </View>

          <View style={styles.spacing} />
        </ScrollView>
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
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 15,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#00C853',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkmark: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  statusBadge: {
    color: '#FFA500',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(255,165,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  messageContainer: {
    backgroundColor: 'rgba(0,200,83,0.05)',
    borderLeftWidth: 3,
    borderLeftColor: '#00C853',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  messageText: {
    color: '#DDD',
    fontSize: 14,
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: '#1C2730',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  detailsTitle: {
    color: '#00C853',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailLabel: {
    color: '#888',
    fontSize: 13,
  },
  detailValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  priceValue: {
    color: '#00C853',
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: '#00C853',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#121B22',
    fontSize: 16,
    fontWeight: 'bold',
  },
  supportContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  supportText: {
    color: '#DDD',
    fontSize: 13,
    marginBottom: 8,
  },
  supportEmail: {
    color: '#00C853',
    fontSize: 12,
    marginBottom: 4,
  },
  supportPhone: {
    color: '#00C853',
    fontSize: 12,
  },
  spacing: {
    height: 30,
  },
});
