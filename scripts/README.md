# scripts/

## The HTML in `public/` is the source of truth

There is no generator that rebuilds the site's pages. If you are looking for
"the script that builds the treatment pages", it existed
(`generate-treatment-pages.mjs`), it did its job, and it was removed on
2026-09-17. It is still in git history if you want to read it.

It was retired rather than updated, for a reason worth keeping:

The generator produced 28 treatment pages from one template, varying only the
product name, price, onset and duration. That got a clinically sound library
into existence quickly, which was worth doing. But it also left the four
neurotoxin pages 91-94% identical to each other by 8-word phrase, which is
exactly the pattern Google's scaled-content guidance is aimed at.

Everything done to these pages since then makes each one *more* itself: Botox's
FDA label genuinely differs from Jeuveau's, a location page should talk about
its own location, a clinician's page should read like that clinician. A
regenerator works against all of it by design. It had also drifted badly out of
date - by the time it was removed, re-running it would have silently stripped
the Ageless launcher, the authority schema and the current asset versions from
all 28 pages.

## How to change many pages at once

Write a small transform script that edits the existing HTML in place, in the
shape of `differentiate-toxins.mjs`:

- **Anchor every replacement on the exact text it replaces.** If the anchor is
  gone, skip that file and say so, rather than guessing at a position.
- **Make it idempotent.** Running it twice must be a no-op. Check for the thing
  you are about to insert before inserting it.
- **Never rewrite a whole page.** A script that emits a complete document will
  drop whatever it does not know about, and it will not know about the next
  person's work.
- **Say what you changed.** Print one line per file, and a count at the end.

## A note on the FAQ blocks

The visible FAQ on each treatment page is mirrored in `FAQPage` JSON-LD in that
page's `<head>`. Changing one without the other creates a structured-data
mismatch that Search Console will eventually report. Treat them as one edit.

## The other scripts

- `build-verified.sh` - the real build (`npm run build`). Runs a bounded vinext
  build, then `validate-artifact.sh`.
- `validate-artifact.sh` - checks the built Worker artifact is shaped correctly.
- `sites-env.sh` - environment shim the build and lint run through.
- `install-ci.sh` - dependency install for CI.
- `enhance-authority.mjs` - injected the site-wide authority/organization schema.
- `differentiate-toxins.mjs` - the neurotoxin rewrite described above; kept as
  the worked example of the pattern.
