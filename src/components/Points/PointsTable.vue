<template>
    <table border="1" style="width:100%">
      <thead>
        <tr>
          <th>Rank</th><th>ID</th><th>Name</th><th>Points</th><th>Reason</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in points" :key="s.studentId">
          <td>{{ s.rank }}</td>
          <td>{{ s.studentId }}</td>
          <td>{{ s.name }}</td>
          <td>{{ s.points }}</td>
          <td>{{ s.reason }}</td>
        </tr>
      </tbody>
    </table>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import pointsData from "@/assets/json/points.json";
  
  const props = defineProps({ grade:String, className:String });
  const points = ref([]);
  
  onMounted(()=>{
    const list = pointsData[props.grade]?.[props.className]||[];
    points.value = list.sort((a,b)=>b.points-a.points).map((p,i)=>({...p, rank:i+1}));
  });
  </script>