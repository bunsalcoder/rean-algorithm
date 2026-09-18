import { AppShell } from './components/layout/AppShell'
import { Container, Section } from './components/ui'

function App() {
  return (
    <AppShell>
      <Section className="flex flex-1 items-center">
        <Container size="sm" className="text-center">
          <h1 className="text-foreground">Rean Algorithm</h1>
          <p className="mx-auto mt-4 max-w-md text-body text-muted-foreground sm:text-lg">
            Learn algorithms. Understand the logic. Solve problems.
          </p>
        </Container>
      </Section>
    </AppShell>
  )
}

export default App
