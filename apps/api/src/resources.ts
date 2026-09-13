/**
 * EduSwarm Reading Room — curated, genuinely-free blogs and reading lists.
 *
 * Each universe gets popular, high-signal blogs/resources mapped to the exact
 * modules of that universe's curriculum, so the Library page can filter by the
 * live syllabus. Everything here is free to read.
 */
import { getCatalog, type CurriculumGoal } from './curriculum.js';

export type ResourceKind = 'blog' | 'course' | 'book' | 'docs' | 'community' | 'practice' | 'reference';

export type LearningResource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  blurb: string;
  kind: ResourceKind;
  modules: string[]; // exact module names from the universe curriculum
};

const webDev: LearningResource[] = [
  { id: 'web-dev', title: 'web.dev', publisher: 'Google Chrome team', url: 'https://web.dev/', kind: 'blog',
    blurb: 'The modern canon of web fundamentals: Core Web Vitals, CSS, forms, accessibility, and PWA patterns — written by the people who build Chrome.',
    modules: ['Web Foundations', 'Production Engineering', 'Advanced Frontend'] },
  { id: 'josh-comeau', title: 'Josh W Comeau’s Blog', publisher: 'Josh W Comeau', url: 'https://www.joshwcomeau.com/', kind: 'blog',
    blurb: 'Interactive, beautifully animated deep dives on CSS layout, React rendering, and the mental models that make frontend click.',
    modules: ['Web Foundations', 'JavaScript and TypeScript', 'React Ecosystem', 'Design for Engineers'] },
  { id: 'kent-c-dodds', title: 'Kent C. Dodds', publisher: 'Kent C. Dodds', url: 'https://kentcdodds.com/blog', kind: 'blog',
    blurb: 'The definitive React testing and hooks writing — including “Testing Implementation Details” and “A Complete Guide to useEffect” companions.',
    modules: ['React Ecosystem', 'Testing and Delivery', 'JavaScript and TypeScript'] },
  { id: 'overreacted', title: 'Overreacted', publisher: 'Dan Abramov', url: 'https://overreacted.io/', kind: 'blog',
    blurb: 'Dan Abramov’s essays on how React really works — reconciliation, closures, algebraic effects — short posts that change how you code.',
    modules: ['React Ecosystem', 'JavaScript and TypeScript'] },
  { id: 'css-tricks', title: 'CSS-Tricks', publisher: 'The Astronomer team', url: 'https://css-tricks.com/', kind: 'blog',
    blurb: 'Twenty years of practical CSS wisdom: Flexbox and Grid guides, almanacs, and techniques for real layouts.',
    modules: ['Web Foundations', 'Design for Engineers'] },
  { id: 'smashing-magazine', title: 'Smashing Magazine', publisher: 'Smashing Media', url: 'https://www.smashingmagazine.com/', kind: 'blog',
    blurb: 'Senior-level articles on frontend craft, performance, design systems, and UX engineering.',
    modules: ['Web Foundations', 'Design for Engineers', 'Production Engineering'] },
  { id: 'javascript-info', title: 'The Modern JavaScript Tutorial', publisher: 'javascript.info', url: 'https://javascript.info/', kind: 'docs',
    blurb: 'A free, constantly-updated book covering JavaScript from first principles to closures, prototypes, and the event loop.',
    modules: ['JavaScript and TypeScript'] },
  { id: 'total-typescript', title: 'Total TypeScript Blog', publisher: 'Matt Pocock', url: 'https://www.totaltypescript.com/articles', kind: 'blog',
    blurb: 'Bite-sized TypeScript articles that demystify generics, inference, and the trickiest utility types.',
    modules: ['JavaScript and TypeScript'] },
  { id: 'patterns-dev', title: 'Patterns.dev', publisher: 'Ravi K. & Lydia Hallie', url: 'https://www.patterns.dev/', kind: 'reference',
    blurb: 'Rendering, design, and performance patterns for modern web apps — free essays with interactive examples.',
    modules: ['JavaScript and TypeScript', 'React Ecosystem', 'System Design'] },
  { id: 'mdn-learn', title: 'MDN Web Docs: Learn', publisher: 'Mozilla', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development', kind: 'docs',
    blurb: 'The authoritative, vendor-neutral reference for HTML, CSS, JavaScript, and browser APIs. Every professional keeps this tab open.',
    modules: ['Web Foundations', 'JavaScript and TypeScript', 'Advanced Frontend'] },
  { id: 'nodejs-blog', title: 'Node.js Blog & Learn', publisher: 'OpenJS Foundation', url: 'https://nodejs.org/en/learn', kind: 'docs',
    blurb: 'Official guides on the event loop, streams, workers, and async patterns straight from the Node.js maintainers.',
    modules: ['Backend with Node.js'] },
  { id: 'vercel-blog', title: 'Vercel Engineering Blog', publisher: 'Vercel', url: 'https://vercel.com/blog', kind: 'blog',
    blurb: 'Deep posts on Next.js, server components, edge computing, and deploying at scale — from the team behind the framework.',
    modules: ['React Ecosystem', 'Production Engineering'] },
  { id: 'postgresql-docs', title: 'PostgreSQL Documentation & Wiki', publisher: 'PostgreSQL Global Dev Group', url: 'https://www.postgresql.org/docs/', kind: 'docs',
    blurb: 'The gold standard of database docs — transactions, indexes, EXPLAIN, and internals explained properly.',
    modules: ['Data and Persistence', 'System Design'] },
  { id: 'system-design-primer', title: 'The System Design Primer', publisher: 'Donne Martin (GitHub)', url: 'https://github.com/donnemartin/system-design-primer', kind: 'reference',
    blurb: 'The most-starred system design resource on GitHub: free diagrams, trade-off tables, and worked designs.',
    modules: ['System Design', 'Production Engineering'] },
  { id: 'owasp-top10', title: 'OWASP Top 10', publisher: 'OWASP Foundation', url: 'https://owasp.org/www-project-top-ten/', kind: 'reference',
    blurb: 'The industry checklist of web security risks with concrete prevention guidance — required reading for backend work.',
    modules: ['Production Engineering', 'Backend with Node.js'] },
  { id: 'playwright-docs', title: 'Playwright Docs', publisher: 'Microsoft', url: 'https://playwright.dev/docs/intro', kind: 'docs',
    blurb: 'Best-practice E2E testing guidance: auto-waiting, locators, fixtures, and tracing.',
    modules: ['Testing and Delivery'] },
  { id: 'piccalilli', title: 'Piccalilli', publisher: 'Andy Bell', url: 'https://piccalil.li/', kind: 'blog',
    blurb: 'Pragmatic, modern CSS — the “CUBE CSS” approach, layout utilities, and accessible component recipes.',
    modules: ['Web Foundations', 'Design for Engineers'] },
  { id: 'tanstack-blog', title: 'TanStack Blog', publisher: 'Tanner Linsley & team', url: 'https://tanstack.com/blog', kind: 'blog',
    blurb: 'Essays on data fetching, caches, tables, and forms from the maintainers of TanStack Query.',
    modules: ['React Ecosystem', 'JavaScript and TypeScript'] },
  { id: 'github-engineering', title: 'The GitHub Blog: Engineering', publisher: 'GitHub', url: 'https://github.blog/category/engineering/', kind: 'blog',
    blurb: 'How one of the world’s largest codebases ships: Git internals, Rails at scale, CI, and incident stories.',
    modules: ['Engineering Foundations', 'Production Engineering', 'System Design'] },
  { id: 'git-flight-rules', title: 'Git Flight Rules', publisher: 'Kate Hudson (GitHub)', url: 'https://github.com/k88hudson/git-flight-rules', kind: 'reference',
    blurb: 'A free guide for “something went wrong with git — what do I do?” covering nearly every real-world scenario.',
    modules: ['Engineering Foundations'] },
];

