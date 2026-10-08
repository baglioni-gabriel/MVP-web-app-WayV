import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Wayv account and start sharing local experiences.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
