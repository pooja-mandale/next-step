import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '../../redux/api/authApi';
import { setCredentials } from '../../redux/slices/authSlice';

export default function SignupScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isDark: dark, colors: c } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [mobileFocused, setMobileFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [register, { isLoading }] = useRegisterMutation();

  const handleSignup = async () => {
    if (!name || !email || !password || !mobile) {
      showToast('Please fill all fields', 'error');
      return;
    }
    try {
      await register({ name, email, password, mobile, role: 'student' }).unwrap();
      showToast('Account created successfully!', 'success');
      setTimeout(() => {
        router.replace({ pathname: '/(auth)/login', params: { registered: 'true' } });
      }, 1500);
    } catch (error) {
      const message = error.data?.message || 'Something went wrong';
      showToast(message, 'error');
    }
  };

  const inputStyle = (focused) => [
    styles.inputRow,
    { backgroundColor: c.inputBg, borderColor: c.inputBorder },
    focused && { borderColor: '#3B82F6', backgroundColor: c.inputFocusBg },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: c.bg }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <LinearGradient
          colors={dark ? ['#1a1a2e', '#16213e'] : ['#1E3A8A', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.iconBadge}>
            <Ionicons name="person-add-outline" size={28} color="#fff" />
          </View>
          <Text style={styles.headingTitle}>Create Account</Text>
          <Text style={styles.headingSubtitle}>Join Next Step today</Text>
        </LinearGradient>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: c.card }]}>

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: c.label }]}>Full Name</Text>
            <View style={inputStyle(nameFocused)}>
              <Ionicons name="person-outline" size={20} color={nameFocused ? '#3B82F6' : c.icon} />
              <TextInput
                style={[styles.input, { color: c.text }]}
                placeholder="John Doe"
                placeholderTextColor={c.placeholder}
                value={name}
                onChangeText={setName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: c.label }]}>Email Address</Text>
            <View style={inputStyle(emailFocused)}>
              <Ionicons name="mail-outline" size={20} color={emailFocused ? '#3B82F6' : c.icon} />
              <TextInput
                style={[styles.input, { color: c.text }]}
                placeholder="example@email.com"
                placeholderTextColor={c.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
          </View>

          {/* Mobile */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: c.label }]}>Mobile Number</Text>
            <View style={inputStyle(mobileFocused)}>
              <Ionicons name="call-outline" size={20} color={mobileFocused ? '#3B82F6' : c.icon} />
              <TextInput
                style={[styles.input, { color: c.text }]}
                placeholder="+91 98765 43210"
                placeholderTextColor={c.placeholder}
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                onFocus={() => setMobileFocused(true)}
                onBlur={() => setMobileFocused(false)}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: c.label }]}>Password</Text>
            <View style={inputStyle(passwordFocused)}>
              <Ionicons name="lock-closed-outline" size={20} color={passwordFocused ? '#3B82F6' : c.icon} />
              <TextInput
                style={[styles.input, { color: c.text }]}
                placeholder="••••••••"
                placeholderTextColor={c.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={c.icon}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignup}
            disabled={isLoading}
            activeOpacity={0.85}
            style={[styles.signUpBtn, isLoading && { opacity: 0.7 }]}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.signUpText}>Sign Up</Text>
            }
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.bottomRow}>
            <Text style={[styles.bottomPrompt, { color: c.subText }]}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.bottomLink}>Log In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>

      {/* ── Toast Notification ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.toast,
          {
            backgroundColor: toastType === 'success' ? (dark ? '#064e3b' : '#10B981') : (dark ? '#7f1d1d' : '#EF4444'),
            opacity: toastAnim,
            transform: [{
              translateY: toastAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            }],
          },
        ]}
      >
        <Ionicons name={toastType === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'} size={18} color="#fff" />
        <Text style={[styles.toastText, { color: '#fff' }]}>{toastMsg}</Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  header: {
    paddingTop: 60,
    paddingBottom: 60,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headingTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headingSubtitle: {
    color: '#BFDBFE',
    fontSize: 15,
    marginTop: 6,
  },

  card: {
    flex: 1,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -28,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 48,
  },

  fieldGroup: { marginBottom: 18 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    gap: 10,
  },
  input: { flex: 1, fontSize: 15 },

  signUpBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 28,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  signUpText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPrompt: { fontSize: 14 },
  bottomLink: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },
  toast: {
    position: 'absolute',
    bottom: 36,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
