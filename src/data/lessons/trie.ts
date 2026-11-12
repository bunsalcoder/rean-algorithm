import type { Lesson } from './types'

export const trie: Lesson = {
  slug: 'trie',
  title: 'Trie (Prefix Tree)',
  description:
    'Learn Tries: character nodes, shared prefixes, end-of-word markers, insert/search/prefix/delete, complexity, autocomplete, and when a Trie beats a hash table or plain string list.',
  category: 'Data Structures',
  difficulty: 'Intermediate',
  estimatedTime: '40 min',
  tags: [
    'Data Structures',
    'Trie',
    'Prefix Tree',
    'Strings',
    'Autocomplete',
    'Intermediate',
  ],

  objectives: [
    'Explain what a Trie is and why it is called a prefix tree.',
    'Describe Trie node structure: character edges, children map, and isEndOfWord.',
    'Insert, search, prefix-search, and delete words while preserving shared paths.',
    'State time and space complexity in terms of word length L and stored nodes.',
    'Compare Tries with hash tables and ordinary string collections.',
    'Recognize real uses: autocomplete, dictionaries, suggestions, spell check, and prefix routing ideas.',
  ],

  overview: [
    'A Trie (pronounced “try”) is a tree that stores strings character by character from a shared root. Each edge is labeled with one character; each path from the root spells a prefix.',
    'It is called a prefix tree because every node represents the prefix formed by the path from the root. Words that share a beginning — cat, car, card, care — reuse the same early path (c → a → …) instead of storing each string separately.',
    'A complete word is marked with an end-of-word flag on its final node. That is how car and card can coexist: both pass through c-a-r, but only the node after r may be an end for car, while card continues to d.',
    'This lesson’s playground is case-insensitive: inputs are trimmed and lowercased. Empty strings are rejected. Duplicate inserts do not increase the word count. Prefer a Trie when you care about prefixes; prefer a hash table when you only need exact key lookup.',
  ],

  whyItMatters: [
    'Autocomplete, typeahead, and dictionary lookup are classic Trie workloads — matching by prefix is the natural shape of the structure.',
    'Shared prefixes cut duplicated work compared with scanning every stored string for startsWith.',
    'Understanding end-of-word markers and careful deletion prevents accidentally removing card when you only meant to delete car.',
    'Knowing when a hash set/map is enough keeps you from over-engineering simple exact-match dictionaries.',
  ],

  visualization: {
    title: 'Trie in action',
    description:
      'Insert, search, prefix-search, and delete on a live Trie. Watch shared prefix paths, new character nodes, end-of-word markers, and safe pruning. Includes a small autocomplete demo.',
    type: 'trie',
  },

  steps: [
    {
      title: 'What is a Trie?',
      description:
        'A tree for strings: start at a root, follow one edge per character. The structure stores many words in one multi-way tree instead of a flat list of full strings.',
    },
    {
      title: 'Why is it called a Prefix Tree?',
      description:
        'Every path from the root is a prefix. The node after c-a represents the prefix “ca” shared by cat, car, card, and care. Prefix queries walk that path once.',
    },
    {
      title: 'Trie Node Structure',
      description:
        'Each node holds a map from character → child node (here Map<string, TrieNode>), plus an isEndOfWord boolean. Edges carry the characters; the root has no letter of its own.',
    },
    {
      title: 'Root and Child Nodes',
      description:
        'Operations always begin at the root. Children branch by character — after “ca”, one child may be t (toward cat) and another r (toward car/card/care).',
    },
    {
      title: 'End-of-Word Markers',
      description:
        'isEndOfWord marks a complete word. The path for “car” can exist while inserting “card”; search(“car”) succeeds only if the node after r is marked.',
    },
    {
      title: 'Insert a Word',
      description:
        'Walk or create one child per character, then set isEndOfWord on the final node. Shared prefixes reuse existing nodes; duplicates leave the trie unchanged.',
    },
    {
      title: 'Search for a Word',
      description:
        'Follow each character from the root. Succeed only if the full path exists and the final node has isEndOfWord. A path alone is not enough.',
    },
    {
      title: 'Prefix Search',
      description:
        'startsWith(prefix) only needs the path for the prefix — no end marker required. From that node you can list completions (autocomplete).',
    },
    {
      title: 'Delete a Word',
      description:
        'Clear isEndOfWord, then prune nodes that have no children and are not ends — walking back toward the root. Never remove a node still needed by another word.',
    },
    {
      title: 'Trie Complexity',
      description:
        'Insert, search, prefix check, and delete are O(L) in the word length (average Map child lookup). Listing all words costs work proportional to nodes/characters visited. Space is O(number of nodes). Child representation and alphabet size affect constants.',
    },
    {
      title: 'Real-world Applications',
      description:
        'Autocomplete and search suggestions, dictionary lookup, spell-check candidate generation, prefix-based filtering, and the conceptual idea behind longest-prefix matching in IP routing tables.',
    },
  ],

  thinkingGuide: {
    title: 'Think in “follow character → mark ends → prune carefully”',
    description:
      'Before coding, rehearse how shared prefixes and end markers interact.',
    steps: [
      'Normalize the key (this lesson: trim + lowercase; reject empty).',
      'Walk from the root one character at a time — create only when inserting.',
      'For search, demand isEndOfWord; for prefix, the path alone is enough.',
      'On delete, unmark first, then remove only useless nodes; keep shared ancestors.',
      'Ask: do I need prefixes? If only exact keys matter, a hash table may be simpler.',
    ],
  },

  complexity: {
    time: {
      best: 'O(L)',
      average: 'O(L)',
      worst: 'O(L · Σ)',
    },
    space: 'O(total trie nodes)',
    notes: {
      time: [
        'L is the length of the input word or prefix — not the number of stored words.',
        'Insert / search / startsWith / delete: O(L) average when child lookup is O(1) (e.g. Map or fixed alphabet array).',
        'If children live in an unsorted list, each step can cost up to O(Σ) for alphabet size Σ, making operations O(L · Σ).',
        'Listing all words is O(total characters / nodes traversed), not O(1).',
      ],
      space: [
        'Space grows with the number of distinct character nodes after prefix sharing.',
        'Sparse alphabets with Map children use memory proportional to existing edges; dense array-of-26 layouts trade space for O(1) index by letter.',
        'End-of-word flags add a small constant per node.',
      ],
    },
  },

  commonMistakes: {
    description:
      'These mistakes show up often when learners first implement Tries.',
    mistakes: [
      {
        title: 'Treating a path as a word without isEndOfWord',
        explanation:
          'After inserting “card”, the path “car” exists. search(“car”) must still return false until “car” is inserted (or marked) as a complete word.',
      },
      {
        title: 'Deleting a node that other words still need',
        explanation:
          'Removing “car” must not delete the r node if “card” or “care” remain. Unmark the end, then prune only nodes with no children and no end mark.',
      },
      {
        title: 'Counting duplicates as new words',
        explanation:
          'Inserting “cat” twice should leave size unchanged. Check isEndOfWord before incrementing the word count.',
      },
      {
        title: 'Forgetting case / empty-string policy',
        explanation:
          'Decide normalization up front. This lesson lowercases and rejects empty input so demos stay consistent.',
      },
      {
        title: 'Choosing a Trie when a hash set is enough',
        explanation:
          'Exact membership with no prefix queries is usually simpler with a hash table. Use a Trie when prefixes matter.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Trie vs Hash Table vs String List',
    eyebrow: 'COMPARE',
    description:
      'Pick the structure that matches the query shape — exact key, prefix, or rare scans.',
    items: [
      {
        title: 'Hash table / hash set',
        description:
          'Best for average O(1) exact insert/lookup/delete. No natural prefix scan. Prefer when you never ask “what starts with ca?”.',
      },
      {
        title: 'Trie (prefix tree)',
        description:
          'Best when prefixes drive the workload: autocomplete, suggestions, longest shared prefix. Cost tracks word length L.',
      },
      {
        title: 'Ordinary string collection',
        description:
          'An array or list of strings is simple, but prefix checks scan every string (often O(n · L)). Fine for tiny sets; poor for interactive typeahead.',
      },
      {
        title: 'Sorted array + binary search',
        description:
          'Can find a prefix range after sorting, but updates are costly and you still manage string comparisons carefully. A Trie updates locally along one path.',
      },
    ],
  },

  pseudocode: `Trie node:
  children: Map from character → node
  isEndOfWord: boolean

INSERT(word):
  word ← normalize(word)          // lowercase; reject empty
  node ← root
  for each character ch in word:
    if ch not in node.children:
      node.children[ch] ← new node
    node ← node.children[ch]
  if node.isEndOfWord:
    return duplicate
  node.isEndOfWord ← true
  size ← size + 1

SEARCH(word):
  word ← normalize(word)
  node ← walk(word)               // follow each character
  return node ≠ null AND node.isEndOfWord

STARTS_WITH(prefix):
  prefix ← normalize(prefix)
  return walk(prefix) ≠ null

DELETE(word):
  word ← normalize(word)
  path ← walk collecting nodes
  if path missing OR not path.last.isEndOfWord:
    return not found
  path.last.isEndOfWord ← false
  size ← size − 1
  // prune upward while node has no children and is not end (skip root)

LIST_WORDS():
  DFS from root, appending characters; emit when isEndOfWord`,

  code: {
    python: `class TrieNode:
    def __init__(self):
        self.children: dict[str, TrieNode] = {}
        self.is_end_of_word = False


class Trie:
    """Educational prefix tree. Keys are lowercased; empty rejected."""

    def __init__(self) -> None:
        self.root = TrieNode()
        self._size = 0

    def _normalize(self, word: str) -> str | None:
        key = word.strip().lower()
        return key if key else None

    def insert(self, word: str) -> bool:
        key = self._normalize(word)
        if key is None:
            return False
        node = self.root
        for ch in key:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        if node.is_end_of_word:
            return False
        node.is_end_of_word = True
        self._size += 1
        return True

    def search(self, word: str) -> bool:
        key = self._normalize(word)
        if key is None:
            return False
        node = self._walk(key)
        return node is not None and node.is_end_of_word

    def starts_with(self, prefix: str) -> bool:
        key = self._normalize(prefix)
        if key is None:
            return False
        return self._walk(key) is not None

    def delete(self, word: str) -> bool:
        key = self._normalize(word)
        if key is None:
            return False

        def dfs(node: TrieNode, i: int) -> bool:
            if i == len(key):
                if not node.is_end_of_word:
                    return False
                node.is_end_of_word = False
                return len(node.children) == 0
            ch = key[i]
            child = node.children.get(ch)
            if child is None:
                return False
            should_delete = dfs(child, i + 1)
            if should_delete:
                del node.children[ch]
            return (
                not node.is_end_of_word
                and len(node.children) == 0
                and node is not self.root
            )

        before = self._size
        # Track size via search of end marker
        if not self.search(key):
            return False
        dfs(self.root, 0)
        self._size = before - 1
        return True

    def get_all_words(self) -> list[str]:
        out: list[str] = []

        def dfs(node: TrieNode, built: str) -> None:
            if node.is_end_of_word and built:
                out.append(built)
            for ch in sorted(node.children):
                dfs(node.children[ch], built + ch)

        dfs(self.root, "")
        return out

    def size(self) -> int:
        return self._size

    def is_empty(self) -> bool:
        return self._size == 0

    def clear(self) -> None:
        self.root = TrieNode()
        self._size = 0

    def _walk(self, key: str) -> TrieNode | None:
        node = self.root
        for ch in key:
            node = node.children.get(ch)
            if node is None:
                return None
        return node


trie = Trie()
for w in ["cat", "car", "card", "care", "dog", "door"]:
    trie.insert(w)
print(trie.search("car"))       # True
print(trie.starts_with("ca"))   # True
print(trie.get_all_words())
`,
    javascript: `class TrieNode {
  constructor() {
    this.children = new Map()
    this.isEndOfWord = false
  }
}

/** Educational prefix tree. Keys are lowercased; empty rejected. */
class Trie {
  constructor() {
    this.root = new TrieNode()
    this._size = 0
  }

  normalize(word) {
    const key = word.trim().toLowerCase()
    return key.length === 0 ? null : key
  }

  insert(word) {
    const key = this.normalize(word)
    if (key === null) return false
    let node = this.root
    for (const ch of key) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode())
      }
      node = node.children.get(ch)
    }
    if (node.isEndOfWord) return false
    node.isEndOfWord = true
    this._size += 1
    return true
  }

  search(word) {
    const key = this.normalize(word)
    if (key === null) return false
    const node = this._walk(key)
    return Boolean(node && node.isEndOfWord)
  }

  startsWith(prefix) {
    const key = this.normalize(prefix)
    if (key === null) return false
    return this._walk(key) !== null
  }

  delete(word) {
    const key = this.normalize(word)
    if (key === null) return false
    if (!this.search(key)) return false

    const dfs = (node, i) => {
      if (i === key.length) {
        node.isEndOfWord = false
        return node.children.size === 0
      }
      const ch = key[i]
      const child = node.children.get(ch)
      if (!child) return false
      const shouldDelete = dfs(child, i + 1)
      if (shouldDelete) node.children.delete(ch)
      return (
        !node.isEndOfWord &&
        node.children.size === 0 &&
        node !== this.root
      )
    }

    dfs(this.root, 0)
    this._size -= 1
    return true
  }

  getAllWords() {
    const out = []
    const dfs = (node, built) => {
      if (node.isEndOfWord && built.length > 0) out.push(built)
      const chars = [...node.children.keys()].sort()
      for (const ch of chars) {
        dfs(node.children.get(ch), built + ch)
      }
    }
    dfs(this.root, '')
    return out
  }

  size() {
    return this._size
  }

  isEmpty() {
    return this._size === 0
  }

  clear() {
    this.root = new TrieNode()
    this._size = 0
  }

  _walk(key) {
    let node = this.root
    for (const ch of key) {
      node = node.children.get(ch)
      if (!node) return null
    }
    return node
  }
}

const trie = new Trie()
for (const w of ['cat', 'car', 'card', 'care', 'dog', 'door']) {
  trie.insert(w)
}
console.log(trie.search('car'))
console.log(trie.startsWith('ca'))
console.log(trie.getAllWords())
`,
    typescript: `class TrieNode {
  readonly children = new Map<string, TrieNode>()
  isEndOfWord = false
}

/** Educational prefix tree. Keys are lowercased; empty rejected. */
class Trie {
  private root = new TrieNode()
  private wordCount = 0

  private normalize(word: string): string | null {
    const key = word.trim().toLowerCase()
    return key.length === 0 ? null : key
  }

  insert(word: string): boolean {
    const key = this.normalize(word)
    if (key === null) return false
    let node = this.root
    for (const ch of key) {
      let child = node.children.get(ch)
      if (!child) {
        child = new TrieNode()
        node.children.set(ch, child)
      }
      node = child
    }
    if (node.isEndOfWord) return false
    node.isEndOfWord = true
    this.wordCount += 1
    return true
  }

  search(word: string): boolean {
    const key = this.normalize(word)
    if (key === null) return false
    const node = this.walk(key)
    return Boolean(node?.isEndOfWord)
  }

  startsWith(prefix: string): boolean {
    const key = this.normalize(prefix)
    if (key === null) return false
    return this.walk(key) !== null
  }

  delete(word: string): boolean {
    const key = this.normalize(word)
    if (key === null) return false
    if (!this.search(key)) return false

    const dfs = (node: TrieNode, i: number): boolean => {
      if (i === key.length) {
        node.isEndOfWord = false
        return node.children.size === 0
      }
      const ch = key[i]!
      const child = node.children.get(ch)
      if (!child) return false
      const shouldDelete = dfs(child, i + 1)
      if (shouldDelete) node.children.delete(ch)
      return (
        !node.isEndOfWord &&
        node.children.size === 0 &&
        node !== this.root
      )
    }

    dfs(this.root, 0)
    this.wordCount -= 1
    return true
  }

  getAllWords(): string[] {
    const out: string[] = []
    const dfs = (node: TrieNode, built: string) => {
      if (node.isEndOfWord && built.length > 0) out.push(built)
      for (const ch of [...node.children.keys()].sort()) {
        dfs(node.children.get(ch)!, built + ch)
      }
    }
    dfs(this.root, '')
    return out
  }

  size(): number {
    return this.wordCount
  }

  isEmpty(): boolean {
    return this.wordCount === 0
  }

  clear(): void {
    this.root = new TrieNode()
    this.wordCount = 0
  }

  private walk(key: string): TrieNode | null {
    let node: TrieNode | undefined = this.root
    for (const ch of key) {
      node = node.children.get(ch)
      if (!node) return null
    }
    return node
  }
}

const trie = new Trie()
for (const w of ['cat', 'car', 'card', 'care', 'dog', 'door'] as const) {
  trie.insert(w)
}
console.log(trie.search('car'))
console.log(trie.startsWith('ca'))
console.log(trie.getAllWords())
`,
  },

  whenToUse: [
    'You need prefix queries: autocomplete, typeahead, or “all keys starting with…”.',
    'Many keys share prefixes and you want to avoid rescanning every string.',
    'You are teaching or modeling dictionary lookup and spell-suggestion candidate sets.',
    'You want operation cost tied to key length L rather than the number of stored words (for Map/array children).',
  ],

  whenNotToUse: [
    'You only need exact key membership or key→value maps — a hash table is usually simpler and faster on average (/learn/hash-table).',
    'The dataset is tiny and a linear scan of strings is clear enough.',
    'Memory is tight and the alphabet/branching would create many sparse nodes.',
    'You need ordered numeric search trees — use a BST/AVL (/learn/binary-search-tree, /learn/avl-tree) instead.',
  ],

  keyTakeaways: [
    'A Trie is a prefix tree: shared beginnings share one path from the root.',
    'Nodes use a character→child map plus isEndOfWord to mark complete words.',
    'Insert, search, prefix, and delete are O(L) average; space is O(nodes).',
    'Deletion must preserve shared prefixes — unmark, then prune only unused nodes.',
    'Prefer a Trie for prefixes; prefer a hash table for exact keys; prefer a list only for tiny sets.',
    'Applications: autocomplete, dictionaries, suggestions, spell check, prefix filtering, routing concepts.',
  ],

  previousLesson: {
    title: 'Graph Data Structure',
    href: '/learn/graph',
  },

  nextLesson: {
    title: 'Hash Table',
    href: '/learn/hash-table',
  },

  categoryHref: '/data-structures',
}
