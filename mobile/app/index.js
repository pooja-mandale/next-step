import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { getItem } from '../utils/storage';

const { width, height } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function SplashScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    // Check for existing session
    const checkSession = async () => {
      try {
        const token = await getItem('userToken');

        if (token) {
          // Token found — try to restore session from server
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const user = await res.json();
            // ✅ Valid session — restore user + skip login
            dispatch(setCredentials({ user, token, justLoggedIn: false }));
            setTimeout(() => router.replace('/(tabs)'), 1800);
            return;
          }
        }
      } catch (e) {
        // Network error or bad token — fall through to login
      }

      // No valid session — go to login
      setTimeout(() => router.replace('/(auth)/login'), 2500);
    };

    checkSession();
  }, []);

  return (
    <LinearGradient
      colors={['#1E3A8A', '#1E40AF', '#1D4ED8']}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>NEXT STEP</Text>
        <Text style={styles.subtitle}>Elevate Your Learning</Text>
      </Animated.View>

      <View style={styles.bottom}>
        <Text style={styles.poweredBy}>Powered by Advanced AI</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center' },
  logo: { width: 160, height: 160, borderRadius: 32 },
  title: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 24, letterSpacing: 6 },
  subtitle: { color: '#BFDBFE', fontSize: 16, marginTop: 8, fontWeight: '500' },
  bottom: { position: 'absolute', bottom: 48 },
  poweredBy: { color: '#93C5FD', fontSize: 13, fontWeight: '300' },
});
