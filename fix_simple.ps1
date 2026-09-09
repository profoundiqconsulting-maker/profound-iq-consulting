$bytes = [System.IO.File]::ReadAllBytes("client/src/pages/AdminDashboard.tsx")
$text = [System.Text.Encoding]::UTF8.GetString($bytes)
$text = $text.Replace("            </section>", "            </Section>")
[System.IO.File]::WriteAllText("client/src/pages/AdminDashboard.tsx", $text, [System.Text.Encoding]::UTF8)