<template>
    <div class="exam-selector">
      <label>Exam:</label>
      <select v-model="selectedExam" @change="onChange">
        <option v-for="exam in examsList" :key="exam.examId" :value="exam.examId">{{ exam.examName }}</option>
      </select>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from "vue";
  import { useRouter } from "vue-router";
  import exams from "@/assets/json/exams.json";
  
  const props = defineProps({ grade:String, className:String, subject:String, exam:String });
  const router = useRouter();
  
  const filteredExams = computed(()=>exams.filter(e=>e.grade===props.grade && e.class===props.className && e.subject===props.subject));
  const selectedExam = ref(props.exam || (filteredExams.value[0]?.examId));
  
  const examsList = filteredExams.value;
  
  const onChange = () => {
    router.push(`/${props.grade}/${props.className}/${props.subject}/${selectedExam.value}`);
  };
  </script>
  
  <style scoped>
  .exam-selector{margin:8px 0;}
  </style>