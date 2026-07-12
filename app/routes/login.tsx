"use client"

import { LoginForm } from "~/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-auth p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="self-center">
          <img
            src="/logo.svg"
            alt="Voowork"
            className="h-10 w-auto"
          />
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
