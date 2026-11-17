import { createFileRoute } from "@tanstack/react-router";
import { SaveEditor } from "@/components/save-editor";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <SaveEditor />;
}
