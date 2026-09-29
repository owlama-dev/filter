import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/channels")({ component: ChannelsRedirect });

function ChannelsRedirect() {
  return <Navigate to="/admin/sources" />;
}
