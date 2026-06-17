import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { useGetSchemesQuery, useDeleteSchemeMutation } from '../../redux/api/schemeApi';

export default function AdminDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: schemes, isLoading, refetch } = useGetSchemesQuery();
  const [deleteScheme] = useDeleteSchemeMutation();

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/(auth)/login');
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Scheme',
      'Are you sure you want to delete this scheme?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteScheme(id).unwrap();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete scheme');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Admin Header */}
      <View className="px-6 pt-4 pb-6 bg-white flex-row justify-between items-center border-b border-gray-100 rounded-b-[40px] shadow-sm shadow-slate-100">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.push('/(admin)/sidebar')}
            className="w-12 h-12 rounded-2xl bg-slate-50 items-center justify-center mr-4"
          >
            <Ionicons name="grid-outline" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View>
            <View className="flex-row items-center mb-1">
              <Ionicons name="school" size={16} color="#2563EB" />
              <Text className="text-blue-600 font-bold text-sm ml-1">Next Step</Text>
            </View>
            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Admin Portal</Text>
            <Text className="text-gray-900 text-xl font-bold">Manage Schemes</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={handleLogout}
          className="w-12 h-12 rounded-2xl bg-red-50 items-center justify-center"
        >
          <Ionicons name="power" size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={schemes}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="bg-white rounded-[32px] p-6 mb-5 shadow-sm shadow-slate-100 border border-gray-50">
            <View className="flex-row justify-between items-center mb-3">
              <View className="bg-blue-50 px-3 py-1 rounded-full">
                <Text className="text-blue-600 text-[10px] font-bold uppercase">Active</Text>
              </View>
              <View className="flex-row">
                <TouchableOpacity 
                  onPress={() => router.push({ pathname: '/(admin)/schemes', params: { id: item._id, edit: true } })}
                  className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center mr-2"
                >
                  <Ionicons name="pencil" size={18} color="#2563EB" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDelete(item._id)}
                  className="w-9 h-9 rounded-xl bg-red-50 items-center justify-center"
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
            
            <Text className="text-gray-900 text-lg font-bold mb-2">{item.name}</Text>
            <Text className="text-gray-500 text-sm leading-5 mb-4" numberOfLines={2}>{item.description}</Text>
            
            <View className="flex-row items-center border-t border-gray-50 pt-4">
              <Ionicons name="link-outline" size={14} color="#94a3b8" />
              <Text className="text-gray-400 text-xs ml-2 flex-1" numberOfLines={1}>{item.link}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="items-center py-24">
            <View className="w-20 h-20 rounded-full bg-white items-center justify-center shadow-sm border border-gray-100 mb-4">
              <Ionicons name="document-text-outline" size={40} color="#cbd5e1" />
            </View>
            <Text className="text-gray-400 font-medium">No schemes available</Text>
          </View>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => router.push('/(admin)/schemes')}
        className="absolute bottom-8 right-6 w-16 h-16 bg-blue-600 rounded-3xl justify-center items-center shadow-xl shadow-blue-300"
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

