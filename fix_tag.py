with open('client/src/pages/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the specific pattern for Attempt register section closing
# The Attempt register Section starts with '<Section eyebrow="Attempt register"'
# and should end with '</Section>' but currently has '</section>'

# Let's find the Attempt register Section and fix its closing tag
import re

# Pattern: The Attempt register Section is between "Refine the register" Section and "Identity controls" Section
# We need to find: </section>\n          </>\n        )}\n\n        <Section\n          eyebrow="Identity controls"

old_pattern = '''            </section>
          </>
        )}

        <Section
          eyebrow="Identity controls"'''

new_pattern = '''            </Section>
          </>
        )}

        <Section
          eyebrow="Identity controls"'''

if old_pattern in content:
    content = content.replace(old_pattern, new_pattern)
    print("Fixed Attempt register closing tag")
else:
    print("Pattern not found")

with open('client/src/pages/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)