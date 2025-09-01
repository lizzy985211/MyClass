<template>
    <div ref="chart" style="width:100%;height:400px;"></div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, computed } from "vue";
  import * as echarts from "echarts";
  import scoresData from "@/assets/json/scores.json";
  
  const props = defineProps({ grade:String, subject:String, exam:String });
  const chart = ref(null);
  let myChart = null;
  
  const classes = computed(()=>Object.keys(scoresData[props.exam]?.[props.grade]||{}));
  const option = computed(()=>{
    const series = classes.value.map(c=>{
      const students = scoresData[props.exam][props.grade][c][props.subject]||[];
      return { name:c, type:'bar', data:students.map(s=>s.score) };
    });
    const studentNames = scoresData[props.exam][props.grade][classes.value[0]]?.[props.subject]?.map(s=>s.name)||[];
    return { tooltip:{}, legend:{data:classes.value}, xAxis:{type:'category', data:studentNames}, yAxis:{type:'value'}, series };
  });
  
  onMounted(()=>{
    myChart = echarts.init(chart.value);
    myChart.setOption(option.value);
  });
  watch(option, (newVal)=>{ if(myChart) myChart.setOption(newVal); });
  </script>