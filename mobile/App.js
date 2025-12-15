import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, I18nManager, ScrollView } from 'react-native';
import React, { useEffect } from 'react';

// Force RTL
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function App() {
  useEffect(() => {
    // Reload if RTL status changes (in a real app, you'd handle this more gracefully)
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
      // Updates.reloadAsync(); // Requires expo-updates
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>مجتمع الكتاب</Text>
      <Text style={styles.subtitle}>Book Community (Mobile)</Text>
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardText}>مرحباً بكم في مجتمع القراءة</Text>
          <Text style={styles.cardText}>Welcome to the Reading Community</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardText}>هنا ستظهر قائمة الكتب...</Text>
          <Text style={styles.cardText}>Book list will appear here...</Text>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center', // In RTL, 'flex-start' is usually right if configured correctly, but 'center' is safe for now
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    width: '100%',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'flex-start', // Ensure text aligns based on RTL
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'left', // React Native RTL text alignment can be tricky, often 'left' means logical start
    writingDirection: 'rtl',
  }
});
