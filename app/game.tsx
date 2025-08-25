import { useLocalSearchParams, Link } from 'expo-router';
import { View, Text, Pressable, FlatList } from 'react-native';
import React from 'react';
import { useGame } from '../src/state/store';

function Die({ value, selected, held, onPress }:{ value:number; selected:boolean; held:boolean; onPress:()=>void }){
  return (
    <Pressable onPress={onPress} disabled={held} style={{
      width:72, height:72, borderRadius:14, padding:10,
      backgroundColor: held ? '#e2e8f0' : 'white',
      borderWidth: selected ? 2 : 0, borderColor: selected ? '#f59e0b' : 'transparent',
      justifyContent:'center', alignItems:'center', margin:6
    }}>
      <Text style={{ fontSize:20, fontWeight:'700' }}>{value}</Text>
    </Pressable>
  );
}

export default function GameScreen() {
  const params = useLocalSearchParams();
  const mode = (params.mode as string) || 'SOLO';
  const {
    dice, held, selected, sideboard, banked,
    toggleSelect, roll, keep, bank,
    profile, hintBank, rerollBank, useHint, useReroll, canCommitSelection, selectionPreview, allowFreeRoll
  } = useGame();

  const keepEnabled = canCommitSelection();
  const keepPreview = selectionPreview();

  return (
    <View style={{ flex:1, backgroundColor:'#0f172a', padding:12 }}>
      <View style={{ backgroundColor:'#1f2937', padding:10, borderRadius:10, marginBottom:10 }}>
        <Text style={{ color:'white', textAlign:'center' }}>Mode: {mode}</Text>
        <Text style={{ color:'white', textAlign:'center' }}>Banked {banked} • Sideboard {sideboard}</Text>
        {allowFreeRoll ? <Text style={{ color:'#22c55e', textAlign:'center' }}>Large Straight bonus awarded — you may roll again without keeping.</Text> : null}
      </View>

      <FlatList
        contentContainerStyle={{ alignItems:'center' }}
        data={dice.map((v,i)=>({ v, i }))}
        keyExtractor={it=>String(it.i)}
        numColumns={3}
        renderItem={({ item }) => (
          <Die
            value={item.v}
            selected={selected[item.i]}
            held={held[item.i]}
            onPress={()=>toggleSelect(item.i)}
          />
        )}
      />

      <View style={{ flexDirection:'row', gap:10, marginTop:8 }}>
        <Pressable onPress={roll} style={{ flex:1, backgroundColor:'#22c55e', padding:14, borderRadius:12 }}>
          <Text style={{ color:'white', textAlign:'center', fontWeight:'700' }}>Roll</Text>
        </Pressable>
        <Pressable onPress={keep} disabled={!keepEnabled} style={{ flex:1, backgroundColor: keepEnabled ? '#0ea5e9' : '#64748b', padding:14, borderRadius:12, opacity: keepEnabled ? 1 : 0.7 }}>
          <Text style={{ color:'white', textAlign:'center', fontWeight:'700' }}>
            {keepEnabled ? `Keep (+${keepPreview})` : 'Keep'}
          </Text>
        </Pressable>
        <Pressable onPress={bank} style={{ flex:1, backgroundColor:'#a855f7', padding:14, borderRadius:12 }}>
          <Text style={{ color:'white', textAlign:'center', fontWeight:'700' }}>Bank</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection:'row', gap:10, marginTop:8 }}>
        <Pressable onPress={useReroll} style={{ flex:1, backgroundColor:'#334155', padding:12, borderRadius:10 }}>
          <Text style={{ color:'white', textAlign:'center' }}>Reroll ({rerollBank})</Text>
        </Pressable>
        <Pressable onPress={useHint} style={{ flex:1, backgroundColor:'#f59e0b', padding:12, borderRadius:10 }}>
          <Text style={{ color:'white', textAlign:'center' }}>Hint ({hintBank})</Text>
        </Pressable>
        <Link href="/summary" asChild>
          <Pressable style={{ flex:1, backgroundColor:'#64748b', padding:12, borderRadius:10 }}>
            <Text style={{ color:'white', textAlign:'center' }}>End</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}