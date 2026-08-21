# Paystack Assessment Test Notes

The assessment page is live at the preview URL and visually renders on desktop and mobile. The entry form requires name, email, and privacy consent. The assessment contains 100 questions in 10 pages of 10 questions, with a 1–5 response scale. The test session has started with the sample participant `Paystack Test User` and is currently on page 1 of 10 with no answers selected. The user confirmed permission to run the KES 200 Paystack test checkout.
Page 1 test response: all ten prompts were answered with value 5 and the UI correctly reported 10 / 100 answered. The Next Page button is now available; the test can proceed page by page.
The test advanced to page 2 and the automated responses were applied; the UI reports 20 / 100 answered. The next page control requires a short render delay before clicking.
The test advanced to page 3. An automated selector looked for uppercase text and did not find the Next Page control because the underlying button text is title case while CSS renders it uppercase. The remaining test should use a case-insensitive text selector.
The authorized test session completed all 100 questions and initialized a Paystack checkout for KES 200. The browser was redirected to a Paystack checkout URL, which currently shows a provider loading/challenge screen titled “Just a moment…”. No payment has been submitted yet.
