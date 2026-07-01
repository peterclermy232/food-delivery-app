import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, TextInput, Linking, Alert, Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { orderApi } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';

interface Props { navigation: any; route: any; }

const RatingWidget: React.FC<{ orderId: string; onRated: () => void }> = ({ orderId, onRated }) => {
  const [selected, setSelected] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await orderApi.rate(orderId, selected, comment);
      onRated();
    } catch {
      Alert.alert('Error', 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ marginTop: 12, padding: 16, backgroundColor: '#F4F6FA', borderRadius: 14 }}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.dark, marginBottom: 10 }}>Rate this delivery</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <TouchableOpacity key={n} onPress={() => setSelected(n)}>
            <Text style={{ fontSize: 28, color: n <= selected ? '#FBBF24' : Colors.border }}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        placeholder="Leave a comment (optional)"
        value={comment}
        onChangeText={setComment}
        style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 10, fontSize: 13, marginBottom: 10 }}
        multiline
      />
      <TouchableOpacity
        style={{ backgroundColor: selected ? Colors.primary : Colors.border, borderRadius: 10, padding: 12, alignItems: 'center' }}
        onPress={submit}
        disabled={!selected || submitting}
      >
        {submitting
          ? <ActivityIndicator size="small" color={Colors.white} />
          : <Text style={{ color: Colors.white, fontWeight: '700' }}>Submit Rating</Text>
        }
      </TouchableOpacity>
    </View>
  );
};

const STEPS = [
  { key: 'pending',   label: 'Your order has been received' },
  { key: 'confirmed', label: 'The restaurant confirmed your order' },
  { key: 'preparing', label: 'The restaurant is preparing your food' },
  { key: 'picked_up', label: 'Your order has been picked up for delivery' },
  { key: 'delivered', label: 'Your order has been delivered!' },
];

function buildRegion(
  restLat?: number, restLng?: number,
  riderLat?: number, riderLng?: number,
) {
  if (restLat && restLng && riderLat && riderLng) {
    const minLat = Math.min(restLat, riderLat);
    const maxLat = Math.max(restLat, riderLat);
    const minLng = Math.min(restLng, riderLng);
    const maxLng = Math.max(restLng, riderLng);
    const pad = 0.012;
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(maxLat - minLat + pad * 2, 0.025),
      longitudeDelta: Math.max(maxLng - minLng + pad * 2, 0.025),
    };
  }
  if (restLat && restLng) {
    return { latitude: restLat, longitude: restLng, latitudeDelta: 0.04, longitudeDelta: 0.04 };
  }
  return { latitude: -1.2921, longitude: 36.8219, latitudeDelta: 0.1, longitudeDelta: 0.1 };
}

