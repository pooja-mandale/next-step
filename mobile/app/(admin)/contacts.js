import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGetContactsQuery } from '../../redux/api/contactApi';

export default function AdminContactsScreen() {
  const router = useRouter();
  const { data: contacts, isLoading, refetch } = useGetContactsQuery();

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
        <Text className="text-gray-900 text-2xl font-bold">Contact Inquiries</Text>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 24 }}
        renderItem={({ item }) => (
          <View className="bg-white border border-gray-100 rounded-3xl p-5 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center">
                  <Ionicons name="mail" size={20} color="#f97316" />
                </View>
                <View className="ml-3">
                  <Text className="text-gray-900 font-bold">{item.name}</Text>
                  <Text className="text-gray-500 text-xs">{item.email}</Text>
                </View>
              </View>
              <Text className="text-gray-400 text-[10px]">{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text className="text-blue-600 font-bold text-sm mb-1">{item.subject}</Text>
            <Text className="text-gray-700 text-sm leading-5">{item.message}</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="items-center py-20">
            <Ionicons name="chatbubbles-outline" size={60} color="#e2e8f0" />
            <Text className="text-gray-400 mt-4 text-lg">No inquiries yet</Text>
          </View>
        )}
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </SafeAreaView>
  );
}
