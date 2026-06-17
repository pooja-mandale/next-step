import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

export default function AdminSidebar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/(auth)/login');
  };

  const SidebarItem = ({ title, icon, route }) => (
    <TouchableOpacity 
      onPress={() => router.push(route)}
      className="flex-row items-center px-6 py-5 border-b border-gray-50"
    >
      <Ionicons name={icon} size={24} color="#475569" />
      <Text className="ml-4 text-gray-700 text-lg font-medium">{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-8 bg-blue-600">
        <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center mb-4">
          <Ionicons name="person" size={32} color="white" />
        </View>
        <Text className="text-white text-xl font-bold">{user?.name || 'Admin'}</Text>
        <Text className="text-blue-100 text-sm">{user?.email}</Text>
      </View>

      <View className="mt-4">
        <SidebarItem title="Dashboard" icon="grid-outline" route="/(admin)" />
        <SidebarItem title="Manage Users" icon="people-outline" route="/(admin)/users" />
        <SidebarItem title="Contact Inquiries" icon="chatbubbles-outline" route="/(admin)/contacts" />
      </View>

      <View className="flex-1" />

      <TouchableOpacity 
        onPress={handleLogout}
        className="flex-row items-center px-6 py-8 border-t border-gray-100"
      >
        <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        <Text className="ml-4 text-red-500 text-lg font-bold">Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
