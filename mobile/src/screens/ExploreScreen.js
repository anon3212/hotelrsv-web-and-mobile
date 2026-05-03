import React, { useEffect, useState } from 'react';
import { 
  View, Text, ScrollView, ImageBackground, StyleSheet, 
  TextInput, TouchableOpacity, FlatList, Dimensions 
} from 'react-native';
import { Feather } from '@expo/vector-icons'; 
import { BASE_URL } from '../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 50) / 2; 

const CATEGORIES = ['All', 'Standard', 'Deluxe', 'Suite'];

export default function ExploreScreen({ onLogout, onRoomPress }) {
  const [rooms, setRooms] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/rooms/`);
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  // Filter rooms based on the selected category
  const filteredRooms = activeCategory === 'All' 
    ? rooms 
    : rooms.filter(room => room.category === activeCategory);

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Good morning 👋</Text>
          <Text style={styles.mainTitle}>Find your room</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput 
          placeholder="Search rooms, amenities..." 
          placeholderTextColor="#666"
          style={styles.searchInput}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity 
            key={cat} 
            onPress={() => setActiveCategory(cat)}
            style={[styles.categoryBtn, activeCategory === cat && styles.categoryBtnActive]}
          >
            <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Available rooms</Text>
    </View>
  );

  return (
    <ImageBackground 
      source={require('../../assets/bg.jpg')} 
      style={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <FlatList
          data={filteredRooms} // Uses filtered data
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listPadding}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            /* FIX: Wrapped in TouchableOpacity to make it clickable */
            <TouchableOpacity 
              style={styles.card} 
              activeOpacity={0.8}
              onPress={() => onRoomPress(item)} 
            >
              <ImageBackground 
                source={{ uri: `${BASE_URL}${item.image}` }} 
                style={styles.cardImage}
                imageStyle={{ borderRadius: 20 }}
                resizeMode='cover'
              >
                <View style={styles.availableTag}>
                  <Text style={styles.availableText}>Available</Text>
                </View>
              </ImageBackground>
              <View style={styles.cardFooter}>
                <Text style={styles.roomName} numberOfLines={1}>{item.name || 'Standard'}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>₱{item.price || '999'}</Text>
                  <Text style={styles.perNight}>/night</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.bottomNav}>
         <View style={styles.navItem}>
           <Feather name="bar-chart-2" size={24} color="#00BFA5" />
           <Text style={styles.navTextActive}>Explore</Text>
         </View>
         <TouchableOpacity style={styles.navItem} onPress={onLogout}>
           <Feather name="log-out" size={24} color="#666" />
           <Text style={styles.navText}>Logout</Text>
         </TouchableOpacity>
         <View style={styles.navItem}>
           <Feather name="user" size={24} color="#666" />
           <Text style={styles.navText}>Profile</Text>
         </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(11, 15, 23, 0.9)' },
  listPadding: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 60, marginBottom: 25 },
  greetingText: { color: '#888', fontSize: 16 },
  mainTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  avatarCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#00BFA5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', backgroundColor: '#1A2129', borderRadius: 15, alignItems: 'center', paddingHorizontal: 15, height: 55 },
  searchIcon: { marginRight: 10 },
  searchInput: { color: '#fff', flex: 1, fontSize: 16 },
  categoryScroll: { marginVertical: 25 },
  categoryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginRight: 10, backgroundColor: 'transparent' },
  categoryBtnActive: { backgroundColor: '#1A2129', borderWidth: 1, borderColor: '#333' },
  categoryText: { color: '#444', fontSize: 14, fontWeight: '600' },
  categoryTextActive: { color: '#fff' },
  sectionTitle: { color: '#888', fontSize: 16, marginBottom: 15 },
  row: { justifyContent: 'space-between' },
  card: { width: CARD_WIDTH, marginBottom: 20, backgroundColor: '#1A2129', borderRadius: 25, padding: 8 },
  cardImage: { width: '100%', height: 130, justifyContent: 'flex-start', alignItems: 'flex-end', padding: 8, overflow:'hidden' },
  availableTag: { backgroundColor: '#00BFA5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  availableText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  cardFooter: { padding: 8 },
  roomName: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  priceText: { color: '#00BFA5', fontSize: 16, fontWeight: 'bold' },
  perNight: { color: '#666', fontSize: 10, marginLeft: 2 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#0B0F17', paddingVertical: 15, borderTopWidth: 0.5, borderTopColor: '#222', position: 'absolute', bottom: 0, width: '100%' },
  navItem: { alignItems: 'center' },
  navText: { color: '#666', fontSize: 12, marginTop: 4 },
  navTextActive: { color: '#00BFA5', fontSize: 12, marginTop: 4 }
});