# Paid course lesson access — final verification

The shared access contract now blocks unregistered visitors and authenticated learners with zero paid stages, while allowing access after one verified stage and preserving the configured quality-control admin bypass. The locked state shows course title, description, audience, outcomes, total investment, staged payment amounts, and a sign-in or enrollment path without presenting the detailed lesson player.

The authorized preview session rendered the detailed workspace correctly on desktop and mobile, including the four-stage access plan. Full Vitest suite, TypeScript validation, and production build passed after adding focused access-rule coverage for unregistered, unpaid, paid, and quality-control paths.
