import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ImageBackground,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL, COLORS } from '../constants/theme';
import { reservationsAPI } from '../services/api';

export default function BookingScreen({ route, onConfirmation, onCancel }) {
  const { room } = route.params;
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 86400000));
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [contact, setContact] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('GCash');
  const [paymentRef, setPaymentRef] = useState('');
  const [receiptImage, setReceiptImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const handleCheckInChange = (event, selectedDate) => {
    setShowCheckInPicker(false);
    if (selectedDate) setCheckInDate(selectedDate);
  };

  const handleCheckOutChange = (event, selectedDate) => {
    setShowCheckOutPicker(false);
    if (selectedDate) setCheckOutDate(selectedDate);
  };

  const handleBooking = async () => {
    if (!guestName || !contact || !paymentRef || !receiptImage) {
      Alert.alert('Error', 'Please fill in all fields and upload receipt');
      return;
    }

    if (checkOutDate <= checkInDate) {
      Alert.alert('Error', 'Check-out date must be after check-in date');
      return;
    }

    setLoading(true);
    try {
      const checkInStr = checkInDate.toISOString().split('T')[0];
      const checkOutStr = checkOutDate.toISOString().split('T')[0];

      const result = await reservationsAPI.createReservation(
        room.id,
        guestName,
        contact,
        checkInStr,
        checkOutStr,
        paymentMethod,
        paymentRef,
        receiptImage
      );

      if (result.id) {
        onConfirmation(result);
      } else {
        Alert.alert('Error', result.error || 'Failed to create booking');
      }
    } catch (error) {
      Alert.alert('Booking Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const totalPrice = (room.price || 0) * nights;

  return (
    <ImageBackground source={require('../../assets/bg.jpg')} style={styles.container}>
      <View style={styles.overlay}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Confirm Your Stay</Text>
          </View>

          {/* Room Card */}
          <View style={styles.roomCard}>
            <ImageBackground
              source={{ uri: `${BASE_URL}${room.image}` }}
              style={styles.roomImage}
            >
              <View style={styles.overlay1}>
                <Text style={styles.roomName}>{room.name}</Text>
                <Text style={styles.roomType}>{room.room_type}</Text>
              </View>
            </ImageBackground>
          </View>

          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Dates</Text>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowCheckInPicker(true)}
            >
              <Text style={styles.label}>Check-in</Text>
              <Text style={styles.dateValue}>{checkInDate.toDateString()}</Text>
            </TouchableOpacity>

            {showCheckInPicker && (
              <DateTimePicker
                value={checkInDate}
                mode="date"
                display="spinner"
                onChange={handleCheckInChange}
              />
            )}

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowCheckOutPicker(true)}
            >
              <Text style={styles.label}>Check-out</Text>
              <Text style={styles.dateValue}>{checkOutDate.toDateString()}</Text>
            </TouchableOpacity>

            {showCheckOutPicker && (
              <DateTimePicker
                value={checkOutDate}
                mode="date"
                display="spinner"
                onChange={handleCheckOutChange}
              />
            )}

            <Text style={styles.nights}>Total: {nights} nights</Text>

            <View style={styles.policyBox}>
              <Text style={styles.policyTitle}>Booking Policy</Text>
              <Text style={styles.policyText}>Check-in window: 2:00 PM – 7:00 PM</Text>
              <Text style={styles.policyText}>Check-out time: 12:00 PM</Text>
            </View>
          </View>

          {/* Guest Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guest Information</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#666"
              value={guestName}
              onChangeText={setGuestName}
            />

            <TextInput
              style={styles.input}
              placeholder="Contact Number"
              placeholderTextColor="#666"
              value={contact}
              onChangeText={setContact}
              keyboardType="phone-pad"
            />
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>

            <View style={styles.paymentContainer}>
              <Text style={styles.paymentLabel}>GCash Payment</Text>
              
              <Image
                source={require('../../assets/gcash_qr.jpg')}
                style={styles.qrCode}
                resizeMode="contain"
              />
              
              <Text style={styles.qrText}>Scan QR code to pay</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Payment Reference Number"
                placeholderTextColor="#666"
                value={paymentRef}
                onChangeText={setPaymentRef}
              />

              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Text style={styles.uploadButtonText}>
                  {receiptImage ? 'Change Receipt Image' : 'Select Receipt Image'}
                </Text>
              </TouchableOpacity>

              {receiptImage && (
                <Image source={{ uri: receiptImage }} style={styles.receiptPreview} />
              )}

              <Text style={styles.uploadHint}>
                Tap above to select an image from your gallery
              </Text>
            </View>
          </View>

          {/* Price Summary */}
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>₱{room.price}/night × {nights} nights</Text>
              <Text style={styles.priceValue}>₱{totalPrice.toFixed(2)}</Text>
            </View>
          </View>

          {/* Booking Button */}
          <TouchableOpacity
            style={[styles.bookButton, loading && styles.bookButtonDisabled]}
            onPress={handleBooking}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.bookButtonText}>Complete Booking</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

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
    paddingTop: 20,
  },
  header: {
    marginBottom: 20,
    paddingTop: 60,
  },
  backText: {
    color: '#00C853',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  roomCard: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    height: 200,
  },
  roomImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay1: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
  },
  roomName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  roomType: {
    color: '#00C853',
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: '#1C2730',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  label: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
  },
  dateValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  nights: {
    color: '#00C853',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  policyBox: {
    backgroundColor: '#112222',
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#0B7A6D',
  },
  policyTitle: {
    color: '#00C853',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  policyText: {
    color: '#B8F1D3',
    fontSize: 13,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#1C2730',
    color: 'white',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  methodButtonActive: {
    borderColor: '#00C853',
    backgroundColor: 'rgba(0,200,83,0.1)',
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 10,
  },
  radioActive: {
    borderColor: '#00C853',
    backgroundColor: '#00C853',
  },
  methodText: {
    color: 'white',
    fontSize: 14,
  },
  paymentContainer: {
    alignItems: 'center',
  },
  paymentLabel: {
    color: '#00C853',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  qrCode: {
    width: 200,
    height: 200,
    marginBottom: 10,
    borderRadius: 10,
  },
  qrText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: '#00C853',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#121B22',
    fontSize: 14,
    fontWeight: 'bold',
  },
  receiptPreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginTop: 10,
  },
  uploadHint: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  priceCard: {
    backgroundColor: 'rgba(0,200,83,0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#00C853',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: '#888',
    fontSize: 14,
  },
  priceValue: {
    color: '#00C853',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: '#00C853',
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: '#121B22',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#00C853',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
    color: '#00C853',
    fontSize: 16,
    fontWeight: '600',
  },
  spacing: {
    height: 40,
  },
});
