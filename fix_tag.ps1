$content = Get-Content client/src/pages/AdminDashboard.tsx -Raw
$content = $content -replace '(?s)(\s+)\)}\s+</section>\s+</>\s+\)}\s+<Section', '$1)}</Section></>$2<Section'
Set-Content client/src/pages/AdminDashboard.tsx -Value $content