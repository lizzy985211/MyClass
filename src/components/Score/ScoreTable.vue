<template>
    <table border="1" style="width:100%">
      <thead>
        <tr>
          <th>Rank</th><th>ID</th><th>Name</th><th>Gender</th><th>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in scores" :key="s.studentId">
          <td>{{ s.rank }}</td>
          <td>{{ s.studentId }}</td>
          <td>{{ s.name }}</td>
          <td>{{ s.gender }}</td>
          <td>{{ s.score }}</td>
        </tr>
      </tbody>
    </table>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import scoresData from "@/assets/json/scores.json";
  
  const props = defineProps({ grade:String, className:String, subject:String, exam:String });
  const scores = ref([]);
  
  onMounted(()=>{
    const list = scoresData[props.exam]?.[props.grade]?.[props.className]?.[props.subject]||[];
    scores.value = list.sort((a,b)=>b.score-a.score).map((s,i)=>({...s, rank:i+1}));
  });
  </script>