import type { ReactNode } from 'react'
import { Container } from '../ui'
import { Header } from './Header'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-theme">
      <Header />

      <main className="flex flex-1 flex-col">{children}</main>

      <footer className="border-t border-border bg-surface transition-theme">
        <Container className="flex h-14 items-center justify-center sm:h-16">
          <p className="text-body-sm text-muted-foreground">
            Rean Algorithm
          </p>
        </Container>
      </footer>
    </div>
  )
}
