$content = Get-Content client/src/pages/AdminDashboard.tsx -Raw
$content = $content.Replace('            </section>', '            </Section>')
Set-Content client/src/pages/AdminDashboard.tsx -Value $content