import React from 'react';
import { StatusBar } from 'react-native';
import LoginScreen from './src/screens/auth/LoginScreen'; // <-- points to your screen in src/

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <LoginScreen />
    </>
  );
}
