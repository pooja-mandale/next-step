import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetSchemesQuery } from '../../redux/api/schemeApi';

const { width } = Dimensions.get('window');

// Static images for the carousel
const CAROUSEL_IMAGES = [
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
];

export default function SchemeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  
  // Use the existing query to get the scheme data. 
  // It should be cached if we just came from the list screen.
  const { data: schemes, isLoading } = useGetSchemesQuery();
  
  const scheme = schemes?.find(s => s._id === id);

  useEffect(() => {
    const interval = setInterval(() => {
      let nextSlide = activeSlide + 1;
      if (nextSlide >= CAROUSEL_IMAGES.length) {
        nextSlide = 0;
      }
      setActiveSlide(nextSlide);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: nextSlide * width, animated: true });
      }
    }, 3000); // 3 seconds interval

    return () => clearInterval(interval);
  }, [activeSlide]);


  const handleApply = () => {
    if (scheme?.link) {
      Linking.openURL(scheme.link).catch((err) => console.error("Couldn't load page", err));
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!scheme) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-xl font-bold">Scheme Not Found</Text>
        </View>
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="alert-circle-outline" size={64} color="#94a3b8" />
          <Text className="text-gray-500 mt-4 text-center">The scheme you are looking for does not exist or has been removed.</Text>
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mt-6 bg-blue-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-bold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white z-10">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-gray-900 text-xl font-bold flex-1" numberOfLines={1}>
          Scheme Details
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Carousel */}
        <View className="h-64 bg-gray-100">
          <ScrollView 
            ref={scrollViewRef}
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const slide = Math.round(event.nativeEvent.contentOffset.x / width);
              setActiveSlide(slide);
            }}
          >
            {CAROUSEL_IMAGES.map((imgUrl, index) => (
              <Image 
                key={index}
                source={{ uri: imgUrl }}
                style={{ width, height: 256 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View className="absolute bottom-4 flex-row w-full justify-center space-x-2">
            {CAROUSEL_IMAGES.map((_, index) => (
              <View 
                key={index} 
                className={`h-2 rounded-full ${index === activeSlide ? 'bg-blue-600 w-4' : 'bg-white opacity-70 w-2'}`}
                style={index > 0 ? { marginLeft: 8 } : {}}
              />
            ))}
          </View>
        </View>

        {/* Details Section */}
        <View className="p-6">
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900 mb-2">{scheme.name}</Text>
            <View className="flex-row items-center bg-blue-50 self-start px-3 py-1 rounded-full">
              <Ionicons name="shield-checkmark" size={16} color="#2563EB" />
              <Text className="text-blue-700 text-xs font-semibold ml-1">Government Scheme</Text>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-2">Description</Text>
            <Text className="text-gray-600 leading-6 text-base">
              {scheme.description}
            </Text>
          </View>

          <View className="mb-8">
            <Text className="text-lg font-bold text-gray-900 mb-2">Eligibility Criteria</Text>
            <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <View className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" className="mt-0.5 mr-2" />
                <Text className="text-gray-700 leading-6 flex-1 text-base">
                  {scheme.eligibilityCriteria}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Buttons */}
      <View className="p-4 bg-white border-t border-gray-100 pb-8 shadow-lg shadow-gray-200 flex-row">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="flex-1 bg-slate-100 py-4 rounded-2xl flex-row justify-center items-center mr-3"
        >
          <Text className="text-gray-700 font-bold text-lg">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleApply}
          className="flex-1 bg-blue-600 py-4 rounded-2xl flex-row justify-center items-center"
        >
          <Text className="text-white font-bold text-lg mr-2">Apply Now</Text>
          <Ionicons name="open-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
