import { createFileRoute } from "@tanstack/react-router";
import { ParrotBench } from "@/components/parrot-bench";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <ParrotBench />;
}
