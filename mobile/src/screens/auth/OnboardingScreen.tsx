import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, ListRenderItem,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Button } from '../../components/common/Button';

const { width } = Dimensions.get('window');

const slides = [
  { id: '1', title: 'All your favorites', description: 'Get all your loved foods in one once place, you just place the orer we do the rest' },
  { id: '2', title: 'All your favorites', description: 'Get all your loved foods in one once place, you just place the orer we do the rest' },
  { id: '3', title: 'Order from choosen chef', description: 'Get all your loved foods in one once place, you just place the orer we do the rest' },
  { id: '4', title: 'Free delivery offers', description: 'Get all your loved foods in one once place, you just place the orer we do the rest' },
];

interface Props {
  navigation: any;
}

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(prev => prev + 1);
    } else {
      navigation.replace('LocationPermission');
    }
  };

  const renderSlide: ListRenderItem<typeof slides[0]> = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.imagePlaceholder} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const isLast = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onMomentumScrollEnd={e => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
      />

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          title={isLast ? 'GET STARTED' : 'NEXT'}
          onPress={handleNext}
          style={styles.btn}
        />
        {!isLast && (
          <TouchableOpacity onPress={() => navigation.replace('LocationPermission')} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  slide: { width, flex: 1, alignItems: 'center', paddingHorizontal: 32, paddingTop: 60 },
  imagePlaceholder: {
    width: width * 0.7, height: width * 0.7,
    backgroundColor: Colors.inputBg, borderRadius: 24, marginBottom: 40,
  },
  title: { fontSize: 24, fontWeight: '700', color: Colors.dark, textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary, width: 16 },
  footer: { paddingHorizontal: 24, paddingBottom: 48 },
  btn: { width: '100%', marginBottom: 12 },
  skipBtn: { alignItems: 'center', padding: 8 },
  skipText: { fontSize: 14, color: Colors.textSecondary },
});
