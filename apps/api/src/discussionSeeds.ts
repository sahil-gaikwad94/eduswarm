/**
 * EduSwarm Discussions — curated cold-start seeds
 * -----------------------------------------------
 * A brand-new community surface fails when the first visit shows an empty feed.
 * These threads are deliberately editorial: real PYQ-grade doubts with real
 * breakdowns, anchored to canonical curriculum topic ids, each carrying a
 * "+20 XP peer challenge" so early visitors know participation is rewarded.
 *
 * Seeding is insert-if-missing (see `Store.seedDiscussions`), so user upvotes,
 * comments, and resolutions are never overwritten on redeploy.
 * `seededVotes` is an editorial head-count, kept separate from real `upvoterIds`
 * so authenticity is never conflated — serialization adds the two transparently.
 */
import type { StoredDiscussion, StoredDiscussionComment } from './store.js';

const HOUR = 3_600_000;

type SeedComment = Omit<StoredDiscussionComment, 'postId'>;
type SeedInput = {
  id: string; kind: 'doubt' | 'thought' | 'shared-kit';
  authorId: string; authorName: string; authorStreak?: number;
  title: string; body: string;
  topicId?: string; topicTitle?: string; questionId?: string;
  isResolved: boolean; seeded?: boolean; seededVotes: number; createdAt: string;
  comments: SeedComment[];
};

