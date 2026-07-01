import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { reviewApi } from '../../services/api';

interface Props { navigation: any; route: any; }

export const ReviewsScreen: React.FC<Props> = ({ navigation, route }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const restaurantId = route?.params?.restaurantId;

  useEffect(() => {
    if (!restaurantId) { setLoading(false); return; }
    reviewApi.getByRestaurant(restaurantId)
      .then(r => setReviews(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const renderStars = (rating: number) => (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map(s => (
        <Ionicons key={s} name={s <= rating ? 'star' : 'star-outline'} size={14} color={Colors.primary} />
      ))}
    </View>
  );

  const renderReview: ListRenderItem<any> = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatar} />
        <View style={styles.reviewMeta}>
          <Text style={styles.reviewTitle}>{item.userName || 'Anonymous'}</Text>
          {renderStars(item.rating || 0)}
          <Text style={styles.reviewDate}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.reviewText}>{item.comment}</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
      <Ionicons name="star-outline" size={52} color={Colors.border} />
      <Text style={{ fontSize: 16, fontWeight: '700', marginTop: 12 }}>No reviews yet</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backBtn}><Text style={styles.backArrow}>‹</Text></View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {route?.params?.restaurantName ? `${route.params.restaurantName} Reviews` : 'Reviews'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={item => item.id}
          renderItem={renderReview}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: Colors.dark, lineHeight: 28 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 20, gap: 16 },
  reviewCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border },
  reviewHeader: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.inputBg },
  reviewMeta: { flex: 1 },
  reviewTitle: { fontSize: 14, fontWeight: '700', color: Colors.dark, marginBottom: 4 },
  stars: { flexDirection: 'row', gap: 2, marginBottom: 2 },
  reviewDate: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  reviewText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
});
