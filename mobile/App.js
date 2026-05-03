import React, { useState, useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  StatusBar, 
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  Hotel, 
  Circle, 
  Calendar, 
  Home, 
  Search, 
  ChevronDown, 
  User, 
  Lock, 
  List, 
  Menu, 
  Info,
  X,
  Star
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const columnWidth = (width - 50) / 2; 

export default function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Navigation States
  const [showBurgerMenu, setShowBurgerMenu] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  // Room Data States
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null); // Added for Room Detail
  
  // Date Picker States
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);

  // Filter States
  const [selectedRoomType, setSelectedRoomType] = useState('Any');
  const roomTypes = ['Any', 'Standard', 'Deluxe', 'Suite', 'Family'];

  const BASE_URL = "http://192.168.100.14:8000";

  useEffect(() => {
    if (isLoggedIn) {
      fetchRooms();
    }
  }, [isLoggedIn]);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/rooms/`);
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (username.trim() !== "" && password.trim() !== "") {
      setIsLoggedIn(true);
    } else {
      alert("Please enter both username and password");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowBurgerMenu(false);
    setUsername('');
    setPassword('');
  };

  // --- Handlers ---
  const toggleCheckIn = () => {
    setShowCheckOut(false);
    setShowCheckIn(true);
  };

  const toggleCheckOut = () => {
    setShowCheckIn(false);
    setShowCheckOut(true);
  };

  const onCheckInChange = (event, selectedDate) => {
    setShowCheckIn(false); 
    if (event.type === "set" && selectedDate) {
      setCheckInDate(selectedDate);
      if (selectedDate >= checkOutDate) {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setCheckOutDate(nextDay);
      }
    }
  };

  const onCheckOutChange = (event, selectedDate) => {
    setShowCheckOut(false);
    if (event.type === "set" && selectedDate) {
      setCheckOutDate(selectedDate);
    }
  };

  const renderRoom = ({ item }) => {
    // Feature: Star rating based on reviews (randomly generated for demo)
    const rating = (Math.random() * (5 - 3.5) + 3.5).toFixed(1);

    return (
      <TouchableOpacity style={styles.roomCard} onPress={() => setSelectedRoom(item)}>
        <Image 
          source={{ uri: `${BASE_URL}${item.image}` }} 
          style={styles.roomImage} 
          resizeMode="cover" 
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.statusBadge}>
              <Circle size={8} fill={item.status === 'Available' ? '#4ade80' : '#f87171'} color="transparent" />
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Star size={10} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          </View>
          <Text style={styles.roomTypeLabel} numberOfLines={1}>{item.room_type}</Text>
          <Text style={styles.priceText}>₱{item.price} <Text style={styles.perNight}>/ night</Text></Text>
        </View>
      </TouchableOpacity>
    );
  };

  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loginContainer}>
          <StatusBar barStyle="light-content" />
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={styles.loginScroll}>
              <View style={styles.loginHeader}>
                <Image source={require('./assets/logo.jpg')} style={styles.loginLogo} resizeMode="contain" />
                <Text style={styles.loginWelcome}>Welcome Back</Text>
                <Text style={styles.loginSub}>Sign in to continue to BookInn</Text>
              </View>

              <View style={styles.loginForm}>
                <View style={styles.inputBox}>
                  <User size={18} color="#888" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.textInput}
                    placeholder="Username"
                    placeholderTextColor="#666"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputBox}>
                  <Lock size={18} color="#888" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.textInput}
                    placeholder="Password"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.registerLink}>
                  <Text style={styles.registerText}>
                    Don't have an account? <Text style={styles.blueText}>Register</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // --- MAIN DASHBOARD SCREEN ---
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowBurgerMenu(true)} style={styles.burgerButton}>
            <Menu size={28} color="#fff" />
          </TouchableOpacity>
          <Image source={require('./assets/logo.jpg')} style={styles.logoImage} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={styles.logoText}>BookInn</Text>
          </View>
        </View>

        {/* Burger Menu Modal */}
        <Modal visible={showBurgerMenu} transparent animationType="fade">
          <View style={styles.burgerOverlay}>
            <View style={styles.burgerMenuPanel}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Menu</Text>
              </View>
              <ScrollView>
                <TouchableOpacity style={styles.burgerItem} onPress={() => setShowBurgerMenu(false)}>
                  <Home size={20} color="#222" />
                  <Text style={styles.burgerText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.burgerItem} onPress={() => { alert('Profile'); setShowBurgerMenu(false); }}>
                  <User size={20} color="#222" />
                  <Text style={styles.burgerText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.burgerItem} onPress={() => { alert('My Bookings'); setShowBurgerMenu(false); }}>
                  <List size={20} color="#222" />
                  <Text style={styles.burgerText}>My Bookings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.burgerItem} onPress={() => { Alert.alert('About Us', 'BookInn is a Web and Mobile application built for Easier Hotel Reservation.'); setShowBurgerMenu(false); }}>
                  <Info size={20} color="#222" />
                  <Text style={styles.burgerText}>About Us</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.burgerItem} onPress={handleLogout}>
                  <Lock size={20} color="#f87171" />
                  <Text style={[styles.burgerText, { color: '#f87171' }]}>Logout</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
            <TouchableOpacity style={styles.burgerCloseArea} onPress={() => setShowBurgerMenu(false)} />
          </View>
        </Modal>

        {/* Feature: Redesigned Search & Filters (Horizontal Chip Layout) */}
        <View style={styles.searchSection}>
          <View style={styles.horizontalSearch}>
            <TouchableOpacity style={styles.searchChip} onPress={toggleCheckIn}>
              <Calendar size={14} color="#0d6efd" />
              <Text style={styles.chipText}>{checkInDate.toLocaleDateString(undefined, {month:'short', day:'numeric'})}</Text>
            </TouchableOpacity>
            <View style={styles.chipDivider} />
            <TouchableOpacity style={styles.searchChip} onPress={toggleCheckOut}>
              <Calendar size={14} color="#0d6efd" />
              <Text style={styles.chipText}>{checkOutDate.toLocaleDateString(undefined, {month:'short', day:'numeric'})}</Text>
            </TouchableOpacity>
            <View style={styles.chipDivider} />
            <TouchableOpacity style={styles.searchChip} onPress={() => setShowTypeModal(true)}>
              <Home size={14} color="#0d6efd" />
              <Text style={styles.chipText}>{selectedRoomType}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mainSearchIcon} onPress={fetchRooms}>
              <Search size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Pickers */}
        {showCheckIn && <DateTimePicker value={checkInDate} mode="date" display="default" onChange={onCheckInChange} minimumDate={new Date()} />}
        {showCheckOut && <DateTimePicker value={checkOutDate} mode="date" display="default" onChange={onCheckOutChange} minimumDate={checkInDate} />}

        {/* Room Type Selection Modal */}
        <Modal visible={showTypeModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Room Type</Text>
              {roomTypes.map((type) => (
                <TouchableOpacity key={type} style={styles.modalOption} onPress={() => { setSelectedRoomType(type); setShowTypeModal(false); }}>
                  <Text style={[styles.optionText, selectedRoomType === type && styles.selectedOptionText]}>{type}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowTypeModal(false)}><Text style={styles.closeBtnText}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Feature: ROOM DETAIL MODAL */}
        <Modal visible={!!selectedRoom} animationType="slide" transparent>
          <View style={styles.detailOverlay}>
            <View style={styles.detailContent}>
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setSelectedRoom(null)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
              <Image source={{ uri: `${BASE_URL}${selectedRoom?.image}` }} style={styles.detailImage} />
              <ScrollView style={styles.detailBody}>
                <View style={styles.detailHeaderRow}>
                  <Text style={styles.detailTitle}>{selectedRoom?.room_type} Room</Text>
                  <Text style={styles.detailPrice}>₱{selectedRoom?.price}<Text style={{fontSize:12, color:'#666'}}>/night</Text></Text>
                </View>
                <View style={styles.detailMetaRow}>
                   <View style={styles.metaItem}><Star size={14} color="#fbbf24" fill="#fbbf24" /><Text style={styles.metaText}> 4.8 (12 Reviews)</Text></View>
                   <View style={styles.metaItem}><Hotel size={14} color="#666" /><Text style={styles.metaText}> {selectedRoom?.room_type}</Text></View>
                </View>
                <Text style={styles.detailSectionTitle}>Description</Text>
                <Text style={styles.detailDesc}>Enjoy a premium stay in our {selectedRoom?.room_type} room. Equipped with modern amenities, high-speed Wi-Fi, and a scenic view.</Text>
                <Text style={styles.detailSectionTitle}>Reviews</Text>
                <View style={styles.reviewPlaceholder}>
                  <Text style={{fontWeight:'bold'}}>Jed Cyrus</Text>
                  <Text style={{color:'#555', fontStyle:'italic'}}>"Very clean and worth the price!"</Text>
                </View>
              </ScrollView>
              <TouchableOpacity style={styles.bookButton} onPress={() => {alert('Room Booked!'); setSelectedRoom(null);}}>
                <Text style={styles.bookButtonText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Text style={styles.sectionTitle}>Featured Rooms</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={rooms}
            renderItem={renderRoom}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#0a0a0a' },
  burgerButton: { marginRight: 15 },
  logoImage: { width: 40, height: 40, marginRight: 10 },
  logoText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },

  // Redesigned Search Section
  searchSection: { paddingHorizontal: 20, marginVertical: 15 },
  horizontalSearch: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 30, padding: 6, alignItems: 'center', elevation: 5 },
  searchChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  chipText: { fontSize: 11, color: '#333', marginLeft: 4, fontWeight: 'bold' },
  chipDivider: { width: 1, height: 20, backgroundColor: '#eee' },
  mainSearchIcon: { backgroundColor: '#222', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 5 },

  // Room Card & Rating
  roomCard: { backgroundColor: '#1a1a1a', width: columnWidth, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
  roomImage: { width: '100%', height: 110 },
  cardContent: { padding: 10 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { color: '#fbbf24', fontSize: 10, marginLeft: 2, fontWeight: 'bold' },
  roomTypeLabel: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  priceText: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginTop: 5 },
  perNight: { fontSize: 10, color: '#888', fontWeight: 'normal' },
  statusBadge: { flexDirection: 'row', alignItems: 'center' },
  statusText: { color: '#4ade80', fontSize: 9, marginLeft: 4, fontWeight: 'bold' },

  // Detail Modal
  detailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  detailContent: { backgroundColor: '#fff', height: '85%', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  closeModalBtn: { position: 'absolute', top: 20, right: 20, zIndex: 10, backgroundColor: '#fff', borderRadius: 20, padding: 5, elevation: 5 },
  detailImage: { width: '100%', height: 250 },
  detailBody: { padding: 20 },
  detailHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailTitle: { fontSize: 22, fontWeight: 'bold' },
  detailPrice: { fontSize: 20, fontWeight: 'bold', color: '#0d6efd' },
  detailMetaRow: { flexDirection: 'row', marginVertical: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  metaText: { fontSize: 12, color: '#666' },
  detailSectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  detailDesc: { color: '#555', lineHeight: 20 },
  reviewPlaceholder: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 10, marginTop: 5 },
  bookButton: { backgroundColor: '#000', margin: 20, padding: 18, borderRadius: 15, alignItems: 'center' },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Generic & Login
  burgerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row' },
  burgerMenuPanel: { width: '75%', height: '100%', backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 20 },
  burgerCloseArea: { width: '25%', height: '100%' },
  menuHeader: { marginBottom: 30, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 15 },
  menuTitle: { fontSize: 24, fontWeight: 'bold' },
  burgerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  burgerText: { fontSize: 16, color: '#222', marginLeft: 15, fontWeight: '600' },
  menuDivider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  optionText: { fontSize: 16, color: '#444', textAlign: 'center' },
  selectedOptionText: { color: '#0d6efd', fontWeight: 'bold' },
  closeBtn: { marginTop: 10, padding: 15, alignItems: 'center' },
  closeBtnText: { color: '#f87171', fontWeight: 'bold' },
  sectionTitle: { color: '#fff', fontSize: 18, marginHorizontal: 20, marginBottom: 15, fontWeight: '700' },
  listContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  columnWrapper: { justifyContent: 'space-between' },
  loginContainer: { flex: 1, backgroundColor: '#0a0a0a' },
  loginScroll: { flexGrow: 1, justifyContent: 'center', padding: 30 },
  loginHeader: { alignItems: 'center', marginBottom: 40 },
  loginLogo: { width: 80, height: 80, marginBottom: 20 },
  loginWelcome: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  loginSub: { color: '#888', fontSize: 14, marginTop: 5 },
  loginForm: { width: '100%' },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: '#333' },
  inputIcon: { marginRight: 10 },
  textInput: { flex: 1, color: '#fff', height: 50 },
  loginButton: { backgroundColor: '#fff', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  loginButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  registerLink: { marginTop: 20, alignItems: 'center' },
  registerText: { color: '#888', fontSize: 14 },
  blueText: { color: '#0d6efd', fontWeight: 'bold' }
});