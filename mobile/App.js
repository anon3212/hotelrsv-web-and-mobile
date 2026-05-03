import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import LandingScreen from './src/screens/LandingScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import RoomDetailScreen from './src/screens/RoomDetailScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [selectedRoom, setSelectedRoom] = useState(null);

  // 1. Splash/Landing Page
  if (showLanding) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <LandingScreen onGetStarted={() => setShowLanding(false)} />
      </SafeAreaProvider>
    );
  }

  // 2. Main App Logic
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      
      {isLoggedIn ? (
        /* --- AUTHENTICATED AREA --- */
        selectedRoom ? (
          <RoomDetailScreen 
            route={{ params: { item: selectedRoom } }} 
            onBack={() => setSelectedRoom(null)} 
          />
        ) : (
          <ExploreScreen 
            onLogout={() => setIsLoggedIn(false)} 
            onRoomPress={(room) => setSelectedRoom(room)} 
          />
        )
      ) : (
        /* --- UNAUTHENTICATED AREA --- */
        authMode === 'login' ? (
          <LoginScreen 
            onLogin={() => setIsLoggedIn(true)} 
            onGoToSignUp={() => setAuthMode('signup')} 
          />
        ) : (
          <SignUpScreen 
            onSignUp={() => setIsLoggedIn(true)} 
            onGoToLogin={() => setAuthMode('login')} 
          />
        )
      )}
    </SafeAreaProvider>
  );
}