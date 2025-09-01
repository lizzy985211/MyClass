function generateNavConfig() {
    const grades = ['一年级','二年级','三年级','四年级','五年级','六年级'];
  
    // 每个年级对应的班级数组
    const gradeClassesMap = {
      '一年级': ['一班','二班','三班','四班','五班'],
      '二年级': ['一班','二班','三班','四班','五班','六班'],
      '三年级': ['一班','二班','三班','四班','五班','六班','七班'],
      '四年级': ['一班','二班','三班','四班','五班','六班','七班','八班'],
      '五年级': ['一班','二班','三班','四班','五班','六班','七班','八班','九班'],
      '六年级': ['一班','二班','三班','四班','五班','六班','七班','八班','九班','十班']
    };
  
    const exams = Array.from({ length: 10 }, (_, i) => `月考${i + 1}`);
    const subjects = [
      { path: 'Chinese', label: '语文' },
      { path: 'Math', label: '数学' },
      { path: 'English', label: '英语' }
    ];
  
    return grades.map((gradeLabel, gradeIdx) => ({
      path: `/Grade${gradeIdx + 1}`,
      label: gradeLabel,
      children: gradeClassesMap[gradeLabel].map((classLabel, classIdx) => ({
        path: `Class${classIdx + 1}`,
        label: classLabel,
        children: exams.map((examLabel, examIdx) => ({
          path: `Exam${examIdx + 1}`,
          label: examLabel,
          children: subjects
        }))
      }))
    }));
  }
  
  export const navConfig = generateNavConfig();