"use client"

import { SignupForm } from "~/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-auth p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="self-center">
          <img
            src="/logo.svg"
            alt="AgroJG"
            className="h-10 w-auto"
          />
        </a>
        <SignupForm />
      </div>
    </div>
  )
}
