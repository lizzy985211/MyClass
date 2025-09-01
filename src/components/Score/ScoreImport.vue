<template>
    <div>
      <input type="file" @change="onFileChange" />
    </div>
  </template>
  
  <script setup>
  import * as XLSX from "xlsx";
  import scoresData from "@/assets/json/scores.json";
  
  const props = defineProps({ grade:String, className:String, subject:String, exam:String });
  
  const onFileChange = e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = evt=>{
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data,{type:"array"});
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      // 导入 rank 自动计算
      const sorted = jsonData.sort((a,b)=>b.score-a.score).map((s,i)=>({...s, rank:i+1}));
      if(!scoresData[props.exam]) scoresData[props.exam]={};
      if(!scoresData[props.exam][props.grade]) scoresData[props.exam][props.grade]={};
      if(!scoresData[props.exam][props.grade][props.className]) scoresData[props.exam][props.grade][props.className]={};
      scoresData[props.exam][props.grade][props.className][props.subject] = sorted;
      alert("Import success!");
      location.reload();
    };
    reader.readAsArrayBuffer(file);
  };
  </script>