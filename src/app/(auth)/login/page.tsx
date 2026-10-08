import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log In",
  description: "Sign in to your Wayv account to create events, rate, and save experiences.",
};

export default function LoginPage() {
  return <LoginForm />;
}
