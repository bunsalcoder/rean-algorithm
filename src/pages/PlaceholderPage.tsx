import { Container, Section } from '../components/ui'

type PlaceholderPageProps = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Section className="flex flex-1 items-center">
      <Container size="sm" className="text-center">
        <h1 className="text-foreground">{title}</h1>
        <p className="mx-auto mt-4 max-w-md text-body text-muted-foreground">
          {description}
        </p>
      </Container>
    </Section>
  )
}
