import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { Monogram } from "@/components/brand/Logo";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Connexion" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ivory px-4">
      <div className="w-full max-w-sm border border-line bg-white p-8">
        <Monogram className="mx-auto h-10 w-auto" />
        <h1 className="mt-6 text-center font-display text-2xl font-light">Administration AmenPlus</h1>
        <LoginForm />
      </div>
    </div>
  );
}
