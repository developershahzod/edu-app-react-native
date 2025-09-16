/* eslint-disable @typescript-eslint/naming-convention */
import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import { useTheme } from '@lib/ui/hooks/useTheme';

export const PlacesNavigator = () => {
  const theme = useTheme();
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/854/854878.png' }} // 🗺️ Map icon
        style={styles.image}
      />
      <Text style={[styles.title, { color: theme.colors.text }]}>Coming Soon...</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Interactive maps will be available soon. Stay tuned!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 20,
    opacity: 0.85,
  },
  title: {
    fontSize: 28,
  
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});