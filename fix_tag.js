const fs = require('fs');

const content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf-8');

const oldPattern = `            </section>
          </>
        )}

        <Section
          eyebrow="Identity controls"`;

const newPattern = `            </Section>
          </>
        )}

        <Section
          eyebrow="Identity controls"`;

if (content.includes(oldPattern)) {
    const newContent = content.replace(oldPattern, newPattern);
    fs.writeFileSync('client/src/pages/AdminDashboard.tsx', newContent, 'utf-8');
    console.log("Fixed Attempt register closing tag");
} else {
    console.log("Pattern not found");
    // Try to find what's actually there
    const idx = content.indexOf('eyebrow="Identity controls"');
    if (idx > 0) {
        console.log("Context around Identity controls:");
        console.log(content.substring(idx - 200, idx + 100));
    }
}