# Paid course lesson access verification

The course workspace now computes access from the authenticated session and the signed-in learner’s paid course stages. Unregistered users receive a public-highlight gate; authenticated users without the first verified stage receive the same gate with enrollment guidance; the configured quality-control admin remains allowed to inspect detailed lessons without checkout. The authorized preview session displayed the detailed workspace as expected, including the four-stage payment rail. Desktop and mobile course-workspace screenshots were reviewed after the change.

TypeScript validation, the full Vitest suite, and the production build passed. Existing course mutations remain protected by authenticated procedures, and payment verification remains server-side before a stage is marked paid.
