"use client"

import { ForgotPasswordForm } from "~/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-auth p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="self-center">
          <img
            src="/logo-bg-dark.svg"
            alt="Voowork"
            className="h-10 w-auto"
          />
        </a>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