export const TrackOrderScreen: React.FC<Props> = ({ navigation, route }) => {
  const orderId: string = route?.params?.orderId;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { fmt } = useCurrency();
  const mapRef = useRef<MapView>(null);
  const prevRiderCoord = useRef<{ latitude: number; longitude: number } | null>(null);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      const res = await orderApi.track(orderId);
      setOrder(res.data.data);
    } catch (e) {
      console.error('Failed to track order', e);
    }
  };

  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      await fetchOrder();
      setLoading(false);
    };
    initialFetch();
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(async () => {
      try {
        const res = await orderApi.track(orderId);
        setOrder(res.data.data);
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  // When rider coordinates update, animate the map to keep both markers in view
  useEffect(() => {
    if (!order?.riderLatitude || !order?.riderLongitude) return;
    const newCoord = { latitude: order.riderLatitude, longitude: order.riderLongitude };
    if (
      prevRiderCoord.current?.latitude === newCoord.latitude &&
      prevRiderCoord.current?.longitude === newCoord.longitude
    ) return;
    prevRiderCoord.current = newCoord;

    const region = buildRegion(
      order.restaurantLatitude, order.restaurantLongitude,
      order.riderLatitude, order.riderLongitude,
    );
    mapRef.current?.animateToRegion(region, 800);
  }, [order?.riderLatitude, order?.riderLongitude]);

  const currentStepIndex = STEPS.findIndex(s => s.key === (order?.status || 'pending'));
  const hasRiderOnMap = order?.status === 'picked_up' && order?.riderLatitude && order?.riderLongitude;
  const hasRestaurant = order?.restaurantLatitude && order?.restaurantLongitude;

  const initialRegion = buildRegion(
    order?.restaurantLatitude, order?.restaurantLongitude,
    order?.riderLatitude, order?.riderLongitude,
  );

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {/* Restaurant pin */}
        {hasRestaurant && (
          <Marker
            coordinate={{ latitude: order.restaurantLatitude, longitude: order.restaurantLongitude }}
            title={order.restaurantName}
            description="Pickup point"
          >
            <View style={styles.restaurantPin}>
              <Ionicons name="restaurant" size={16} color={Colors.white} />
            </View>
          </Marker>
        )}

        {/* Rider pin — only shown while in transit */}
        {hasRiderOnMap && (
          <Marker
            coordinate={{ latitude: order.riderLatitude, longitude: order.riderLongitude }}
            title={order.riderName || 'Rider'}
            description="Your rider"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.riderPin}>
              <Ionicons name="bicycle" size={18} color={Colors.white} />
            </View>
          </Marker>
        )}

        {/* Route line: restaurant → rider */}
        {hasRestaurant && hasRiderOnMap && (
          <Polyline
            coordinates={[
              { latitude: order.restaurantLatitude, longitude: order.restaurantLongitude },
              { latitude: order.riderLatitude, longitude: order.riderLongitude },
            ]}
            strokeColor={Colors.primary}
            strokeWidth={3}
            lineDashPattern={[8, 4]}
          />
        )}
      </MapView>

      {/* Back button overlay */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Main')}>
        <View style={styles.backCircle}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </View>
      </TouchableOpacity>

      {/* Title overlay */}
      <View style={styles.titleOverlay}>
        <Text style={styles.mapTitle}>Track Order</Text>
      </View>

      {/* Live badge — shown while rider is on the way */}
      {hasRiderOnMap && (
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      )}

      {/* Bottom sheet */}
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Order info */}
            <View style={styles.orderInfo}>
              <View style={styles.restaurantThumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.restaurantName}>{order?.restaurantName ?? '—'}</Text>
                <Text style={styles.orderedAt}>
                  {order?.createdAt ? `Ordered at ${new Date(order.createdAt).toLocaleString()}` : ''}
                </Text>
                <Text style={styles.orderNumber}>{order?.orderNumber ?? ''}</Text>
                <Text style={styles.orderTotal}>
                  {order?.totalAmount != null ? fmt(order.totalAmount) : ''}
                </Text>
              </View>
            </View>

            {/* ETA */}
            {order?.status !== 'delivered' && (
              <View style={styles.etaBox}>
                <Text style={styles.etaTime}>
                  {etaLabel(order?.status)}
                </Text>
                <Text style={styles.etaLabel}>ESTIMATED DELIVERY TIME</Text>
              </View>
            )}

            {/* Tracking steps */}
            {STEPS.map((step, i) => {
              const done = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <View key={step.key} style={styles.stepRow}>
                  <View style={styles.stepIndicator}>
                    <View style={[styles.stepDot, done && styles.stepDotActive, isCurrent && styles.stepDotCurrent]}>
                      {done && <Ionicons name="checkmark" size={10} color={Colors.white} />}
                    </View>
                    {i < STEPS.length - 1 && (
                      <View style={[styles.stepLine, done && styles.stepLineActive]} />
                    )}
                  </View>
                  <Text style={[styles.stepText, done && styles.stepTextActive, isCurrent && styles.stepTextCurrent]}>
                    {step.label}
                  </Text>
                </View>
              );
            })}

            {/* Rider row */}
            {order?.status === 'picked_up' && order?.riderName && (
              <View style={styles.courierRow}>
                <View style={styles.courierAvatar} />
                <View style={styles.courierInfo}>
                  <Text style={styles.courierName}>{order.riderName}</Text>
                  <Text style={styles.courierLabel}>Your Rider</Text>
                </View>
                {order?.riderPhone && (
                  <>
                    <TouchableOpacity
                      style={[styles.courierAction, { backgroundColor: Colors.primary }]}
                      onPress={() => Linking.openURL(`tel:${order.riderPhone}`)}
                    >
                      <Ionicons name="call" size={18} color={Colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.courierAction, { backgroundColor: Colors.primary }]}
                      onPress={() => Linking.openURL(`sms:${order.riderPhone}`)}
                    >
                      <Ionicons name="chatbubble" size={18} color={Colors.white} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {order && ['pending', 'confirmed', 'preparing', 'picked_up'].includes(order.status || '') && (
              <TouchableOpacity
                style={styles.raiseCaseBtn}
                onPress={() => navigation.navigate('RaiseCase', {
                  orderId: order.id,
                  orderNumber: order.orderNumber,
                })}
              >
                <Ionicons name="alert-circle-outline" size={18} color={Colors.error} />
                <Text style={styles.raiseCaseBtnText}>Something wrong? Raise a Case</Text>
              </TouchableOpacity>
            )}

            {order?.status === 'delivered' && !order?.ratingValue && (
              <RatingWidget orderId={order.id} onRated={() => fetchOrder()} />
            )}
            {order?.status === 'delivered' && order?.ratingValue && (
              <View style={styles.ratedBox}>
                <Text>You rated this delivery {'★'.repeat(order.ratingValue)}{'☆'.repeat(5 - order.ratingValue)}</Text>
                {order.ratingComment
                  ? <Text style={{ fontSize: 12, color: Colors.textSecondary }}>{order.ratingComment}</Text>
                  : null}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

function etaLabel(status?: string): string {
  if (status === 'pending') return '—';
  if (status === 'confirmed') return '~40 min';
  if (status === 'preparing') return '~25 min';
  if (status === 'picked_up') return '~10 min';
  return '—';
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.white },
  map:            { height: '45%' },
  backBtn:        { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 36, left: 20 },
  backCircle:     { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  titleOverlay:   { position: 'absolute', top: Platform.OS === 'ios' ? 62 : 42, left: 76 },
  mapTitle:       { fontSize: 17, fontWeight: '700', color: Colors.white, textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  liveBadge:      { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, right: 20, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  liveDot:        { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22C55E' },
  liveText:       { fontSize: 11, fontWeight: '800', color: Colors.white, letterSpacing: 1 },
  restaurantPin:  { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.warning, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.white },
  riderPin:       { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: Colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  sheet:          { flex: 1, backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, marginTop: -20 },
  sheetHandle:    { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orderInfo:      { flexDirection: 'row', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  restaurantThumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: Colors.inputBg },
  restaurantName: { fontSize: 15, fontWeight: '700', color: Colors.dark },
  orderedAt:      { fontSize: 12, color: Colors.textSecondary, marginBottom: 2 },
  orderNumber:    { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  orderTotal:     { fontSize: 14, fontWeight: '700', color: Colors.dark, marginTop: 2 },
  etaBox:         { alignItems: 'center', marginBottom: 16 },
  etaTime:        { fontSize: 36, fontWeight: '800', color: Colors.dark },
  etaLabel:       { fontSize: 11, color: Colors.textSecondary, letterSpacing: 0.8, fontWeight: '600' },
  stepRow:        { flexDirection: 'row', gap: 12, marginBottom: 8 },
  stepIndicator:  { alignItems: 'center', width: 20 },
  stepDot:        { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  stepDotActive:  { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stepDotCurrent: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stepLine:       { width: 2, height: 20, backgroundColor: Colors.border, marginTop: 2 },
  stepLineActive: { backgroundColor: Colors.primary },
  stepText:       { flex: 1, fontSize: 13, color: Colors.textSecondary, paddingTop: 2 },
  stepTextActive: { color: Colors.primary, fontWeight: '600' },
  stepTextCurrent: { color: Colors.primary, fontWeight: '700' },
  courierRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  courierAvatar:  { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.inputBg },
  courierInfo:    { flex: 1 },
  courierName:    { fontSize: 14, fontWeight: '700', color: Colors.dark },
  courierLabel:   { fontSize: 12, color: Colors.textSecondary },
  courierAction:  { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  raiseCaseBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, paddingVertical: 12, borderWidth: 1.5, borderColor: `${Colors.error}40`, borderRadius: 12 },
  raiseCaseBtnText: { fontSize: 13, color: Colors.error, fontWeight: '600' },
  ratedBox:       { marginTop: 12, padding: 16, backgroundColor: '#F4F6FA', borderRadius: 14, alignItems: 'center' },
});
