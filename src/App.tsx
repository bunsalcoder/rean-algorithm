import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AboutPage } from './pages/AboutPage'
import { AlgorithmsPage } from './pages/AlgorithmsPage'
import { DataStructuresPage } from './pages/DataStructuresPage'
import { HomePage } from './pages/HomePage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { PracticePage } from './pages/PracticePage'

function CategoryPlaceholder({ title }: { title: string }) {
  return (
    <PlaceholderPage
      title={title}
      description="This category page will be available in a future update."
    />
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/algorithms" element={<AlgorithmsPage />} />
          <Route
            path="/algorithms/sorting"
            element={<CategoryPlaceholder title="Sorting Algorithms" />}
          />
          <Route
            path="/algorithms/searching"
            element={<CategoryPlaceholder title="Searching Algorithms" />}
          />
          <Route
            path="/algorithms/array-string"
            element={<CategoryPlaceholder title="Array & String" />}
          />
          <Route
            path="/algorithms/tree-graph"
            element={<CategoryPlaceholder title="Tree & Graph" />}
          />
          <Route
            path="/algorithms/dynamic-programming"
            element={<CategoryPlaceholder title="Dynamic Programming" />}
          />
          <Route
            path="/algorithms/backtracking"
            element={<CategoryPlaceholder title="Backtracking" />}
          />
          <Route path="/data-structures" element={<DataStructuresPage />} />
          <Route
            path="/data-structures/linked-list"
            element={<CategoryPlaceholder title="Linked List" />}
          />
          <Route
            path="/data-structures/stack-queue"
            element={<CategoryPlaceholder title="Stack & Queue" />}
          />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App
