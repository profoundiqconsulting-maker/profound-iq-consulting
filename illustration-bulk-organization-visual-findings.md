# Bulk Illustration Organization Visual QA

The direct authenticated `/my-illustrations` browser route renders the new search, folder filter, bulk organization shell, and empty state. The initial loading spinner settles to the empty collection state with zero saved rows. Network requests for `auth.me` and `course.illustrationBookmarksPage` return successfully, and no new browser runtime error was observed. Card-level bulk move and drag ordering controls require a QA account with saved bookmarks for manual interaction coverage.
