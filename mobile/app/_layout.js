import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { ThemeProvider } from '../context/ThemeContext';
import AppLock from '../components/AppLock';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
          <AppLock>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)/login" />
              <Stack.Screen name="(auth)/signup" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="about" options={{ presentation: 'card' }} />
              <Stack.Screen name="contact" options={{ presentation: 'card' }} />
              <Stack.Screen name="settings" options={{ presentation: 'card' }} />
              <Stack.Screen name="chats/index" options={{ presentation: 'card' }} />
              <Stack.Screen name="chats/[id]" options={{ presentation: 'card' }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </AppLock>
        </ThemeProvider>
    </Provider>
  );
}
