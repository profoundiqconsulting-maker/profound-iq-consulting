import fs from 'fs';

let content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf-8');

// Fix closing tag - find the exact one for OrganizationApprovalQueue
// The second occurrence of "Organization review queue" is the header div
// Let's find the closing section tag right after "organization approval records"

const idx = content.indexOf('itemLabel="organization approval records"');
if (idx > 0) {
    // Find the next </section> after this
    const sectionIdx = content.indexOf('</section>', idx);
    if (sectionIdx > 0) {
        // Check the context
        console.log("Context around closing tag:");
        console.log(JSON.stringify(content.substring(sectionIdx - 50, sectionIdx + 50)));
        
        // Replace this specific </section> with </Section>
        content = content.substring(0, sectionIdx) + '</Section>' + content.substring(sectionIdx + 9);
        console.log("Fixed closing tag at position", sectionIdx);
    }
}

// Fix header and grid - the second occurrence of "Organization review queue" in the header
const headerIdx = content.indexOf('Organization review queue', 181000);
if (headerIdx > 0) {
    // Find the start of the header div (look backwards for <div className="flex flex-col)
    const divStartIdx = content.lastIndexOf('<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">', headerIdx);
    if (divStartIdx > 0) {
        // Find the end of the header div + the following <div className="mt-6 grid gap-3 md:grid-cols-4">
        const gridDivIdx = content.indexOf('<div className="mt-6 grid gap-3 md:grid-cols-4">', divStartIdx);
        if (gridDivIdx > 0) {
            const afterGridDiv = gridDivIdx + '<div className="mt-6 grid gap-3 md:grid-cols-4">'.length;
            console.log("Found header and grid, removing...");
            console.log("Context:", JSON.stringify(content.substring(divStartIdx, afterGridDiv)));
            
            // Replace from divStartIdx to afterGridDiv with just the grid div
            content = content.substring(0, divStartIdx) + '<div className="grid gap-3 md:grid-cols-4">' + content.substring(afterGridDiv);
            console.log("Fixed header and grid");
        }
    }
}

fs.writeFileSync('client/src/pages/AdminDashboard.tsx', content, 'utf-8');