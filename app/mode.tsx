import { Link } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { useGame } from '../src/state/store';

export default function ModeSelect() {
  const { leagueBracket } = useGame();
  return (
    <View style={{ flex:1, backgroundColor:'#0f172a', padding:16, gap:12, justifyContent:'center' }}>
      <Text style={{ color:'white', fontSize:22, fontWeight:'700', textAlign:'center' }}>Select Mode</Text>
      <Link href={{ pathname: '/game', params: { mode: 'SOLO' } }} asChild>
        <Pressable style={{ backgroundColor:'#334155', padding:16, borderRadius:12 }}>
          <Text style={{ color:'white', textAlign:'center', fontWeight:'600' }}>Solo</Text>
        </Pressable>
      </Link>
      <Link href={{ pathname: '/game', params: { mode: 'CPU' } }} asChild>
        <Pressable style={{ backgroundColor:'#334155', padding:16, borderRadius:12 }}>
          <Text style={{ color:'white', textAlign:'center', fontWeight:'600' }}>PvCPU</Text>
        </Pressable>
      </Link>
      <Link href={{ pathname: '/game', params: { mode: 'PVP' } }} asChild>
        <Pressable style={{ backgroundColor:'#334155', padding:16, borderRadius:12 }}>
          <Text style={{ color:'white', textAlign:'center', fontWeight:'600' }}>PvP • {leagueBracket}</Text>
        </Pressable>
      </Link>
      <Link href="/" asChild>
        <Pressable style={{ backgroundColor:'#64748b', padding:12, borderRadius:10, marginTop:8 }}>
          <Text style={{ color:'white', textAlign:'center' }}>Back</Text>
        </Pressable>
      </Link>
    </View>
  );
}