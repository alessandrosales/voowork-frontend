import { cn } from "~/lib/utils"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <>
      <img
        src="/logo-bg-dark.svg"
        alt="Voowork"
        className={cn("hidden dark:block", className)}
      />
      <img
        src="/logo-bg-light.svg"
        alt="Voowork"
        className={cn("block dark:hidden", className)}
      />
    </>
  )
}
