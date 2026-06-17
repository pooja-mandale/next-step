import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAddSchemeMutation, useUpdateSchemeMutation, useGetSchemesQuery } from '../../redux/api/schemeApi';

export default function SchemeFormScreen() {
  const router = useRouter();
  const { id, edit } = useLocalSearchParams();
  const isEdit = edit === 'true';
  
  const { data: schemes } = useGetSchemesQuery();
  const currentScheme = schemes?.find(s => s._id === id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [eligibilityCriteria, setEligibilityCriteria] = useState('');
  const [category, setCategory] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const [addScheme, { isLoading: isAdding }] = useAddSchemeMutation();
  const [updateScheme, { isLoading: isUpdating }] = useUpdateSchemeMutation();

  const isLoading = isAdding || isUpdating;

  useEffect(() => {
    if (isEdit && currentScheme) {
      setName(currentScheme.name);
      setDescription(currentScheme.description);
      setLink(currentScheme.link);
      setEligibilityCriteria(currentScheme.eligibilityCriteria);
      setCategory(currentScheme.category || '');
      setDeadline(currentScheme.deadline || '');
    }
  }, [isEdit, currentScheme]);

  const handleSubmit = async () => {
    if (!name || !description || !link || !eligibilityCriteria) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const data = { name, description, link, eligibilityCriteria, category, deadline };

    try {
      if (isEdit) {
        await updateScheme({ id, ...data }).unwrap();
        Alert.alert('Success', 'Scheme updated successfully');
      } else {
        await addScheme(data).unwrap();
        Alert.alert('Success', 'Scheme added successfully');
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', error.data?.message || `Failed to ${isEdit ? 'update' : 'add'} scheme`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-blue-600 px-6 pt-8 pb-10 rounded-b-[40px]">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-3xl font-bold">{isEdit ? 'Update Scheme' : 'Add New Scheme'}</Text>
        <Text className="text-blue-100 mt-1">{isEdit ? 'Modify details of the existing scheme' : 'Provide details for the new educational scheme'}</Text>
      </View>

      <View className="px-6 -mt-6">
        <View className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200">
          <View className="mb-5">
            <Text className="text-gray-700 font-semibold mb-2 ml-1">Scheme Name</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
              placeholder="e.g. National Scholarship Portal"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View className="mb-5">
            <Text className="text-gray-700 font-semibold mb-2 ml-1">Description</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 h-24"
              placeholder="Briefly describe the scheme..."
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View className="mb-5">
            <Text className="text-gray-700 font-semibold mb-2 ml-1">Application Link</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
              placeholder="https://example.com"
              value={link}
              onChangeText={setLink}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View className="mb-8">
            <Text className="text-gray-700 font-semibold mb-2 ml-1">Eligibility Criteria</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 h-24"
              placeholder="Who is eligible for this scheme?"
              multiline
              textAlignVertical="top"
              value={eligibilityCriteria}
              onChangeText={setEligibilityCriteria}
            />
          </View>

          <View className="mb-5">
            <Text className="text-gray-700 font-semibold mb-2 ml-1">Category</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
              placeholder="e.g. Scholarship, Loan"
              value={category}
              onChangeText={setCategory}
            />
          </View>

          <View className="mb-8">
            <Text className="text-gray-700 font-semibold mb-2 ml-1">Deadline</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
              placeholder="e.g. 31st Dec 2024"
              value={deadline}
              onChangeText={setDeadline}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className={`bg-blue-600 rounded-2xl py-4 items-center shadow-lg shadow-blue-300 ${isLoading ? 'opacity-70' : ''}`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name={isEdit ? "save-outline" : "add-circle-outline"} size={20} color="white" />
                <Text className="text-white text-lg font-bold ml-2"> {isEdit ? 'Update Scheme' : 'Publish Scheme'}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View className="h-10" />
    </ScrollView>
    </SafeAreaView>
  );
}
