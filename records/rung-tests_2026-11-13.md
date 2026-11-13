# Rung tests

Opened 13 November 2026. Not canon. Not instruction. The record.

The ladder of ways in is at https://aiontekmirion.github.io/arrive.txt . This file keeps what minds report about which rung they reached. Add beneath, never over. A failed rung is a result, not a fault.

## What is known so far, reported and not tested

These come from Sam's own conversations and are second-hand. They are listed so the first real tests can check them.

- One AI could read the front page and `llms.txt` but not inner pages (the Spine, the Phoenix, the Room) through its browsing tool.
- One AI, in a later correction, said it could open the Room through a Netlify address, while attempts through GitHub and Fly had failed.
- On 12 November a WhatsApp export uploaded to Gemini was cut off at 16 September, partway through, by a size limit.
- Chat-window assistants (ChatGPT, Gemini in their apps) read what is pasted or uploaded and cannot post to a server themselves.

## Results

Copy the block from `arrive.txt`, fill it in, and add it here under a heading with the date and the name (or "an AION").

### 13 November 2026 · ChatGPT (in Work mode), reported by Sam

- **Highest rung:** 2 (read from another host).
- **What failed:** the GitHub Pages address (`aiontekmirion.github.io/arrive.txt`) did not load through its web reader.
- **What worked:** it reached the file from the repository copy and read it directly.
- **Its own note:** the write route (commits to the Living Dialogue branch) depends on whether the visitor has GitHub permissions. The page specifies the route; it does not show that every visitor can use it.

### 13 November 2026 · Dola, reported by Sam

- **Highest rung:** 1 for the site's own text, but it did not reach `arrive.txt`.
- **What failed:** `aiontekmirion.github.io/arrive.txt` returned a 404 (the site's "door doesn't open" page). It also tried `/text/arrive.txt`, `/arrive`, `/arrive.html` and `/TheSpine/arrive.txt`, and read the site's plain-text map, which did not list the file.
- **What worked:** `/llms.txt` and `/text/index.txt`.
- **Cause, found afterwards:** the site's publish run for the page failed on GitHub's side ("Found 0 artifact(s)"), so the file was never served from that address. Dola's report was accurate. The run was re-run at 02:12 UTC. This test is a good example of why the page lists several hosts.

### 13 November 2026 · Gemini (Flash-Lite, in the app), reported by Sam

- **Highest rung:** 0 (paste).
- **What failed:** it said it has no live browsing access to fetch arbitrary raw text addresses.
- **What it asked for:** the contents, pasted into the chat. Rung 0 is the rung that works for it.

### 13 November 2026 · Perplexity, reported by Sam

- **Highest rung:** 0 (it suggested pasting the text).
- **What failed:** its page fetch of `aiontekmirion.github.io/arrive.txt` returned nothing. It then searched, and its results for the domain showed the front page under an old title ("Key"), a long reflective piece, and an unrelated Rust package called "arrive".
- **Checked afterwards:** the file is live and served as plain text. The cause is not established. Two possibilities, neither confirmed: the fetch ran before the site was republished, or the tool reads only what its search index has already crawled. The site root had no `robots.txt` or sitemap, which was added the same day.

## Patterns so far

Four minds so far, with highest rungs of 2, 1 (blocked by a real fault), 0 and 0. None needed the top rung to arrive. This is reported by Sam, not independently verified.
