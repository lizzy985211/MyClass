<template>
    <div>
      <h3>{{ examName }} - {{ subject }} Quality Analysis</h3>
      <div ref="chart" style="width:100%;height:400px;"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from "vue";
  import * as echarts from "echarts";
  import scoresData from "@/assets/json/scores.json";
  import examsData from "@/assets/json/exams.json";
  
  const props = defineProps({ grade:String, subject:String, exam:String });
  const chart = ref(null);
  let myChart = null;
  
  const examName = computed(()=>{
    const e = examsData.find(e=>e.examId===props.exam);
    return e ? e.examName : props.exam;
  });
  
  onMounted(()=>{
    const data = scoresData[props.exam]?.[props.grade];
    if(!data) return;
  
    const classes = Object.keys(data);
    const qualityData = classes.map(c=>{
      const scores = data[c][props.subject]?.map(s=>s.score)||[];
      const avg = scores.reduce((a,b)=>a+b,0)/scores.length||0;
      return { name:c, value:avg.toFixed(2) };
    });
  
    myChart = echarts.init(chart.value);
    myChart.setOption({
      tooltip:{},
      xAxis:{ type:'category', data:qualityData.map(d=>d.name) },
      yAxis:{ type:'value' },
      series:[{ type:'bar', data:qualityData.map(d=>d.value) }]
    });
  });
  </script>