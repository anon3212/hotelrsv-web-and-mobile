import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, ImageBackground, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function SignUpScreen({ onSignUp, onGoToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ImageBackground source={require('../../assets/bg.jpg')} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.overlay}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join BookInn for exclusive deals</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color="#666" />
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#666"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color="#666" />
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#666"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color="#666" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#666"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={onSignUp}>
            <Text style={styles.loginBtnText}>Create Account</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onGoToLogin}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(11, 15, 23, 0.9)', justifyContent: 'center', padding: 30 },
  header: { marginBottom: 40 },
  title: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  subtitle: { color: '#888', fontSize: 16, marginTop: 10 },
  form: { gap: 20 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1A2129', 
    borderRadius: 15, 
    paddingHorizontal: 15, 
    height: 60,
    borderWidth: 1,
    borderColor: '#333'
  },
  input: { flex: 1, color: '#fff', marginLeft: 10, fontSize: 16 },
  loginBtn: { 
    backgroundColor: '#00BFA5', 
    height: 60, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 10 
  },
  loginBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#888' },
  linkText: { color: '#00BFA5', fontWeight: 'bold' }
});