import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { authStorage } from "@/services/auth-storage";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: ({ location }) => {
    if (!authStorage.getToken()) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: () => <Outlet />,
});