const gateCs: LearningResource[] = [
  { id: 'gate-overflow', title: 'GATE Overflow', publisher: 'GATE CSE community', url: 'https://gateoverflow.in/', kind: 'community',
    blurb: 'The most trusted GATE CS community: every PYQ answered with detailed, debated solutions and subject-wise tests. Free.',
    modules: ['General Aptitude and GATE Strategy', 'PYQ Marathons and Test Strategy', 'Algorithms', 'Programming and Data Structures'] },
  { id: 'nptel-cs', title: 'NPTEL — CSE Courses', publisher: 'IITs & IISc', url: 'https://nptel.ac.in/courses', kind: 'course',
    blurb: 'Free full-length courses by IIT professors covering the entire GATE syllabus — the canonical source for every subject.',
    modules: ['Engineering Mathematics', 'Digital Logic', 'Computer Organization and Architecture', 'Theory of Computation', 'Compiler Design', 'Operating Systems', 'Database Management Systems', 'Computer Networks'] },
  { id: 'mit-ocw', title: 'MIT OpenCourseWare', publisher: 'MIT', url: 'https://ocw.mit.edu/search/?d=Computer%20Science', kind: 'course',
    blurb: 'MIT’s real course materials — legendary algorithms (6.006), operating systems, and math courses with notes and exams.',
    modules: ['Algorithms', 'Engineering Mathematics', 'Operating Systems', 'Programming and Data Structures'] },
  { id: 'geeksforgeeks-gate', title: 'GeeksforGeeks: GATE CS', publisher: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/gate-cs-notes-gq/', kind: 'blog',
    blurb: 'Subject-wise GATE article series with quick revisions, solved examples, and topic-wise practice — a favourite for last-mile prep.',
    modules: ['Algorithms', 'Programming and Data Structures', 'Database Management Systems', 'Computer Networks', 'Operating Systems', 'Compiler Design', 'Theory of Computation', 'Digital Logic', 'Computer Organization and Architecture'] },
  { id: 'visualgo', title: 'VisuAlgo', publisher: 'Dr. Steven Halim (NUS)', url: 'https://visualgo.net/en', kind: 'reference',
    blurb: 'Interactive visualizations of every data structure and algorithm — watch sorting, BST rotations, and graph traversals step by step.',
    modules: ['Algorithms', 'Programming and Data Structures'] },
  { id: 'ostep', title: 'Operating Systems: Three Easy Pieces', publisher: 'Arpaci-Dusseau, UW Madison', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/', kind: 'book',
    blurb: 'The beloved free OS book: virtualization, concurrency, and persistence explained with humour and real code.',
    modules: ['Operating Systems'] },
  { id: 'crafting-interpreters', title: 'Crafting Interpreters', publisher: 'Bob Nystrom', url: 'https://craftinginterpreters.com/', kind: 'book',
    blurb: 'A free, beautifully written book that builds a language interpreter from scratch — the clearest path into compiler ideas.',
    modules: ['Compiler Design', 'Programming and Data Structures'] },
  { id: 'cmu-db', title: 'CMU 15-445: Database Systems', publisher: 'Carnegie Mellon University', url: 'https://15445.courses.cs.cmu.edu/', kind: 'course',
    blurb: 'Andy Pavlo’s free database systems course — lectures, notes, and labs on storage engines, indexing, and concurrency.',
    modules: ['Database Management Systems'] },
  { id: 'network-science-book', title: 'Network Science', publisher: 'Albert-László Barabási', url: 'http://networksciencebook.com/', kind: 'book',
    blurb: 'A free interactive book on graphs and networks — great intuition for graph theory and its real-world structure.',
    modules: ['Engineering Mathematics', 'Algorithms'] },
  { id: 'immersive-linear-algebra', title: 'Immersive Linear Algebra', publisher: 'Strutz et al.', url: 'http://immersivemath.com/ila/', kind: 'book',
    blurb: 'A fully interactive free linear algebra book with 3D figures — vectors, projections, and eigenvalues you can rotate.',
    modules: ['Engineering Mathematics'] },
  { id: 'betterexplained', title: 'BetterExplained', publisher: 'Kalid Azad', url: 'https://betterexplained.com/', kind: 'blog',
    blurb: 'Intuition-first math essays — calculus, e, imaginary numbers, and probability explained the way your brain wants.',
    modules: ['Engineering Mathematics'] },
  { id: 'book-of-proof', title: 'Book of Proof', publisher: 'Richard Hammack (free PDF)', url: 'https://www.people.vcu.edu/~rhammack/BookOfProof/', kind: 'book',
    blurb: 'A free, gentle introduction to proofs, sets, and logic — the foundation of discrete mathematics for GATE.',
    modules: ['Engineering Mathematics', 'Theory of Computation'] },
  { id: 'complexity-zoo', title: 'The Complexity Zoo', publisher: 'Scott Aaronson et al.', url: 'https://complexityzoo.net/Complexity_Zoo', kind: 'reference',
    blurb: 'A playful encyclopedia of every complexity class from P to QSZK — surprisingly useful while studying TOC.',
    modules: ['Theory of Computation'] },
  { id: 'indiabix', title: 'IndiaBIX', publisher: 'IndiaBIX', url: 'https://www.indiabix.com/', kind: 'practice',
    blurb: 'Free aptitude practice with thousands of quant, verbal, and logical reasoning questions with solutions.',
    modules: ['General Aptitude and GATE Strategy'] },
  { id: 'gate-syllabus', title: 'Official GATE CS Syllabus', publisher: 'IIT Guwahati (GATE 2026)', url: 'https://gate2026.iitg.ac.in/', kind: 'reference',
    blurb: 'The official syllabus and exam pattern — pin it, and audit your preparation against it every month.',
    modules: ['General Aptitude and GATE Strategy', 'PYQ Marathons and Test Strategy'] },
  { id: 'cp-algorithms', title: 'CP-Algorithms', publisher: 'Community (translated from e-maxx)', url: 'https://cp-algorithms.com/', kind: 'reference',
    blurb: 'Rigorous, implementation-ready articles on every algorithm — from binary search to suffix automata.',
    modules: ['Algorithms', 'Programming and Data Structures'] },
];

