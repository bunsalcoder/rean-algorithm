import type { Lesson } from './types'

export const hashTable: Lesson = {
  slug: 'hash-table',
  title: 'Hash Table',
  description:
    'Learn hash tables: key–value pairs, hash functions, buckets, collisions, separate chaining, linear probing overview, load factor, resizing, and average vs worst-case complexity.',
  category: 'Data Structures',
  difficulty: 'Beginner',
  estimatedTime: '35 min',
  tags: ['Data Structures', 'Hash Table', 'Hashing', 'Map', 'Beginner'],

  objectives: [
    'Understand what a hash table is and why it exists.',
    'Explain key–value pairs and how they differ from plain arrays.',
    'Describe how a hash function maps a key to an array index.',
    'Explain buckets and why collisions happen.',
    'Understand separate chaining as a collision-resolution strategy.',
    'Compare separate chaining with linear probing at a conceptual level.',
    'Perform insertion, lookup, update, deletion, and membership checks.',
    'Interpret load factor and why resizing/rehashing matters.',
    'State average-case and worst-case complexity for common operations.',
  ],

  overview: [
    'A hash table (hash map) stores key–value pairs so you can look up a value by key in average O(1) time.',
    'Instead of scanning every entry, a hash function turns the key into a number, then into a bucket index: index = hash(key) % capacity.',
    'Different keys can land in the same bucket — that is a collision. This lesson’s playground resolves collisions with separate chaining: each bucket holds a list of entries.',
    'Example capacity 7: apple → one bucket, banana and grape may share another if their hashes collide. Empty buckets stay empty until a key hashes there.',
    'Average-case speed depends on a reasonable hash, a controlled load factor, and a working collision strategy. Worst case can still be O(n) when many keys collide.',
  ],

  whyItMatters: [
    'Dictionaries, maps, sets, caches, and many interview patterns are hash tables underneath.',
    'Frequency counting, anagram checks, and grouping by signature all rely on average-case key lookup.',
    'Understanding collisions and load factor prevents the myth that “hash maps are always O(1).”',
    'Hash tables bridge arrays (indexed storage) and associative access (lookup by arbitrary keys).',
  ],

  visualization: {
    title: 'Hash table in action',
    description:
      'Step through set, get, update, delete, contains, and statistics. Watch the educational rolling hash, bucket index, collision chains, and resize/rehash when the load factor grows.',
    type: 'hash-table',
  },

  steps: [
    {
      title: 'See key–value storage',
      description:
        'Each entry is a pair: a key (used for lookup) and a value (the data you store). Keys identify; values carry payload.',
    },
    {
      title: 'Hash the key',
      description:
        'An educational polynomial rolling hash turns a string into an unsigned integer: hash = (hash * 31 + charCode) >>> 0. This is deterministic for demos — not a production universal hash.',
    },
    {
      title: 'Map hash → bucket index',
      description:
        'index = hash % capacity. Capacity is the number of buckets (default 7 in the playground).',
    },
    {
      title: 'Handle collisions with chaining',
      description:
        'If the bucket already has entries, append or walk the chain. Multiple keys can share one index.',
    },
    {
      title: 'Insert, get, update, delete',
      description:
        'set inserts or updates. get and has walk the chain. update fails if the key is missing. delete unlinks an entry from its bucket.',
    },
    {
      title: 'Watch load factor and resizing',
      description:
        'load factor = size / capacity. When inserting a new key would exceed the threshold (default 0.75), capacity doubles and entries are rehashed.',
    },
    {
      title: 'Compare with linear probing',
      description:
        'Open addressing (e.g. linear probing) stores one entry per slot and searches forward on collision. This lesson implements chaining; probing is covered conceptually.',
    },
  ],

  thinkingGuide: {
    title: 'Think in “hash → index → chain”',
    description:
      'Before coding, rehearse the path from key to bucket.',
    steps: [
      'Name the key and value. Ask: is this insert, update, lookup, or delete?',
      'Compute hash, then index = hash % capacity.',
      'Inspect that bucket: empty, single entry, or a chain?',
      'On insert of a new key, check whether load factor requires resize/rehash.',
      'Never assume uniqueness of indices — plan for collisions.',
    ],
  },

  complexity: {
    time: {
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(n)',
    },
    space: 'O(n)',
    notes: {
      time: [
        'Insert / search / update / delete: average O(1) with a suitable hash, controlled load factor, and reasonable key distribution.',
        'Worst case O(n) when many keys collide into one chain (or when open addressing clusters badly).',
        'An individual resize/rehash is O(n). With doubling, inserts remain amortized O(1) under typical policies.',
        'Average-case claims are not guarantees for adversarial keys or a broken hash.',
      ],
      space: [
        'Storing n entries uses O(n) space, plus bucket array overhead.',
        'Separate chaining needs extra memory for chain nodes/lists.',
        'Open addressing avoids chain pointers but still needs spare empty slots for performance.',
      ],
    },
  },

  commonMistakes: {
    description:
      'Most hash-table bugs come from collisions, falsy values, or assuming perfect O(1).',
    mistakes: [
      {
        title: 'Assuming every key gets a unique index',
        explanation:
          'A hash maps into a finite bucket array. Collisions are normal. Always handle chains or probing.',
      },
      {
        title: 'Treating 0, false, or "" as “missing”',
        explanation:
          'Membership (has) is not the same as a truthy value. Empty-string keys and falsy values are valid.',
      },
      {
        title: 'Inserting duplicate keys instead of updating',
        explanation:
          'set(key, value) should update the existing entry. Duplicate keys break the map abstraction.',
      },
      {
        title: 'Ignoring load factor',
        explanation:
          'As the table fills, chains grow (or probes lengthen). Resize/rehash to keep average costs low.',
      },
      {
        title: 'Mutating shared history while visualizing',
        explanation:
          'Clone bucket arrays for each frame. Reusing one mutable table rewrites earlier steps when scrubbing.',
      },
      {
        title: 'Calling an educational hash “cryptographic” or “universal”',
        explanation:
          'The rolling hash here is for teaching and reproducible tests. Production maps use carefully engineered hashers and often randomized seeds.',
      },
    ],
  },

  algorithmConnection: {
    title: 'Hash Table vs Array vs Linked List',
    eyebrow: 'COMPARE',
    description:
      'Choose the structure that matches your access pattern — and see how hashing powers Frequency Counting and Group Anagrams.',
    items: [
      {
        title: 'Hash Table vs Array',
        description:
          'Arrays excel at index access O(1) and ordered scans. Hash tables excel at associative lookup by arbitrary keys in average O(1), without requiring integer indices.',
      },
      {
        title: 'Hash Table vs Linked List',
        description:
          'Linked lists make local inserts cheap once you have a node, but search is O(n). A hash table turns key search into a hash + short chain walk on average.',
      },
      {
        title: 'Separate chaining vs linear probing',
        description:
          'Chaining stores a collection per bucket; deletion is straightforward. Linear probing searches the next open slot (open addressing) and needs careful deletion (often tombstones). Crowding hurts probing more.',
      },
      {
        title: 'Frequency Counting',
        description:
          'Counting occurrences is “map key → count.” The Frequency Counting lesson applies this table as a frequency map.',
      },
      {
        title: 'Group Anagrams',
        description:
          'Group Anagrams uses a map from signature → list of words. Same hash-table idea: key identifies a group; value holds members.',
      },
      {
        title: 'Other applications',
        description:
          'Caches, dictionaries, duplicate detection, database-style indexing by key, and compiler symbol tables all lean on associative lookup.',
      },
    ],
  },

  pseudocode: `HashTable (separate chaining)
  buckets[0 .. capacity-1] = empty lists
  size = 0
  loadFactorThreshold = 0.75   // educational default

Hash(key)  // educational rolling hash — not production universal hashing
  h = 0
  for each character c in key
      h = (h * 31 + code(c)) modulo 2^32   // unsigned
  return h

Index(key)
  return Hash(key) modulo capacity

Set(table, key, value)
  if key is new and (size + 1) / capacity > loadFactorThreshold
      grow capacity (e.g. double) and Rehash all entries
  i = Index(key)
  for each entry in buckets[i]
      if entry.key equals key
          entry.value = value   // update — no duplicate key
          return
  append (key, value) to buckets[i]   // may be a collision
  size = size + 1

Get(table, key)
  i = Index(key)
  for each entry in buckets[i]
      if entry.key equals key
          return entry.value
  return not found

Has(table, key)
  return Get finds the key   // works even if value is 0, false, or ""

Delete(table, key)
  i = Index(key)
  remove matching entry from buckets[i] if present
  if removed: size = size - 1

LoadFactor(table)
  return size / capacity

// Linear probing (conceptual — not implemented in the playground)
// On collision, try i+1, i+2, ... modulo capacity until an empty slot.
// Deletion usually needs tombstones so later probes still work.`,

  code: {
    python: `class HashTable:
    """Educational separate-chaining hash table for string keys."""

    def __init__(self, capacity=7, load_factor_threshold=0.75):
        if capacity < 1:
            raise ValueError("capacity must be a positive integer")
        self.capacity = capacity
        self.load_factor_threshold = load_factor_threshold
        self.buckets = [[] for _ in range(capacity)]
        self.size = 0

    def _hash(self, key: str) -> int:
        h = 0
        for ch in key:
            h = (h * 31 + ord(ch)) & 0xFFFFFFFF  # unsigned 32-bit
        return h

    def _index(self, key: str) -> int:
        return self._hash(key) % self.capacity

    def load_factor(self) -> float:
        return self.size / self.capacity

    def _rehash(self, new_capacity: int) -> None:
        old = [entry for bucket in self.buckets for entry in bucket]
        self.capacity = new_capacity
        self.buckets = [[] for _ in range(new_capacity)]
        self.size = 0
        for key, value in old:
            self.set(key, value)

    def set(self, key: str, value) -> None:
        if key not in dict(self.entries()) and (self.size + 1) / self.capacity > self.load_factor_threshold:
            self._rehash(self.capacity * 2)
        i = self._index(key)
        bucket = self.buckets[i]
        for idx, (k, _) in enumerate(bucket):
            if k == key:
                bucket[idx] = (key, value)
                return
        bucket.append((key, value))
        self.size += 1

    def get(self, key: str):
        for k, v in self.buckets[self._index(key)]:
            if k == key:
                return v
        return None

    def has(self, key: str) -> bool:
        return any(k == key for k, _ in self.buckets[self._index(key)])

    def delete(self, key: str) -> bool:
        bucket = self.buckets[self._index(key)]
        for idx, (k, _) in enumerate(bucket):
            if k == key:
                bucket.pop(idx)
                self.size -= 1
                return True
        return False

    def entries(self):
        for bucket in self.buckets:
            for entry in bucket:
                yield entry


table = HashTable()
table.set("apple", 10)
table.set("banana", 20)
print(table.get("apple"))   # 10
table.set("apple", 99)      # update
print(table.has(""))        # False until inserted
table.set("", 0)
print(table.get(""))        # 0`,

    javascript: `class HashTable {
  /** Educational separate-chaining hash table for string keys. */
  constructor(capacity = 7, loadFactorThreshold = 0.75) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new Error('capacity must be a positive integer')
    }
    this.capacity = capacity
    this.loadFactorThreshold = loadFactorThreshold
    this.buckets = Array.from({ length: capacity }, () => [])
    this.size = 0
  }

  hash(key) {
    let h = 0
    for (let i = 0; i < key.length; i += 1) {
      h = (h * 31 + key.charCodeAt(i)) >>> 0
    }
    return h
  }

  index(key) {
    return this.hash(key) % this.capacity
  }

  loadFactor() {
    return this.size / this.capacity
  }

  rehash(newCapacity) {
    const old = this.entries()
    this.capacity = newCapacity
    this.buckets = Array.from({ length: newCapacity }, () => [])
    this.size = 0
    for (const [key, value] of old) {
      this.set(key, value)
    }
  }

  set(key, value) {
    if (!this.has(key) && (this.size + 1) / this.capacity > this.loadFactorThreshold) {
      this.rehash(this.capacity * 2)
    }
    const bucket = this.buckets[this.index(key)]
    for (let i = 0; i < bucket.length; i += 1) {
      if (bucket[i].key === key) {
        bucket[i] = { key, value }
        return
      }
    }
    bucket.push({ key, value })
    this.size += 1
  }

  get(key) {
    for (const entry of this.buckets[this.index(key)]) {
      if (entry.key === key) return entry.value
    }
    return undefined
  }

  has(key) {
    return this.buckets[this.index(key)].some((entry) => entry.key === key)
  }

  delete(key) {
    const bucket = this.buckets[this.index(key)]
    const idx = bucket.findIndex((entry) => entry.key === key)
    if (idx < 0) return false
    bucket.splice(idx, 1)
    this.size -= 1
    return true
  }

  entries() {
    return this.buckets.flat()
  }
}

const table = new HashTable()
table.set('apple', 10)
table.set('banana', 20)
console.log(table.get('apple')) // 10
table.set('apple', 99) // update
table.set('', 0)
console.log(table.get('')) // 0
console.log(table.has('missing')) // false`,

    typescript: `type Entry = { key: string; value: string | number | boolean }

/** Educational separate-chaining hash table for string keys. */
class HashTable {
  private buckets: Entry[][]
  private _size = 0
  capacity: number
  loadFactorThreshold: number

  constructor(capacity = 7, loadFactorThreshold = 0.75) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new Error('capacity must be a positive integer')
    }
    this.capacity = capacity
    this.loadFactorThreshold = loadFactorThreshold
    this.buckets = Array.from({ length: capacity }, () => [])
  }

  hash(key: string): number {
    let h = 0
    for (let i = 0; i < key.length; i += 1) {
      h = (h * 31 + key.charCodeAt(i)) >>> 0
    }
    return h
  }

  index(key: string): number {
    return this.hash(key) % this.capacity
  }

  size(): number {
    return this._size
  }

  loadFactor(): number {
    return this._size / this.capacity
  }

  private rehash(newCapacity: number): void {
    const old = this.entries()
    this.capacity = newCapacity
    this.buckets = Array.from({ length: newCapacity }, () => [])
    this._size = 0
    for (const entry of old) {
      this.set(entry.key, entry.value)
    }
  }

  set(key: string, value: string | number | boolean): void {
    if (
      !this.has(key) &&
      (this._size + 1) / this.capacity > this.loadFactorThreshold
    ) {
      this.rehash(this.capacity * 2)
    }
    const bucket = this.buckets[this.index(key)]!
    const existing = bucket.findIndex((entry) => entry.key === key)
    if (existing >= 0) {
      bucket[existing] = { key, value }
      return
    }
    bucket.push({ key, value })
    this._size += 1
  }

  get(key: string): string | number | boolean | undefined {
    return this.buckets[this.index(key)]!.find((entry) => entry.key === key)
      ?.value
  }

  has(key: string): boolean {
    return this.buckets[this.index(key)]!.some((entry) => entry.key === key)
  }

  delete(key: string): boolean {
    const bucket = this.buckets[this.index(key)]!
    const idx = bucket.findIndex((entry) => entry.key === key)
    if (idx < 0) return false
    bucket.splice(idx, 1)
    this._size -= 1
    return true
  }

  entries(): Entry[] {
    return this.buckets.flat()
  }
}

const table = new HashTable()
table.set('apple', 10)
table.set('banana', 20)
console.log(table.get('apple')) // 10
table.set('apple', 99)
table.set('', 0)
console.log(table.get('')) // 0
console.log(table.has('missing')) // false`,
  },

  whenToUse: [
    'You need average-case fast insert, lookup, and delete by key.',
    'You are building a dictionary, set, cache, frequency map, or grouping structure.',
    'Keys are not convenient dense integer indices (or you care about associative access).',
    'You can accept unordered iteration and extra memory for buckets/chains.',
  ],

  whenNotToUse: [
    'You need sorted keys or range queries — consider a balanced tree or sorted array.',
    'You need stable worst-case O(1) without hashing assumptions — hashing’s worst case is O(n).',
    'You only need contiguous integer indices — a plain array is simpler.',
    'You need guaranteed ordering of insertion for iteration (unless you add extra bookkeeping).',
  ],

  keyTakeaways: [
    'A hash table stores key–value pairs and locates them via hash(key) → bucket index.',
    'Collisions are expected; separate chaining keeps multiple entries in one bucket list.',
    'Linear probing is an open-addressing alternative that needs careful deletion handling.',
    'set updates existing keys; has/get must treat 0, false, and "" as real values.',
    'Average operations are O(1); worst case is O(n). Resize/rehash is O(n) but amortized O(1) with doubling.',
    'Load factor tracks fullness; controlling it keeps chains (or probes) short.',
    'Frequency Counting and Group Anagrams are direct applications of this structure.',
  ],

  previousLesson: {
    title: 'Deque',
    href: '/learn/deque',
  },

  nextLesson: {
    title: 'Frequency Counting',
    href: '/learn/frequency-counting',
  },

  categoryHref: '/data-structures',
}
