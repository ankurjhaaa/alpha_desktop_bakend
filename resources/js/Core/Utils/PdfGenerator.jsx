import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font, Image } from '@react-pdf/renderer';

// Define styles exactly as the flutter app (using hex colors and layout)
const styles = StyleSheet.create({
  page: {
    padding: 25,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    backgroundColor: '#4c55cc',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 45,
    height: 45,
    marginBottom: 8,
    borderRadius: 22.5,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  pill: {
    backgroundColor: '#353b99',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  pillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionBox: {
    backgroundColor: '#1b1e32',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  sectionHeaderLabel: {
    backgroundColor: '#4c55cc',
    borderRadius: 4,
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginLeft: 15,
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  table: {
    flexDirection: 'column',
    marginTop: 0,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCellLabel: {
    width: '35%',
    padding: 8,
    paddingLeft: 15,
    color: '#ffffff',
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2b2e42',
  },
  tableCellValue: {
    width: '65%',
    padding: 8,
    backgroundColor: '#ffffff',
    color: '#333333',
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableCellLabelLast: {
    width: '35%',
    padding: 8,
    paddingLeft: 15,
    color: '#ffffff',
    fontSize: 10,
  },
  tableCellValueLast: {
    width: '65%',
    padding: 8,
    backgroundColor: '#ffffff',
    color: '#333333',
    fontSize: 10,
  },
  statsBoxWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    margin: 10,
    marginTop: 0,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  statColLast: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  statLabel: {
    fontSize: 9,
    color: '#1a1a1a',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  statValueMax: {
    fontSize: 20,
    color: '#1f487e',
    fontWeight: 'bold',
  },
  statValuePass: {
    fontSize: 20,
    color: '#2d7a53',
    fontWeight: 'bold',
  },
  statValueObtained: {
    fontSize: 20,
    color: '#7044a3',
    fontWeight: 'bold',
  },
  statValuePercent: {
    fontSize: 20,
    color: '#d68a3a',
    fontWeight: 'bold',
  },
  performanceBadge: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginBottom: 10,
  },
  performanceBadgePass: {
    backgroundColor: '#239c71',
  },
  performanceBadgeFail: {
    backgroundColor: '#d9534f',
  },
  performanceLabel: {
    color: '#ffffff',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 4,
  },
  performanceText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  aboutBox: {
    backgroundColor: '#1b1e32',
    borderRadius: 8,
    padding: 15,
  },
  aboutTitle: {
    color: '#4c55cc',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  aboutText: {
    color: '#cccccc',
    fontSize: 9,
    lineHeight: 1.5,
  }
});

export const ExamResultPdfTemplate = ({ data }) => {
  const { 
    examName, 
    studentName, 
    regNumber, 
    score, 
    total, 
    percentage, 
    examDate,
    fatherName,
    course,
    batch,
    batchTiming
  } = data;
  
  const isPass = percentage >= 50.0;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const d = new Date(dateString);
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} at ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch(e) {
        return 'Invalid Date';
    }
  };

  let performanceWord = 'NEEDS IMPROVEMENT';
  let badgeStyle = styles.performanceBadgeFail;
  if (percentage >= 90) { performanceWord = 'EXCELLENT'; badgeStyle = styles.performanceBadgePass; }
  else if (percentage >= 75) { performanceWord = 'GOOD'; badgeStyle = styles.performanceBadgePass; }
  else if (percentage >= 50) { performanceWord = 'AVERAGE'; badgeStyle = styles.performanceBadgePass; }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <Image src="/assets/images/logo.png" style={styles.logo} />
          <Text style={styles.headerTitle}>ALPHA GRAPHICS</Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>EXAM RESULT</Text>
          </View>
        </View>

        {/* Student Details Section */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeaderLabel}>
            <Text style={styles.sectionTitle}>STUDENT DETAILS</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Student Name</Text>
              <Text style={styles.tableCellValue}>{studentName}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Admission No.</Text>
              <Text style={styles.tableCellValue}>{regNumber || 'N/A'}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Father's Name</Text>
              <Text style={styles.tableCellValue}>{fatherName || 'Not Provided'}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Course</Text>
              <Text style={styles.tableCellValue}>{course || 'N/A'}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Date & Time</Text>
              <Text style={styles.tableCellValue}>{formatDate(examDate)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Batch</Text>
              <Text style={styles.tableCellValue}>{batch || 'N/A'}</Text>
            </View>
            <View style={styles.tableRowLast}>
              <Text style={styles.tableCellLabelLast}>Batch Timing</Text>
              <Text style={styles.tableCellValueLast}>{batchTiming || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Performance Summary Section */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeaderLabel}>
            <Text style={styles.sectionTitle}>PERFORMANCE SUMMARY</Text>
          </View>
          <View style={styles.statsBoxWrapper}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>MAX MARKS</Text>
              <Text style={styles.statValueMax}>{total}</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>PASS MARKS</Text>
              <Text style={styles.statValuePass}>{Math.floor(total * 0.5)}</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>OBTAINED MARKS</Text>
              <Text style={styles.statValueObtained}>{score}</Text>
            </View>
            <View style={styles.statColLast}>
              <Text style={styles.statLabel}>PERCENTAGE</Text>
              <Text style={styles.statValuePercent}>{Number(percentage).toFixed(2)}%</Text>
            </View>
          </View>
        </View>

        {/* Performance Badge Section */}
        <View style={[styles.performanceBadge, badgeStyle]}>
          <Text style={styles.performanceLabel}>PERFORMANCE</Text>
          <Text style={styles.performanceText}>{performanceWord}</Text>
        </View>

        {/* About Section */}
        <View style={styles.aboutBox}>
          <Text style={styles.aboutTitle}>About This Test Series</Text>
          <Text style={styles.aboutText}>
            The ALPHA GRAPHICS Test Series is designed to provide students with comprehensive assessment of their knowledge and skills. This result reflects your performance in the test, highlighting areas of strength and opportunities for improvement. We are committed to supporting your academic growth with detailed feedback and resources.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export const downloadExamResultPdf = async (data) => {
  try {
    const blob = await pdf(<ExamResultPdfTemplate data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    
    // Create an invisible anchor element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (data.examName || 'Exam').replace(/[^a-zA-Z0-9]/g, '_');
    const safeReg = (data.regNumber || data.studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `${safeTitle}_${safeReg}_Result.pdf`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    alert("Failed to generate PDF");
  }
};
