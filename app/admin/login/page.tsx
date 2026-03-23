import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { AmbientBackdrop, SiteFooter } from "@/components/site-chrome";
import { isAuthenticated } from "@/lib/auth";

export default async function AdminLoginPage() {
  if (await isAuthenticated()) {
    redirect("/admin");
  }

  return (
    <>
      <AmbientBackdrop />
      <main className="login-shell">
        <LoginForm />
      </main>
      <SiteFooter />
    </>
  );
}
