# QC Certificate Admin QA Notes

- Desktop `/admin` capture confirms the admin header visibly shows the compact `QC MODE` badge beside the admin label.
- Mobile `/admin` capture confirms the badge remains legible beside the compact logo and does not overlap the back-to-site control.
- The cookie consent panel is visible in the fresh preview session and covers lower dashboard content; this is expected first-session chrome and not part of the QC certificate layout.
- The source validation completed with zero TypeScript errors, full tests passed, and production build completed. The new admin certificate widget and PDF action are included in the updated source and require a fresh checkpoint for deployment.
