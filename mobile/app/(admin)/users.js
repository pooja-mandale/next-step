import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGetUsersQuery } from '../../redux/api/userApi';

export default function AdminUsersScreen() {
  const router = useRouter();
  const { data: users, isLoading, refetch } = useGetUsersQuery();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={28} color="#1e293b" />
        </TouchableOpacity>
        <Text className="text-gray-900 text-2xl font-bold">Manage Users</Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 24 }}
        renderItem={({ item }) => (
          <View className="bg-white border border-gray-100 rounded-3xl p-5 mb-4 shadow-sm flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center">
              <Ionicons name="person" size={24} color="#2563EB" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-gray-900 font-bold text-lg">{item.name}</Text>
              <Text className="text-gray-500 text-sm">{item.email}</Text>
              <Text className="text-gray-400 text-xs mt-1">Role: {item.role.toUpperCase()}</Text>
            </View>
            {item.mobile && (
              <View className="bg-slate-50 p-2 rounded-xl">
                <Ionicons name="call-outline" size={20} color="#64748b" />
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="items-center py-20">
            <Ionicons name="people-outline" size={60} color="#e2e8f0" />
            <Text className="text-gray-400 mt-4 text-lg">No users found</Text>
          </View>
        )}
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </SafeAreaView>
  );
}
