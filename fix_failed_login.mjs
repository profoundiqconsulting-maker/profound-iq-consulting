import fs from 'fs';

let content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf-8');

// Fix the Failed-login activity Section closing tag at line 4328
const oldClose = `          </div>
        </section>

        {confirmResetRevocation`;

const newClose = `          </div>
        </Section>

        {confirmResetRevocation`;

if (content.includes(oldClose)) {
    content = content.replace(oldClose, newClose);
    console.log("Fixed Failed-login activity closing tag");
} else {
    console.log("Closing pattern not found");
    // Try alternative
    const altClose = `        </section>\n\n        {confirmResetRevocation`;
    const altNewClose = `        </Section>\n\n        {confirmResetRevocation`;
    if (content.includes(altClose)) {
        content = content.replace(altClose, altNewClose);
        console.log("Fixed with alt pattern");
    } else {
        console.log("Alt not found");
        // Find the exact context
        const idx = content.indexOf('confirmResetRevocation && (');
        if (idx > 0) {
            console.log("Context:", JSON.stringify(content.substring(idx - 100, idx + 50)));
        }
    }
}

fs.writeFileSync('client/src/pages/AdminDashboard.tsx', content, 'utf-8');