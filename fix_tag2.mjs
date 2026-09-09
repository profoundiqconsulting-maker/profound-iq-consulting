import fs from 'fs';

const content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf-8');

// The actual pattern has different spacing
const oldPattern = `              )}
            </section>
          </>
        )}

        <Section
          eyebrow="Identity controls"`;

const newPattern = `              )}
            </Section>
          </>
        )}

        <Section
          eyebrow="Identity controls"`;

if (content.includes(oldPattern)) {
    const newContent = content.replace(oldPattern, newPattern);
    fs.writeFileSync('client/src/pages/AdminDashboard.tsx', newContent, 'utf-8');
    console.log("Fixed Attempt register closing tag");
} else {
    console.log("Pattern not found - trying alternative");
    // Try with just the closing tag
    const altPattern = `</section>
          </>
        )}

        <Section`;
    const altNew = `</Section>
          </>
        )}

        <Section`;
    if (content.includes(altPattern)) {
        const newContent = content.replace(altPattern, altNew);
        fs.writeFileSync('client/src/pages/AdminDashboard.tsx', newContent, 'utf-8');
        console.log("Fixed with alternative pattern");
    } else {
        console.log("Alternative pattern not found either");
        const idx = content.indexOf('eyebrow="Identity controls"');
        console.log("Raw context:");
        console.log(JSON.stringify(content.substring(idx - 150, idx + 50)));
    }
}