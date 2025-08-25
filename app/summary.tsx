import { Link } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { useGame } from '../src/state/store';

export default function Summary() {
  const { banked, sideboard, profile } = useGame();
  return (
    <View style={{ flex:1, backgroundColor:'#0f172a', padding:16, gap:12, justifyContent:'center' }}>
      <Text style={{ color:'white', fontSize:22, textAlign:'center', fontWeight:'700' }}>Game Summary</Text>
      <Text style={{ color:'white', textAlign:'center' }}>Banked: {banked}</Text>
      <Text style={{ color:'white', textAlign:'center' }}>Sideboard: {sideboard}</Text>
      <Text style={{ color:'white', textAlign:'center' }}>Level {profile.level} • XP {profile.xp}</Text>
      <Link href="/" asChild>
        <Pressable style={{ backgroundColor:'#22c55e', padding:14, borderRadius:12, marginTop:8 }}>
          <Text style={{ color:'white', textAlign:'center', fontWeight:'700' }}>Main Menu</Text>
        </Pressable>
      </Link>
    </View>
  );
}