const aiMl: LearningResource[] = [
  { id: 'lilian-weng', title: 'Lil’ Log', publisher: 'Lilian Weng (OpenAI)', url: 'https://lilianweng.github.io/', kind: 'blog',
    blurb: 'The most cited ML blog on the internet — exhaustive, diagram-rich surveys of agents, RLHF, diffusion, hallucination, and more.',
    modules: ['Deep Learning', 'Reinforcement Learning', 'Generative AI Applications', 'NLP and Language Models'] },
  { id: 'chip-huyen', title: 'Chip Huyen’s Blog', publisher: 'Chip Huyen', url: 'https://huyenchip.com/blog/', kind: 'blog',
    blurb: 'Essays on ML systems, RAG, agents, and careers from the author of “Designing Machine Learning Systems”.',
    modules: ['ML System Design', 'MLOps and Production AI', 'Generative AI Applications', 'AI Career Accelerator'] },
  { id: 'jay-alammar', title: 'Jay Alammar’s Illustrated Series', publisher: 'Jay Alammar', url: 'https://jalammar.github.io/', kind: 'blog',
    blurb: '“The Illustrated Transformer” and friends — the visual explanations that made attention intuitive to millions.',
    modules: ['NLP and Language Models', 'Deep Learning', 'Classical Machine Learning'] },
  { id: 'sebastian-raschka', title: 'Ahead of AI', publisher: 'Sebastian Raschka', url: 'https://magazine.sebastianraschka.com/', kind: 'blog',
    blurb: 'Rigorous monthly deep dives on LLM research, training tricks, and hands-on code from a researcher who builds.',
    modules: ['NLP and Language Models', 'Deep Learning', 'Generative AI Applications'] },
  { id: 'distill', title: 'Distill', publisher: 'Distill Working Group', url: 'https://distill.pub/', kind: 'blog',
    blurb: 'The archive of machine learning’s most beautiful interactive articles — attention, feature visualization, and optimization.',
    modules: ['Deep Learning', 'Classical Machine Learning', 'Math and Statistics for ML'] },
  { id: 'colah', title: 'colah’s blog', publisher: 'Chris Olah', url: 'https://colah.github.io/', kind: 'blog',
    blurb: 'Classic neural-network essays including “Understanding LSTMs” — short, visual, and still the best introduction.',
    modules: ['Deep Learning', 'NLP and Language Models'] },
  { id: 'huggingface-blog', title: 'Hugging Face Blog', publisher: 'Hugging Face', url: 'https://huggingface.co/blog', kind: 'blog',
    blurb: 'State-of-the-art, practical posts on open models, PEFT, quantization, and inference — written by the people shipping them.',
    modules: ['NLP and Language Models', 'Generative AI Applications', 'MLOps and Production AI'] },
  { id: 'fastai', title: 'fast.ai', publisher: 'Jeremy Howard & Rachel Thomas', url: 'https://www.fast.ai/', kind: 'course',
    blurb: '“Practical Deep Learning for Coders” — the free course that gets beginners training state-of-the-art models in weeks.',
    modules: ['Deep Learning', 'Computer Vision in Depth', 'Classical Machine Learning'] },
  { id: 'the-gradient', title: 'The Gradient', publisher: 'The Gradient team', url: 'https://thegradient.pub/', kind: 'blog',
    blurb: 'Thoughtful perspectives on ML research and society, with interviews and retrospectives you won’t find elsewhere.',
    modules: ['Deep Learning', 'ML System Design', 'AI Career Accelerator'] },
  { id: 'karpathy', title: 'Andrej Karpathy’s Blog & Zero to Hero', publisher: 'Andrej Karpathy', url: 'https://karpathy.github.io/', kind: 'blog',
    blurb: 'From “The Unreasonable Effectiveness of RNNs” to building GPT from scratch on YouTube — the best teacher in ML.',
    modules: ['Deep Learning', 'NLP and Language Models', 'Python and Data Foundations'] },
  { id: 'eugene-yan', title: 'Eugene Yan', publisher: 'Eugene Yan (Amazon)', url: 'https://eugeneyan.com/', kind: 'blog',
    blurb: 'Applied ML essays on recommenders, evals, LLM patterns, and MLOps from someone running them in production.',
    modules: ['MLOps and Production AI', 'Classical Machine Learning', 'ML System Design', 'Generative AI Applications'] },
  { id: 'bair-blog', title: 'BAIR Blog', publisher: 'UC Berkeley AI Research', url: 'https://bair.berkeley.edu/blog/', kind: 'blog',
    blurb: 'Berkeley’s AI lab explains its research accessibly — RL, robotics, NLP, and systems written by the grad students themselves.',
    modules: ['Reinforcement Learning', 'Deep Learning', 'ML System Design'] },
  { id: 'google-research-blog', title: 'Google Research Blog', publisher: 'Google', url: 'https://research.google/blog/', kind: 'blog',
    blurb: 'First looks at research behind Gemini, AlphaFold, and the tools shaping the field.',
    modules: ['Deep Learning', 'Generative AI Applications', 'Computer Vision in Depth'] },
  { id: 'kaggle-learn', title: 'Kaggle Learn', publisher: 'Kaggle', url: 'https://www.kaggle.com/learn', kind: 'course',
    blurb: 'Free micro-courses — Python, pandas, ML, feature engineering, and LLMs — each finishable in an afternoon.',
    modules: ['Python and Data Foundations', 'Classical Machine Learning', 'Data Engineering Essentials', 'AI Career Accelerator'] },
  { id: 'papers-with-code', title: 'Papers with Code', publisher: 'Meta AI', url: 'https://paperswithcode.com/', kind: 'reference',
    blurb: 'Track state of the art on any benchmark and jump straight to the open-source implementation.',
    modules: ['AI Career Accelerator', 'Computer Vision in Depth', 'NLP and Language Models'] },
  { id: 'simon-willison', title: 'Simon Willison’s Weblog', publisher: 'Simon Willison', url: 'https://simonwillison.net/', kind: 'blog',
    blurb: 'The best running log of hands-on LLM engineering: tools, prompt injection, and building with open models.',
    modules: ['Generative AI Applications', 'MLOps and Production AI'] },
  { id: 'ml-mastery', title: 'Machine Learning Mastery', publisher: 'Jason Brownlee', url: 'https://machinelearningmastery.com/', kind: 'blog',
    blurb: 'Hundreds of short, code-first tutorials for classical ML and deep learning fundamentals.',
    modules: ['Classical Machine Learning', 'Deep Learning', 'Python and Data Foundations'] },
  { id: 'd2l', title: 'Dive into Deep Learning', publisher: 'Zhang, Lipton, Li, Smola', url: 'https://d2l.ai/', kind: 'book',
    blurb: 'A free interactive deep learning book with runnable PyTorch/MXNet code for every chapter.',
    modules: ['Deep Learning', 'Math and Statistics for ML', 'Computer Vision in Depth'] },
];

const LIBRARY: Record<CurriculumGoal, LearningResource[]> = {
  'gate-cs': gateCs,
  'web-dev': webDev,
  'ai-ml': aiMl,
};

export const RESOURCE_UNIVERSES = Object.keys(LIBRARY) as CurriculumGoal[];

/** All resources for a universe, optionally filtered by module or search text. */
export function resourcesFor(goal: string, module?: string, query?: string): { goal: string; resources: LearningResource[]; modules: string[] } {
  const safeGoal = (goal in LIBRARY ? goal : 'gate-cs') as CurriculumGoal;
  const modules = [...new Set(getCatalog(safeGoal).map((t) => t.module))];
  let resources = LIBRARY[safeGoal] || [];
  if (module && modules.includes(module)) {
    resources = resources.filter((r) => r.modules.includes(module));
  }
  const q = (query || '').trim().toLowerCase();
  if (q) {
    resources = resources.filter((r) =>
      `${r.title} ${r.publisher} ${r.blurb} ${r.modules.join(' ')}`.toLowerCase().includes(q));
  }
  return { goal: safeGoal, resources, modules };
}
