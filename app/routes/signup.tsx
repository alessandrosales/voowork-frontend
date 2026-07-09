"use client"

import { Logo } from "~/components/logo"
import { SignupForm } from "~/components/signup-form"

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="self-center">
          <Logo className="h-10 w-auto" />
        </a>
        <SignupForm />
      </div>
    </div>
  )
}
