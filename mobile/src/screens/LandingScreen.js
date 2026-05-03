import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';

export default function LandingScreen({ onGetStarted }) {
  return (
    <ImageBackground 
      source={require('../../assets/bg.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Your perfect stay awaits</Text>
          <Text style={styles.subtitle}>Experience luxury in the heart of the Philippines</Text>
          
          <TouchableOpacity style={styles.button} onPress={onGetStarted}>
            <Text style={styles.buttonText}>Explore Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.35)', // Darkens the image slightly for text readability
    justifyContent: 'flex-end', 
    padding: 30 
  },
  content: { marginBottom: 50 },
  title: { color: '#fff', fontSize: 40, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#eee', fontSize: 16, marginBottom: 30 },
  button: { 
    backgroundColor: '#004D40', 
    paddingVertical: 15, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});