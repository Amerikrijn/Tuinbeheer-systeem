import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-url-polyfill/auto';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#16a34a" />
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Tuinbeheer', headerShown: false }} />
        <Stack.Screen name="gardens" options={{ title: 'Mijn Tuinen' }} />
        <Stack.Screen name="garden/[id]" options={{ title: 'Tuin Details' }} />
        <Stack.Screen name="plantbed/[id]" options={{ title: 'Plantvak' }} />
      </Stack>
    </>
  );
}