import type { Lesson } from './types'

export const introductionToAlgorithms: Lesson = {
  slug: 'introduction-to-algorithms',
  title: 'Introduction to Algorithms',
  description:
    'A gentle overview of what algorithms are, how we describe them, and how this lesson format will guide your learning.',
  category: 'Foundations',
  difficulty: 'Beginner',
  estimatedTime: '8 min',
  tags: ['fundamentals', 'overview', 'getting-started'],

  objectives: [
    'Understand what an algorithm is in plain language',
    'Recognize the common parts of a Rean Algorithm lesson',
    'Describe problems as inputs, steps, and outputs',
    'Know where complexity, pseudocode, and examples fit in',
  ],

  overview: [
    'An algorithm is a clear sequence of steps that solves a problem. Given some input, it produces a predictable output by following those steps carefully.',
    'In programming, algorithms help you search data, sort lists, traverse graphs, and make decisions efficiently. The same idea can be written in many languages — the thinking matters first.',
    'This placeholder lesson shows the reusable structure every topic page will follow: goals, explanation, visuals, steps, complexity, code, and takeaways.',
  ],

  whyItMatters: [
    'Strong algorithmic thinking makes you a better problem solver — not just someone who memorizes code snippets.',
    'Interview questions, contest problems, and real products all rely on choosing the right approach for the job.',
    'Once you can read a lesson page confidently, you can focus on the ideas behind Big O, searching, sorting, and graphs.',
  ],

  visualization: {
    title: 'How a lesson visual will look',
    description:
      'Interactive algorithm animations will appear here later. For now, this panel is a polished placeholder for the visualization system.',
  },

  steps: [
    {
      title: 'Understand the input',
      description:
        'Identify what data you receive and what constraints matter — size, order, and valid values.',
    },
    {
      title: 'Define the goal',
      description:
        'State the expected output clearly so you can check whether each step moves you closer to it.',
    },
    {
      title: 'Break the work into steps',
      description:
        'Write a short sequence of actions that transforms the input into the result without skipping edge cases.',
    },
    {
      title: 'Check and refine',
      description:
        'Walk through a small example, then note time and space cost before coding a full solution.',
    },
  ],

  complexity: {
    time: {
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    space: 'O(1)',
  },

  pseudocode: `ALGORITHM SolveProblem(input)
  DEFINE goal from the problem statement
  BREAK the work into clear steps
  FOR each step
    APPLY the step to the current state
  END FOR
  RETURN the final result
END ALGORITHM`,

  code: {
    python: `def solve_problem(data):
    """Placeholder example — not a real algorithm yet."""
    result = []
    for item in data:
        result.append(item)
    return result


# Example
print(solve_problem([1, 2, 3]))`,
    javascript: `function solveProblem(data) {
  // Placeholder example — not a real algorithm yet.
  const result = [];
  for (const item of data) {
    result.push(item);
  }
  return result;
}

// Example
console.log(solveProblem([1, 2, 3]));`,
    typescript: `function solveProblem(data: number[]): number[] {
  // Placeholder example — not a real algorithm yet.
  const result: number[] = [];
  for (const item of data) {
    result.push(item);
  }
  return result;
}

// Example
console.log(solveProblem([1, 2, 3]));`,
  },

  whenToUse: [
    'You need a structured way to learn a new concept before diving into code',
    'You want a shared template for documenting algorithms across the site',
    'You are starting the Foundations path and want context for later lessons',
  ],

  whenNotToUse: [
    'You already need a production-ready implementation of a specific algorithm',
    'You are looking for interactive practice problems (coming in a later step)',
    'You need deep Big O proofs — those belong in dedicated complexity lessons',
  ],

  keyTakeaways: [
    'Algorithms are step-by-step recipes for transforming input into output',
    'Every Rean Algorithm lesson shares the same reading structure',
    'Visuals, steps, complexity, and code work together — none replace understanding',
    'This page is a template; open Binary Search next for a full interactive lesson',
  ],

  nextLesson: {
    title: 'Binary Search',
    href: '/learn/binary-search',
  },

  categoryHref: '/roadmap/foundations',
}
