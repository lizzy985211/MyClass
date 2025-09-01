<template>
    <div>
      <NavBar :grade="grade" :className="className" :subject="subject" />
      <ExamSelector :grade="grade" :className="className" :subject="subject" :exam="exam" />
  
      <div class="segmented-control">
        <button :class="{active:mode==='score'}" @click="mode='score'">Score</button>
        <button :class="{active:mode==='points'}" @click="mode='points'">Points</button>
        <button :class="{active:mode==='charts'}" @click="mode='charts'">Charts</button>
      </div>
  
      <div class="content">
        <div v-if="mode==='score'">
          <ScoreImport :grade="grade" :className="className" :subject="subject" :exam="exam"/>
          <ScoreTable :grade="grade" :className="className" :subject="subject" :exam="exam"/>
        </div>
        <div v-else-if="mode==='points'">
          <PointsTable :grade="grade" :className="className"/>
        </div>
        <div v-else-if="mode==='charts'">
          <ChartClassCompare :grade="grade" :subject="subject" :exam="exam"/>
          <ChartStudentTrend :grade="grade" :subject="subject" :exam="exam" :studentId="'20250101'"/>
          <ChartQualityAnalysis :grade="grade" :subject="subject" :exam="exam"/>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import { useRoute } from "vue-router";
  
  import NavBar from "@/components/NavBar.vue";
  import ExamSelector from "@/components/ExamSelector.vue";
  import ScoreImport from "@/components/Score/ScoreImport.vue";
  import ScoreTable from "@/components/Score/ScoreTable.vue";
  import PointsTable from "@/components/Points/PointsTable.vue";
  import ChartClassCompare from "@/components/Charts/ChartClassCompare.vue";
  import ChartStudentTrend from "@/components/Charts/ChartStudentTrend.vue";
  import ChartQualityAnalysis from "@/components/Charts/ChartQualityAnalysis.vue";
  
  const route = useRoute();
  const grade = route.params.grade;
  const className = route.params.className;
  const subject = route.params.subject;
  const exam = route.params.exam;
  
  const mode = ref("score");
  </script>
  
  <style scoped>
  .segmented-control{display:flex;margin:8px 0;}
  .segmented-control button{flex:1;padding:8px;background:#f5f5f5;border:1px solid #ddd;cursor:pointer;}
  .segmented-control button.active{background:#007bff;color:#fff;}
  .content{padding:12px;}
  </style>