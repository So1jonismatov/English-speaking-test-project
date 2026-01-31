import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full sm:items-center justify-center p-6 md:p-10">
      <div className="w-full sm:max-w-lg">
        <LoginForm />
      </div>
    </div>
  )
}
