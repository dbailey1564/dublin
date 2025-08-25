import { Link } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { useGame } from '../src/state/store';

export default function MainMenu() {
  const { profile } = useGame();
  return (
    <View style={{ flex:1, backgroundColor:'#0f172a', padding:16, gap:16, justifyContent:'center' }}>
      <Text style={{ color:'white', fontSize:28, fontWeight:'800', textAlign:'center' }}>Dublin</Text>
      <View style={{ backgroundColor:'#1f2937', borderRadius:12, padding:12 }}>
        <Text style={{ color:'white', textAlign:'center' }}>Level {profile.level} • XP {profile.xp}</Text>
        <Text style={{ color:'white', textAlign:'center' }}>Hints {profile.hintBank} • Rerolls {profile.rerollBank}</Text>
      </View>
      <Link href="/mode" asChild>
        <Pressable style={{ backgroundColor:'#22c55e', padding:14, borderRadius:12 }}>
          <Text style={{ color:'white', textAlign:'center', fontWeight:'700' }}>Play</Text>
        </Pressable>
      </Link>
    </View>
  );
}