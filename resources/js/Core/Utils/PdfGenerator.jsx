import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font, Image } from '@react-pdf/renderer';

// Define styles exactly as the flutter app (using hex colors and layout)
const styles = StyleSheet.create({
  page: {
    padding: 25,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    display: 'flex',
    flexDirection: 'column',
  },
  mainContent: {
  },
  header: {
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 4,
  },
  headerTitle: {
    color: '#0f172a',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  pill: {
    backgroundColor: '#eff6ff',
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  pillText: {
    color: '#1d4ed8',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sectionBox: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  sectionHeaderLabel: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitle: {
    color: '#334155',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 1,
  },
  table: {
    flexDirection: 'column',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableCellLabel: {
    width: '35%',
    padding: 8,
    paddingLeft: 15,
    color: '#64748b',
    fontSize: 10,
    backgroundColor: '#fafafa',
  },
  tableCellValue: {
    width: '65%',
    padding: 8,
    color: '#0f172a',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableCellLabelLast: {
    width: '35%',
    padding: 8,
    paddingLeft: 15,
    color: '#64748b',
    fontSize: 10,
    backgroundColor: '#fafafa',
  },
  tableCellValueLast: {
    width: '65%',
    padding: 8,
    color: '#0f172a',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsBoxWrapper: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
  },
  statColLast: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  statLabel: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  statValueMax: {
    fontSize: 20,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  statValuePass: {
    fontSize: 20,
    color: '#0ea5e9',
    fontWeight: 'bold',
  },
  statValueObtained: {
    fontSize: 20,
    color: '#10b981',
    fontWeight: 'bold',
  },
  statValuePercent: {
    fontSize: 20,
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  performanceBadge: {
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
  },
  performanceBadgePass: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  performanceBadgeFail: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  performanceLabel: {
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  performanceLabelPass: {
    color: '#059669',
  },
  performanceLabelFail: {
    color: '#dc2626',
  },
  performanceText: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  performanceTextPass: {
    color: '#047857',
  },
  performanceTextFail: {
    color: '#b91c1c',
  },
  aboutBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  aboutTitle: {
    color: '#334155',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aboutText: {
    color: '#64748b',
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
  let labelStyle = styles.performanceLabelFail;
  let textStyle = styles.performanceTextFail;
  if (percentage >= 90) { performanceWord = 'EXCELLENT'; badgeStyle = styles.performanceBadgePass; labelStyle = styles.performanceLabelPass; textStyle = styles.performanceTextPass; }
  else if (percentage >= 75) { performanceWord = 'GOOD'; badgeStyle = styles.performanceBadgePass; labelStyle = styles.performanceLabelPass; textStyle = styles.performanceTextPass; }
  else if (percentage >= 50) { performanceWord = 'AVERAGE'; badgeStyle = styles.performanceBadgePass; labelStyle = styles.performanceLabelPass; textStyle = styles.performanceTextPass; }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.mainContent}>
          {/* Header Section */}
          <View style={styles.header}>
            <Image src="/assets/images/logo.png" style={styles.logo} />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.headerTitle}>ALPHA GRAPHICS</Text>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{examName ? examName.toUpperCase() : 'EXAM RESULT'}</Text>
              </View>
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
                <Text style={styles.statLabel}>OBTAINED</Text>
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
            <Text style={[styles.performanceLabel, labelStyle]}>PERFORMANCE OVERALL</Text>
            <Text style={[styles.performanceText, textStyle]}>{performanceWord}</Text>
          </View>
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
