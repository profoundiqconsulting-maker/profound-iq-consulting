import { readFileSync, writeFileSync } from "fs";

const files = [
  "C:/Users/Administrator/Desktop/Profound IQ Claude/profound-iq-consulting/client/src/pages/AdminDashboard.tsx",
  "C:/Users/Administrator/Desktop/Profound IQ Claude/profound-iq-consulting/client/src/pages/StaffDashboard.tsx",
  "C:/Users/Administrator/Desktop/Profound IQ Claude/profound-iq-consulting/client/src/pages/Settings.tsx",
  "C:/Users/Administrator/Desktop/Profound IQ Claude/profound-iq-consulting/client/src/pages/MyCertificates.tsx",
  "C:/Users/Administrator/Desktop/Profound IQ Claude/profound-iq-consulting/client/src/pages/CourseWorkspace.tsx",
  "C:/Users/Administrator/Desktop/Profound IQ Claude/profound-iq-consulting/client/src/components/AdminStaffPanel.tsx",
  "C:/Users/Administrator/Desktop/Profound IQ Claude/profound-iq-consulting/client/src/components/AdminRevenuePanel.tsx",
  "C:/Users/Administrator/Desktop/Profound IQ Claude/profound-iq-consulting/client/src/components/AdminCertificatePreview.tsx",
  "C:/Users/Administrator/Desktop/Profound IQ Claude/profound-iq-consulting/client/src/components/AdminRecentQCCertificates.tsx",
  "C:/Users/Administrator/Desktop/Profound IQ Claude/profound-iq-consulting/client/src/components/AdminInquiryPanel.tsx",
  "C:/Users/Administrator/Desktop/Profound IQ Claude/profound-iq-consulting/client/src/components/AdminCourseAccessAudit.tsx",
  "C:/Users/Administrator/Desktop/Profound IQ Claude/profound-iq-consulting/client/src/components/AdminNewsletterPanel.tsx",
  "C:/Users/Administrator/Desktop/Profound IQ Claude/profound-iq-consulting/client/src/components/AdminPaymentExceptionsPanel.tsx",
  "C:/Users/Administrator/Desktop/Profound IQ Claude/profound-iq-consulting/client/src/components/AdminInsightsPanel.tsx",
  "C:/Users/Administrator/Desktop/Profound IQ Claude/profound-iq-consulting/client/src/components/AdminCourseShareAnalytics.tsx",
  "C:/Users/Administrator/Desktop/Profound IQ Claude/profound-iq-consulting/client/src/components/AdminSocialPreviewSettings.tsx",
  "C:/Users/Administrator/Desktop/Profound IQ Claude/profound-iq-consulting/client/src/components/AdminTranslationSuggestionsPanel.tsx",
  "C:/Users/Administrator/Desktop/Profound IQ Claude/profound-iq-consulting/client/src/components/AdminCatalogPanel.tsx",
];

let totalChanges = 0;

