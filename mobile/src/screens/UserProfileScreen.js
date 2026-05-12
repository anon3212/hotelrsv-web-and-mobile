import React, { useEffect, useState } from "react";
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
  Modal,
} from "react-native";
import { BASE_URL } from "../constants/theme";
import { reservationsAPI } from "../services/api";

export default function UserProfileScreen({
  onLogout,
  onBookingPress,
  onGoHome,
}) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      const data = await reservationsAPI.getUserReservations();
      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch (error) {
      Alert.alert("Error", "Failed to load your bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#FFA500";
      case "Confirmed":
        return "#00C853";
      case "Cancellation Pending":
        return "#F39C12";
      case "Checked In":
        return "#2196F3";
      case "Checked Out":
        return "#888";
      case "Cancelled":
        return "#FF6B6B";
      default:
        return "#888";
    }
  };

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;

    setCancelLoading(true);
    try {
      await reservationsAPI.requestCancelReservation(selectedBooking.id);
      setCancelModalVisible(false);
      setSelectedBooking(null);
      fetchUserBookings();
      Alert.alert(
        "Cancellation Requested",
        "Your cancellation request has been submitted.",
      );
    } catch (error) {
      Alert.alert("Error", error.message || "Unable to request cancellation");
    } finally {
      setCancelLoading(false);
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
            {new Date(item.check_in).toLocaleDateString()} • 2:00 PM
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
                  item.payment_status === "Completed"
                    ? "#00C853"
                    : item.payment_status === "Under Review"
                      ? "#FFA500"
                      : "#888",
              },
            ]}
          >
            {item.payment_status}
          </Text>
        </View>
      )}

      {item.status === "Confirmed" && (
        <TouchableOpacity
          style={styles.cancelBookingButton}
          onPress={() => openCancelModal(item)}
        >
          <Text style={styles.cancelBookingText}>Cancel Booking</Text>
        </TouchableOpacity>
      )}

      {item.status === "Cancellation Pending" && (
        <Text style={styles.pendingText}>
          Cancellation pending admin approval
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require("../../assets/bg.jpg")}
      style={styles.container}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.homeBtn} onPress={onGoHome}>
              <Text style={styles.homeText}>← Home</Text>
            </TouchableOpacity>
            <View style={styles.titleGroup}>
              <Text style={styles.title}>My Profile</Text>
              <Text style={styles.subtitle}>Your Bookings</Text>
              <Text style={styles.policyHint}>
                Check-in window: 2:00 PM - 7:00 PM. Check-out: 12:00 PM.
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
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

        <Modal visible={cancelModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Cancellation</Text>
              <Text style={styles.modalDescription}>
                If the cancellation is within 20 days of the booked date, it is
                non-refundable. Are you sure you want to submit a cancellation
                request?
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalBackButton}
                  onPress={() => setCancelModalVisible(false)}
                >
                  <Text style={styles.modalBackText}>Keep Booking</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={handleConfirmCancel}
                  disabled={cancelLoading}
                >
                  <Text style={styles.modalConfirmText}>
                    {cancelLoading ? "Submitting..." : "Confirm Cancel"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  titleGroup: {
    marginLeft: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  policyHint: {
    color: "#a0f4c0",
    fontSize: 12,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
  homeBtn: {
    backgroundColor: "#00C853",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  homeText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
  logoutBtn: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  bookingCard: {
    backgroundColor: "#1C2730",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#00C853",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bookingId: {
    color: "#00C853",
    fontSize: 13,
    fontWeight: "bold",
  },
  roomName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  statusText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    color: "#666",
    fontSize: 11,
    marginBottom: 3,
  },
  detailValue: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  paymentStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  paymentLabel: {
    color: "#666",
    fontSize: 11,
    marginRight: 8,
  },
  paymentValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  cancelBookingButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#FF6B6B",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelBookingText: {
    color: "#FF6B6B",
    fontWeight: "700",
  },
  pendingText: {
    marginTop: 10,
    color: "#F39C12",
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#111820",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#00C853",
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalDescription: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalBackButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 10,
    alignItems: "center",
  },
  modalBackText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    alignItems: "center",
  },
  modalConfirmText: {
    color: "#fff",
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