export function buildDiscussionSeeds(now = Date.now()): StoredDiscussion[] {
  const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
  const upvoterIds: string[] = [];
  const seed = (input: SeedInput): StoredDiscussion => ({
    ...input,
    upvoterIds,
    comments: input.comments.map((comment) => ({ ...comment, postId: input.id })),
    updatedAt: input.createdAt,
  });

  return [
    seed({
      id: 'seed-deadlock-one-more-mutex', kind: 'doubt',
      authorId: 'seed-ananya', authorName: 'Ananya · CSE, NIT Warangal', authorStreak: 14,
      title: 'Why did adding ONE more mutex suddenly cause deadlocks?',
      body: 'Our project had two locks and zero issues. We added a logging mutex and now two threads freeze under load. Prof said "you re-ordered acquisition somewhere". How do I even see it? GATE has this same pattern.',
      topicId: 'gate-cs-operating-systems-synchronization-and-deadlocks', topicTitle: 'Synchronization and Deadlocks',
      isResolved: true, seeded: true, seededVotes: 47, createdAt: iso(3 * HOUR),
      comments: [
        {
          id: 'seed-c-deadlock-dean', authorId: 'seed-dean', authorName: 'Doddly · EduSwarm Dean',
          body: 'Deadlock needs all four Coffman conditions at the same time: mutual exclusion, hold-and-wait, no preemption, and a circular wait. Your logging mutex closed a cycle in the wait-for graph. The fix is never "more locks" — it is one global lock order (e.g. always acquire in address order) and doing blocking work outside critical sections. Trace lock order in your threads and find the edge where someone grabs logging before the other lock while someone else does the opposite.',
          createdAt: iso(2.6 * HOUR),
        },
        {
          id: 'seed-c-deadlock-peer', authorId: 'seed-rahul', authorName: 'Rahul · M.Tech, IIIT-H',
          body: 'Classic. I drew the wait-for graph on paper: Thread1 holds A wants B, Thread2 holds B wants logging, and the logging call wanted A. Cycle of 3. +20 XP to anyone who can post the minimal code shape that reproduces it.',
          createdAt: iso(1.4 * HOUR),
        },
      ],
    }),
    seed({
      id: 'seed-binary-search-total-order', kind: 'doubt',
      authorId: 'seed-priya', authorName: 'Priya · CSE, VIT Vellore', authorStreak: 6,
      title: 'Why does binary search REALLY need a sorted array?',
      body: 'I memorized "sorted → O(log n)" but my batchmate asked me to prove it fails on unsorted input and I froze. What is the actual invariant?',
      topicId: 'algo-complexity', topicTitle: 'Time and Space Complexity',
      isResolved: true, seeded: true, seededVotes: 38, createdAt: iso(9 * HOUR),
      comments: [
        {
          id: 'seed-c-bsearch-dean', authorId: 'seed-dean', authorName: 'Doddly · EduSwarm Dean',
          body: 'The invariant is: the target, if present anywhere, lies inside [lo, hi] at every step — and sortedness is what makes the comparison against the middle element discard a half you can PROVE cannot contain it. Binary search does not find a number; it eliminates a region. Unsorted input breaks that proof: the "discarded" half may contain the target, so you can report "not found" for a value that is present. Test it on [3, 1, 4, 1, 5] searching for 1 and watch it skip past.',
          createdAt: iso(8 * HOUR),
        },
      ],
    }),
    seed({
      id: 'seed-belady-anomaly', kind: 'doubt',
      authorId: 'seed-vikram', authorName: 'Vikram · CSE, DTU Delhi', authorStreak: 9,
      title: 'GATE trap: more page frames → MORE page faults?!',
      body: 'PYQ-style question: reference string 1 2 3 4 1 2 5 1 2 3 4 5, frames 3 vs 4, FIFO. Answers differ by MORE faults with MORE frames. Is this Belady\'s anomaly and why does it happen for FIFO but not LRU?',
      topicId: 'gate-cs-operating-systems-memory-management', topicTitle: 'Memory Management',
      isResolved: true, seeded: true, seededVotes: 52, createdAt: iso(1.2 * 24 * HOUR),
      comments: [
        {
          id: 'seed-c-belady-dean', authorId: 'seed-dean', authorName: 'Doddly · EduSwarm Dean',
          body: 'Yes — that exact sequence is the canonical Belady\'s anomaly example. With 3 frames FIFO gets 9 faults; with 4 frames it gets 10. The reason is structural: FIFO is not a stack algorithm, so the set of pages it keeps with m frames is not guaranteed to be a subset of what it keeps with m+1 frames. LRU never shows the anomaly because the m-frame LRU set is always a subset of the (m+1)-frame set (stack property). Intuition to memorize: "stack algorithms don\'t suffer Belady; FIFO is not a stack algorithm."',
          createdAt: iso(1.1 * 24 * HOUR),
        },
        {
          id: 'seed-c-belady-peer', authorId: 'seed-ananya', authorName: 'Ananya · CSE, NIT Warangal', body: 'Remember OPT (Belady\'s MIN) as the lower bound: faults(m) never increases with m for OPT. GATE loves asking faults(frames) for FIFO vs LRU vs OPT side by side. +20 XP for posting a reference string where LRU also shows the anomaly (spoiler: never happens — that\'s the trick).',
          createdAt: iso(20 * HOUR),
        },
      ],
    }),
    seed({
      id: 'seed-3nf-vs-bcnf', kind: 'doubt',
      authorId: 'seed-sneha', authorName: 'Sneha · IT, KIIT Bhubaneswar', authorStreak: 4,
      title: '3NF vs BCNF in GATE — which normal form gets tested where?',
      body: 'Every video explains definitions but the questions mix "relation in 3NF but not BCNF" with multiple candidate keys and I get lost. Give me the exact check procedure.',
      topicId: 'gate-cs-database-management-systems-functional-dependencies-and-normalization', topicTitle: 'Functional Dependencies and Normalization',
      isResolved: true, seeded: true, seededVotes: 33, createdAt: iso(2 * 24 * HOUR),
      comments: [
        {
          id: 'seed-c-bcnf-dean', authorId: 'seed-dean', authorName: 'Doddly · EduSwarm Dean',
          body: 'Procedure: (1) find ALL candidate keys via attribute closure (do not stop at the first); (2) list every non-trivial FD in the question; (3) BCNF test: for each FD X→Y, is X a superkey? If any fails, it is not BCNF. (4) 3NF test for the failing FDs only: is Y−X a subset of some candidate key (prime attribute), or is X a superkey? If yes for all, it is 3NF. GATE\'s favorite trap: a relation with two candidate keys AB→C and C→D where C is NOT a superkey — 3NF holds (D is prime) but BCNF fails. Compute closures, never eyeball.',
          createdAt: iso(1.8 * 24 * HOUR),
        },
      ],
    }),
    seed({
      id: 'seed-master-theorem-case-2', kind: 'doubt',
      authorId: 'seed-arjun', authorName: 'Arjun · ECE, BITS Pilani', authorStreak: 11,
      title: 'Master theorem: when exactly do I add the extra log n?',
      body: 'T(n) = 2T(n/2) + n log n. Tutorials say Case 2 but then the answer picks up another log factor. Why?',
      topicId: 'gate-cs-algorithms-divide-and-conquer', topicTitle: 'Divide and Conquer',
      isResolved: true, seeded: true, seededVotes: 29, createdAt: iso(3.5 * 24 * HOUR),
      comments: [
        {
          id: 'seed-c-mt-dean', authorId: 'seed-dean', authorName: 'Doddly · EduSwarm Dean',
          body: 'Case 2 is f(n) = Θ(n^(log_b a) · log^k n) with k ≥ 0, and the answer is Θ(n^(log_b a) · log^(k+1) n). Here a=2, b=2 so n^(log_2 2) = n^1, and f(n) = n log n = n^1 · log^1 n — k = 1. So the answer is n · log^2 n. Solve by recursion tree instead of memorizing: at depth i the work is 2^i · (n/2^i) · log(n/2^i) = n(log n − i), summed over log n levels = n log n + n(log n − 1) + ... ≈ n log²n/2. Same answer, no formula.',
          createdAt: iso(3 * 24 * HOUR),
        },
      ],
    }),
    seed({
      id: 'seed-attention-sqrt-dk', kind: 'doubt',
      authorId: 'seed-meera', authorName: 'Meera · CSE, IIT-BHU', authorStreak: 7,
      title: 'Why √d_k and not, say, d_k or nothing?',
      body: 'Transformer derivations say "dot products get large, softmax saturates, gradients vanish — divide by √d_k". Large compared to WHAT? Why the square root?',
      topicId: 'ai-ml-nlp-and-language-models-transformers', topicTitle: 'Transformers',
      isResolved: true, seeded: true, seededVotes: 41, createdAt: iso(5 * 24 * HOUR),
      comments: [
        {
          id: 'seed-c-attn-dean', authorId: 'seed-dean', authorName: 'Doddly · EduSwarm Dean',
          body: 'If q and k entries are independent with mean 0 and variance 1, their dot product q·k = Σ over d_k terms has mean 0 and variance d_k. So the standard deviation is √d_k. Dividing by √d_k normalizes the score to unit variance regardless of dimension — that keeps softmax out of its saturated region where gradients are vanishing. Dividing by d_k would over-correct (you would need q,k entries with std d_k^-1 instead); dividing by nothing lets d_k=512 produce scores with std 22, where softmax is a near one-hot. It is just variance normalization.',
          createdAt: iso(4.6 * 24 * HOUR),
        },
      ],
    }),
    seed({
      id: 'seed-dp-state-design-thought', kind: 'thought',
      authorId: 'seed-karthik', authorName: 'Karthik · CSE, Amrita', authorStreak: 16,
      title: 'DP clicked for me the day I stopped drawing trees and started drawing tables',
      body: 'For months DP felt like pattern-matching magic tricks. What fixed it: write dp[i] as a sentence ("best answer using first i items"), fill the table BY HAND for n=4, and only then write code. Tabulation exposed that I was skipping the base case 50% of the time. What broke the wall for you?',
      topicId: 'gate-cs-algorithms-dynamic-programming', topicTitle: 'Dynamic Programming',
      isResolved: false, seeded: true, seededVotes: 26, createdAt: iso(7 * 24 * HOUR),
      comments: [
        {
          id: 'seed-c-dp-peer', authorId: 'seed-priya', authorName: 'Priya · CSE, VIT Vellore',
          body: 'Same wall here. The sentence trick works — "dp[i][j] = best knapsack value with items 1..i and capacity j" kills the hand-waving. Also: solve blind 75\'s DP set in one week, handwritten tables, then re-derive LCS and Edit Distance from the recurrence alone.',
          createdAt: iso(6.5 * 24 * HOUR),
        },
      ],
    }),
    seed({
      id: 'seed-gate-overflow-vs-here', kind: 'thought',
      authorId: 'seed-rahul', authorName: 'Rahul · M.Tech, IIIT-H', authorStreak: 12,
      title: 'Why I moved my doubts from a 5,000-member Telegram group to here',
      body: 'Telegram: ask a doubt at 11 pm, scroll past 40 memes to find three wrong answers, your question rots by morning. Here: doubt is tagged to the exact tutorial and question id, answers are grounded in the syllabus, and good answers get kept. The Peer Challenge +20 XP is cheesy and I love it. Roast this setup.',
      topicId: 'gate-cs-operating-systems-synchronization-and-deadlocks', topicTitle: 'Synchronization and Deadlocks',
      isResolved: false, seeded: true, seededVotes: 22, createdAt: iso(9 * 24 * HOUR),
      comments: [
        {
          id: 'seed-c-overflow-dean', authorId: 'seed-dean', authorName: 'Doddly · EduSwarm Dean',
          body: 'Fair roast question. The honest answer: threads anchored to canonical topic ids compound (every future learner of deadlocks lands here); unanchored chat scrolls away forever. Moderation will scale with trust levels — early voices set the norms. +20 XP to anyone who points out the biggest flaw in this design.',
          createdAt: iso(8.5 * 24 * HOUR),
        },
      ],
    }),
  ];
}