for (const filePath of files) {
  try {
    let content = readFileSync(filePath, "utf8");
    const original = content;

    // Find all useQuery blocks with retry: false that don't already have refetchInterval
    // Match across multiple lines using a more robust pattern
    const lines = content.split("\n");
    const newLines = [];
    let i = 0;
    let fileChanges = 0;

    while (i < lines.length) {
      const line = lines[i];
      
      // Check if this line contains useQuery
      if (line.includes(".useQuery(")) {
        // Find the opening of the options object
        const queryStart = line.indexOf(".useQuery(");
        let queryEnd = line.indexOf(")", queryStart);
        let optionsStart = line.indexOf("{", queryEnd);
        
        // If options start on same line
        if (optionsStart !== -1) {
          // Find matching closing brace
          let braceCount = 0;
          let optionsEnd = -1;
          let j = optionsStart;
          while (j < lines.length) {
            for (let k = 0; k < lines[j].length; k++) {
              if (lines[j][k] === "{") braceCount++;
              if (lines[j][k] === "}") braceCount--;
              if (braceCount === 0) {
                optionsEnd = j;
                break;
              }
            }
            if (optionsEnd !== -1) break;
            j++;
          }
          
          if (optionsEnd !== -1) {
            // Extract options block
            const optionsBlock = lines.slice(optionsStart, optionsEnd + 1).join("\n");
            
            // Check if it has retry: false and doesn't have refetchInterval
            if (optionsBlock.includes("retry: false") && !optionsBlock.includes("refetchInterval")) {
              // Determine interval based on query name
              let interval = "30000";
              const queryMatch = line.match(/trpc\.\w+\.\w+\.useQuery/);
              const queryName = queryMatch ? queryMatch[0] : "";
              
              if (queryName.includes("psychometricAnalytics") || queryName.includes("psychometricFailedDeliveries") || queryName.includes("deliveryLogExportJobs")) {
                interval = queryName.includes("deliveryLogExportJobs") ? "8000" : "30000";
              } else if (queryName.includes("psychometricWeeklySchedule") || queryName.includes("analyticsSettings") || queryName.includes("emailTemplates") || queryName.includes("certificateSettings") || queryName.includes("profile.get") || queryName.includes("profile.loginHistory") || queryName.includes("profile.sessions")) {
                interval = "60000";
              } else if (queryName.includes("assignedInquiries") || queryName.includes("staff.metrics") || queryName.includes("revenueReport") || queryName.includes("recentCourseCertificates") || queryName.includes("certificateUsageAnalytics") || queryName.includes("publicCertificateShareAnalytics") || queryName.includes("contactInquiries") || queryName.includes("coursePaymentExceptions")) {
                interval = "15000";
              } else if (queryName.includes("course.state")) {
                interval = "30000";
              } else if (queryName.includes("adminOverview") || queryName.includes("psychometricAttempts") || queryName.includes("psychometricAcknowledgementAudit") || queryName.includes("analyticsSummary") || queryName.includes("careerPathShareAnalytics") || queryName.includes("scheduledExportStatus") || queryName.includes("emailPreviewHistory") || queryName.includes("userVerificationReview") || queryName.includes("securitySettings") || queryName.includes("failedLoginEvents") || queryName.includes("loginSecurityAnalytics") || queryName.includes("failedLoginRegions") || queryName.includes("unlockAuditHistory") || queryName.includes("resetLinkRevocationHistory") || queryName.includes("organizationInvitations") || queryName.includes("organizationApprovalHistory")) {
                interval = "30000";
              } else if (queryName.includes("teamMembers") || queryName.includes("staffInvitations") || queryName.includes("staffPerformance")) {
                interval = "30000";
              }
              
              // Add refetchInterval before the last closing brace
              const lastBraceIndex = optionsBlock.lastIndexOf("}");
              const newOptionsBlock = optionsBlock.slice(0, lastBraceIndex) + `,\n     refetchInterval: ${interval}` + optionsBlock.slice(lastBraceIndex);
              
              // Replace the lines
              for (let k = optionsStart; k <= optionsEnd; k++) {
                if (k === optionsStart) {
                  newLines.push(newOptionsBlock.split("\n")[0]);
                } else if (k === optionsEnd) {
                  const newBlockLines = newOptionsBlock.split("\n");
                  newLines.push(...newBlockLines.slice(1));
                } else {
                  // skip - will be replaced
                }
              }
              
              i = optionsEnd + 1;
              fileChanges++;
              continue;
            }
          }
        }
      }
      
      newLines.push(line);
      i++;
    }
    
    if (fileChanges > 0) {
      const newContent = newLines.join("\n");
      writeFileSync(filePath, newContent);
      totalChanges += fileChanges;
      console.log(`Updated ${filePath.split("/").pop()}: +${fileChanges} queries`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
}

console.log(`\nTotal queries updated: ${totalChanges}`);
