import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LandingScreen from './src/screens/LandingScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import RoomDetailScreen from './src/screens/RoomDetailScreen';
import BookingScreen from './src/screens/BookingScreen';
import ConfirmationScreen from './src/screens/ConfirmationScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import { authAPI } from './src/services/api';

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationId, setConfirmationId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const restoreToken = async () => {
      const token = await AsyncStorage.getItem('authToken');
      setIsLoggedIn(!!token);
      setAuthLoading(false);
    };

    restoreToken();
  }, []);

  const handleLogout = async () => {
    await authAPI.logout();
    setIsLoggedIn(false);
    setShowProfile(false);
    setShowBooking(false);
    setShowConfirmation(false);
    setSelectedRoom(null);
    setBookingData(null);
  };

  // 1. Splash/Landing Page
  if (showLanding) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <LandingScreen onGetStarted={() => setShowLanding(false)} />
      </SafeAreaProvider>
    );
  }

  if (authLoading) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
      </SafeAreaProvider>
    );
  }

  // 2. Main App Logic
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      
      {isLoggedIn ? (
        /* --- AUTHENTICATED AREA --- */
        showProfile ? (
          <UserProfileScreen
            onLogout={handleLogout}
            onBookingPress={(bookingId) => {
              setShowProfile(false);
            }}
            onGoHome={() => setShowProfile(false)}
          />
        ) : showConfirmation ? (
          <ConfirmationScreen
            route={{ params: { reservationId: confirmationId } }}
            onComplete={() => {
              setShowConfirmation(false);
              setShowProfile(false);
              setSelectedRoom(null);
              setShowBooking(false);
            }}
          />
        ) : showBooking ? (
          <BookingScreen
            route={{ params: { room: bookingData } }}
            onConfirmation={(reservation) => {
              setConfirmationId(reservation.id);
              setShowConfirmation(true);
              setShowBooking(false);
            }}
            onCancel={() => {
              setShowBooking(false);
              setSelectedRoom(null);
            }}
          />
        ) : selectedRoom ? (
          <RoomDetailScreen 
            route={{ params: { item: selectedRoom } }} 
            onBack={() => setSelectedRoom(null)}
            onBooking={(room) => {
              setBookingData(room);
              setShowBooking(true);
            }}
          />
        ) : (
          <ExploreScreen 
            onLogout={() => setIsLoggedIn(false)} 
            onRoomPress={(room) => setSelectedRoom(room)}
            onProfilePress={() => setShowProfile(true)}
          />
        )
      ) : (
        /* --- UNAUTHENTICATED AREA --- */
        authMode === 'login' ? (
          <LoginScreen 
            onLoginSuccess={() => setIsLoggedIn(true)} 
            onGoToSignUp={() => setAuthMode('signup')} 
          />
        ) : (
          <SignUpScreen 
            onSignUpSuccess={() => setIsLoggedIn(true)} 
            onGoToLogin={() => setAuthMode('login')} 
          />
        )
      )}
    </SafeAreaProvider>
  );
}