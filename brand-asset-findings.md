# Brand Asset Inspection Findings

The stored Profound IQ logo is a 1024×1024 RGB PNG with a large white canvas and the mark centered in the middle. Used directly in a compact header, it renders as a white square with the logo artwork appearing too small. A cropped transparent/close-fit logo variant is needed for header use, while a square optimized variant is needed for favicon use.

The `profound-hero_f95a7f36.jpg` path resolves from the managed storage route as a WebP image, while the homepage currently references a different `profound-hero_112264bd.jpg` asset in CSS. The build warning is caused by the `/manus-storage/...` URL being used inside a CSS `url()` token, which Vite cannot resolve at build time; the runtime storage route itself responds successfully. The deployed `/favicon.ico` currently falls through to the app HTML because no actual favicon.ico exists in `client/public`.
