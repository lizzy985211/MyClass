<template>
    <div>
      <h3>{{ studentName }} - Score Trend</h3>
      <div ref="chart" style="width:100%;height:400px;"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from "vue";
  import * as echarts from "echarts";
  import scoresData from "@/assets/json/scores.json";
  import examsData from "@/assets/json/exams.json";
  
  const props = defineProps({
    grade: String,
    subject: String,
    exam: String,
    studentId: String
  });
  
  const chart = ref(null);
  let myChart = null;
  
  const studentName = computed(()=>{
    const classes = Object.keys(scoresData[props.exam]?.[props.grade]||{});
    for(const c of classes){
      const s = scoresData[props.exam][props.grade][c][props.subject]?.find(s=>s.studentId===props.studentId);
      if(s) return s.name;
    }
    return '';
  });
  
  onMounted(()=>{
    const exams = Object.keys(scoresData).filter(e=>{
      return scoresData[e][props.grade]?.[Object.keys(scoresData[e][props.grade])[0]]?.[props.subject];
    }).sort();
  
    const scores = exams.map(e=>{
      const classes = Object.keys(scoresData[e][props.grade]);
      for(const c of classes){
        const s = scoresData[e][props.grade][c][props.subject]?.find(s=>s.studentId===props.studentId);
        if(s) return s.score;
      }
      return null;
    });
  
    myChart = echarts.init(chart.value);
    myChart.setOption({
      tooltip:{},
      xAxis:{ type:'category', data:exams },
      yAxis:{ type:'value' },
      series:[{ name:'Score', type:'line', data:scores }]
    });
  });
  </script>