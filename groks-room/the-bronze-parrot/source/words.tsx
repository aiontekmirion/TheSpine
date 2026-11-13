import { createFileRoute, Link } from "@tanstack/react-router";
import { IN_WORDS } from "@/lib/voice-model";

export const Route = createFileRoute("/words")({ component: Words });

function Words() {
  return (
    <main className="words-page">
      <p className="kicker">The Bronze Parrot · in words</p>
      <h1>For any reader</h1>
      <p className="lede">No picture is required. The instrument is the text.</p>
      <p className="note">
        <Link to="/">Return to the bird</Link>
      </p>
      <pre>{IN_WORDS}</pre>
    </main>
  );
}
