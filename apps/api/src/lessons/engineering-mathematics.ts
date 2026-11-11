import type { TopicLesson } from "../topicLessons.js"; /** * Engineering Mathematics — 13 authored topic lessons. * * Written as a standalone chapter per topic. No shared module essay, no * study-coach preamble. The subject starts in the first sentence. */
export const engineeringMathematics: Record<string, TopicLesson> = {
  "gate-cs-engineering-mathematics-sets-relations-and-functions": {
    intro: `A set is a collection of distinct objects, called its elements. We write x ∈ A when x belongs to A and x ∉ A otherwise. The order in which elements are listed does not matter, and repetition does not create a new element: {1, 2, 3} and {3, 1, 2, 2} are the same set. A set can be described by listing its elements, as in A = {1, 2, 3}, or by a rule, as in B = {n ∈ ℕ : n is even and n < 10}. The empty set ∅ contains no elements, and the universal set U contains every object under discussion. A is a subset of B, written A ⊆ B, when every element of A is an element of B. If A ⊆ B and B ⊆ A, then A = B; this is the standard way to prove two sets equal. The power set P(A) is the set of all subsets of A, and its size is 2^|A|.`,
    foundations: `The basic operations on sets mirror logical connectives. The union A ∪ B contains everything in A or B; the intersection A ∩ B contains everything in both; the difference A \\ B contains elements of A that are not in B; the symmetric difference A △ B contains elements in exactly one of the two sets. The complement A^c is U \\ A. These operations satisfy De Morgan's laws: (A ∪ B)^c = A^c ∩ B^c and (A ∩ B)^c = A^c ∪ B^c. They also distribute: A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C), and A ∪ (B ∩ C) = (A ∪ B) ∩ (A ∪ C). The inclusion-exclusion principle counts unions: |A ∪ B| = |A| + |B| − |A ∩ B|, and for three sets |A ∪ B ∪ C| = |A| + |B| + |C| − |A ∩ B| − |A ∩ C| − |B ∩ C| + |A ∩ B ∩ C|.`,
    concepts: [
      {
        title: "Cartesian products and binary relations",
        body: `The Cartesian product A × B is the set of all ordered pairs (a, b) with a ∈ A and b ∈ B. Its size is |A| · |B|. A binary relation R from A to B is any subset of A × B. When A = B, R is a relation on A. We write a R b instead of (a, b) ∈ R. A relation can be represented by a Boolean matrix whose rows are elements of A and columns are elements of B, or by a directed graph whose vertices are elements of A and whose edges are the pairs in R. The inverse relation R⁻¹ reverses every pair: (b, a) ∈ R⁻¹ exactly when (a, b) ∈ R. The composition S ∘ R consists of pairs (a, c) for which some b satisfies (a, b) ∈ R and (b, c) ∈ S. Composition is associative but not generally commutative.`,
      },
      {
        title: "Properties of relations on a set",
        body: `A relation R on A is reflexive when (a, a) ∈ R for every a ∈ A. It is symmetric when (a, b) ∈ R implies (b, a) ∈ R. It is antisymmetric when (a, b) ∈ R and (b, a) ∈ R together imply a = b. It is transitive when (a, b) ∈ R and (b, c) ∈ R imply (a, c) ∈ R. These four properties are independent: a relation can have any combination of them. A relation that is reflexive, symmetric, and transitive is an equivalence relation. A relation that is reflexive, antisymmetric, and transitive is a partial order. The reflexive closure adds every missing diagonal pair; the symmetric closure adds every missing reverse pair; the transitive closure adds every pair reachable by a directed path. For a relation on a finite set of size n, the transitive closure can be computed by repeated Boolean matrix multiplication or by Warshall's algorithm in O(n³) time.`,
      },
      {
        title: "Equivalence relations and partitions",
        body: `An equivalence relation groups elements that behave as if they were the same for some purpose. The equivalence class of a is [a] = {x ∈ A : x R a}. Reflexivity puts a in its own class, symmetry makes membership mutual, and transitivity ensures that two classes are either identical or disjoint. Therefore the equivalence classes form a partition of A: a collection of nonempty, pairwise disjoint subsets whose union is A. Conversely, every partition defines an equivalence relation by declaring two elements related when they lie in the same block. This one-to-one correspondence is why counting equivalence relations is the same as counting partitions, given by the Bell numbers. Congruence modulo n is the standard example: a ≡ b (mod n) when n divides a − b. The equivalence classes are the residue classes 0, 1, ..., n − 1, and there are exactly n of them.`,
      },
      {
        title: "Partial orders, Hasse diagrams, and lattices",
        body: `A partial order is reflexive, antisymmetric, and transitive. We usually write a ≤ b instead of (a, b) ∈ R. Two elements are comparable when a ≤ b or b ≤ a; a total order makes every pair comparable. A Hasse diagram draws each element once, omits self-loops, and omits edges implied by transitivity, leaving only the cover relations: a is covered by b when a < b and no element lies strictly between them. In a finite poset, a minimal element has nothing strictly below it, and a maximal element has nothing strictly above it. A least element is below every element; a greatest element is above every element. A lattice is a poset in which every pair of elements has a least upper bound (join) and a greatest lower bound (meet). The power set of a set, ordered by inclusion, is a distributive lattice: union is join and intersection is meet.`,
      },
      {
        title: "Functions: injection, surjection, bijection",
        body: `A function f : A → B assigns exactly one element of B to each element of A. A is the domain, B is the codomain, and the image f(A) is the set of values actually attained. A function is injective (one-to-one) when f(a₁) = f(a₂) implies a₁ = a₂; different inputs never collide. It is surjective (onto) when every b ∈ B equals f(a) for some a ∈ A; the image equals the codomain. It is bijective when it is both, which means it has an inverse function f⁻¹ : B → A. Composition preserves injectivity and surjectivity: if f and g are injective, then g ∘ f is injective; if both are surjective, then g ∘ f is surjective. If A and B are finite and |A| = |B| = n, the number of bijections is n!. If |A| = m and |B| = n, the number of functions is n^m, and the number of injections is n(n − 1) ··· (n − m + 1) when m ≤ n.`,
      },
      {
        title: "Cardinality and countability",
        body: `Two sets have the same cardinality when there is a bijection between them. A set is finite when it has n elements for some natural number n, countably infinite when it can be put in bijection with ℕ, and uncountable otherwise. The integers, the rationals, and the set of all finite strings over a finite alphabet are all countably infinite. The real numbers are not: Cantor's diagonal argument assumes a list of all reals between 0 and 1, constructs a number whose k-th digit differs from the k-th digit of the k-th listed number, and obtains a real missing from the list. More generally, |P(A)| > |A| for every set A, because no function from A to P(A) can be surjective. The set of all subsets of ℕ is therefore uncountable, and so is the set of all infinite binary sequences.`,
      },
    ],
    worked: [
      {
        title: "Counting relations on a three-element set",
        body: `Let A = {1, 2, 3}. There are 3² = 9 ordered pairs in A × A, so there are 2⁹ = 512 binary relations on A. A reflexive relation must contain (1,1), (2,2), and (3,3), and may choose freely among the other six pairs, giving 2⁶ = 64 reflexive relations. A symmetric relation is determined by the diagonal pairs (three independent choices) and by each unordered pair {i, j} with i ≠ j: either both (i,j) and (j,i) are present or neither is, giving three independent choices. The total is 2³ · 2³ = 64. An antisymmetric relation allows, for each unordered pair {i, j}, three possibilities: neither direction, i R j only, or j R i only. The three diagonal pairs are independent, so the count is 3³ · 2³ = 216. An equivalence relation is a partition of A. The five partitions are {123}, {1}{23}, {2}{13}, {3}{12}, and {1}{2}{3}, so there are exactly five equivalence relations on A. These are the Bell numbers B₃ = 5.`,
      },
      {
        title: "Counting functions and testing bijectivity",
        body: `Let A = {1, 2, 3} and B = {x, y}. The number of functions from A to B is 2³ = 8: each of the three inputs chooses one of two outputs independently. No function from A to B can be injective, because three inputs cannot map to two distinct outputs without a collision; the pigeonhole principle guarantees it. A function is surjective when both outputs are used. There are two constant functions that use only one output, so the number of surjective functions is 8 − 2 = 6. Now let B = {x, y, z}. The number of bijections from A to B is 3! = 6. One explicit bijection is 1 ↦ x, 2 ↦ y, 3 ↦ z; every permutation of the three outputs gives another. If f(1) = x, f(2) = y, and f(3) = y, the function is neither injective nor surjective, because y has two preimages and z has none.`,
      },
    ],
    exam: [
      {
        question: `Let A be a set with n elements. How many relations on A are both reflexive and symmetric?`,
        answer: `A relation on A is a subset of A × A, which has n² pairs. Reflexivity forces the n diagonal pairs into the relation. Symmetry pairs each off-diagonal pair (i, j) with (j, i), so the remaining n² − n pairs form (n² − n)/2 independent two-element groups. Each group is either entirely included or entirely excluded. The number is therefore 2^((n² − n)/2). For n = 3 this gives 2³ = 8, not 64; 64 counts reflexive relations with no symmetry constraint.`,
      },
      {
        question: `Prove that if f : A → B and g : B → C are both injective, then g ∘ f is injective. Does the same hold for surjectivity?`,
        answer: `Suppose (g ∘ f)(a₁) = (g ∘ f)(a₂). Then g(f(a₁)) = g(f(a₂)). Since g is injective, f(a₁) = f(a₂). Since f is injective, a₁ = a₂. Therefore g ∘ f is injective. For surjectivity, take any c ∈ C. Since g is surjective, there is b ∈ B with g(b) = c. Since f is surjective, there is a ∈ A with f(a) = b. Then (g ∘ f)(a) = g(b) = c, so g ∘ f is surjective. Injectivity alone does not give surjectivity, and surjectivity alone does not give injectivity; each property is preserved separately.`,
      },
      {
        question: `How many equivalence relations are there on a four-element set?`,
        answer: `Equivalence relations on a set correspond exactly to partitions of the set, so the answer is the Bell number B₄. Count partitions by block sizes. One block: 1 partition. Two blocks: either 3 + 1 (choose the singleton in 4 ways) or 2 + 2 (choose the two pairs in 3 ways), giving 7. Three blocks: one pair and two singletons; choose the pair in C(4,2) = 6 ways, giving 6. Four blocks: 1. The total is 1 + 7 + 6 + 1 = 15.`,
      },
      {
        question: `Show that the set of all finite subsets of ℕ is countable.`,
        answer: `For each n, let Fₙ be the set of subsets of {0, 1, ..., n − 1}. Each Fₙ is finite, with 2ⁿ elements. The set of all finite subsets of ℕ is the union of F₀, F₁, F₂, .... A countable union of finite sets is countable: list the elements of F₀, then F₁, then F₂, skipping duplicates. Every finite subset appears at some finite stage, so the union is countable. The set of all subsets of ℕ, by contrast, is uncountable by Cantor's theorem.`,
      },
    ],
    cheat: [
      "Set identities: De Morgan, distributivity, A \\ B = A ∩ B^c, A △ B = (A \\ B) ∪ (B \\ A).",
      "|A ∪ B| = |A| + |B| − |A ∩ B|; three-set inclusion-exclusion adds back the triple intersection.",
      "|P(A)| = 2^|A|; the number of binary relations on an n-element set is 2^(n²).",
      "Reflexive relations: 2^(n²−n); symmetric: 2^((n²+n)/2); antisymmetric: 3^(n(n−1)/2) · 2ⁿ.",
      "Equivalence relations on n elements are the Bell numbers: B₀=1, B₁=1, B₂=2, B₃=5, B₄=15.",
      "Partial orders on n labeled elements: 1, 3, 19, 219 for n = 1, 2, 3, 4.",
      "Functions A → B: |B|^|A| total; n! bijections when |A| = |B| = n; injections = P(|B|, |A|).",
      "Cantor: |P(A)| > |A| for every A; ℕ is countable, ℝ and P(ℕ) are uncountable.",
    ],
    recap: `Sets provide the language, relations provide structure, and functions provide transformation. The three ideas are linked: a function is a special relation, an equivalence relation is a partition in disguise, and a partial order is a relation that lets you compare elements without forcing every pair to be comparable. Counting questions usually reduce to one of three moves: count the underlying pairs and use powers of two, count partitions and use Bell numbers, or count functions with the multiplication and pigeonhole principles.`,
    code: {
      title: "Enumerate relations on a small set and classify their properties",
      language: "python",
      code: `from itertools import product A = [1, 2, 3]
pairs = [(a, b) for a in A for b in A] def is_reflexive(r): return all((a, a) in r for a in A) def is_symmetric(r): return all((b, a) in r for (a, b) in r) def is_transitive(r): return all((a, c) in r for (a, b) in r for (b2, c) in r if b == b2) counts = {"reflexive": 0, "symmetric": 0, "equivalence": 0}
for mask in range(2 ** len(pairs)): r = {pairs[i] for i in range(len(pairs)) if mask & (1 << i)} if is_reflexive(r): counts["reflexive"] += 1 if is_symmetric(r): counts["symmetric"] += 1 if is_reflexive(r) and is_symmetric(r) and is_transitive(r): counts["equivalence"] += 1
print(counts) # 64, 64, 5`,
      explanation:
        "Brute force is a useful sanity check for the counting formulas. On three elements there are 512 relations; the script confirms 64 reflexive, 64 symmetric, and 5 equivalence relations. The formulas scale, the enumeration does not.",
    },
    diagram: {
      title: "The relation hierarchy",
      caption:
        "Reflexivity, symmetry, antisymmetry, and transitivity combine into equivalence relations and partial orders.",
      mermaid: `flowchart TD R[Binary relation on A] --> P{Which properties hold?} P --> E[Reflexive + symmetric + transitive] P --> O[Reflexive + antisymmetric + transitive] E --> EQ[Equivalence relation] EQ --> PART[Partition of A] O --> POS[Partial order] POS --> HASSE[Hasse diagram] POS --> LAT[Lattice if joins and meets exist]`,
    },
  },
  "gate-cs-engineering-mathematics-propositional-and-predicate-logic": {
    intro: `Propositional logic studies statements that are either true or false and the ways they combine. A proposition is a declarative sentence with a definite truth value: "2 + 2 = 4" is true, "7 is even" is false, and "x > 3" is not a proposition until x is fixed. The connectives are negation (¬), conjunction (∧), disjunction (∨), implication (→), and biconditional (↔). Their meanings are fixed by truth tables, not by English intuition. In particular, p → q is false only when p is true and q is false; when p is false, the implication is vacuously true. This single convention explains most of the confusion in the subject.`,
    foundations: `A formula is built from propositional variables and connectives. A truth assignment gives each variable a value in {T, F}; a formula is satisfiable when at least one assignment makes it true, a tautology when every assignment makes it true, and a contradiction when no assignment does. Two formulas are logically equivalent when they have the same truth value under every assignment. Standard equivalences include double negation ¬¬p ≡ p, De Morgan's laws ¬(p ∧ q) ≡ ¬p ∨ ¬q and ¬(p ∨ q) ≡ ¬p ∧ ¬q, contraposition p → q ≡ ¬q → ¬p, and the implication expansion p → q ≡ ¬p ∨ q. A set of formulas entails a formula when every assignment satisfying all the premises also satisfies the conclusion.`,
    concepts: [
      {
        title: "Truth tables and the meaning of implication",
        body: `A truth table lists every assignment of truth values to the variables and the resulting value of the formula. For two variables there are four rows; for n variables there are 2ⁿ rows. The implication p → q has the table T→T = T, T→F = F, F→T = T, F→F = T. The only false row is the one where the antecedent is true and the consequent is false. The converse q → p is not equivalent to p → q. The inverse ¬p → ¬q is also not equivalent. The contrapositive ¬q → ¬p is equivalent. Confusing an implication with its converse is the most common error in proofs and in multiple-choice logic questions.`,
      },
      {
        title: "Normal forms and logical equivalence",
        body: `Every formula can be rewritten as a disjunction of conjunctions of literals (disjunctive normal form, DNF) or as a conjunction of disjunctions of literals (conjunctive normal form, CNF). A literal is a variable or its negation. DNF is useful for satisfiability: the formula is satisfiable exactly when at least one conjunction is satisfiable. CNF is useful for resolution: the formula is unsatisfiable exactly when the empty clause can be derived. Any formula can be converted mechanically using implication elimination, De Morgan's laws, double negation, and distributivity. The conversion can blow up exponentially in the worst case, which is one reason satisfiability is hard in general.`,
      },
      {
        title: "Inference rules and proofs",
        body: `A proof system takes premises and derives conclusions by syntactic rules. Modus ponens derives q from p and p → q. Modus tollens derives ¬p from ¬q and p → q. Hypothetical syllogism derives p → r from p → q and q → r. Disjunctive syllogism derives q from p ∨ q and ¬p. Resolution derives a new clause from two clauses that contain complementary literals. A proof is sound when every derivable conclusion is entailed, and complete when every entailment is derivable. Propositional resolution is both sound and complete for refutation: to prove that premises entail q, add ¬q and derive the empty clause.`,
      },
      {
        title: "Predicate logic: quantifiers and scope",
        body: `Predicate logic adds variables, predicates, and quantifiers. A predicate P(x) is a statement whose truth depends on x. The universal quantifier ∀x P(x) means P holds for every x in the domain; the existential quantifier ∃x P(x) means P holds for at least one x. Negation swaps quantifiers: ¬∀x P(x) ≡ ∃x ¬P(x), and ¬∃x P(x) ≡ ∀x ¬P(x). The order of quantifiers matters: ∀x ∃y Loves(x, y) says everyone loves someone, while ∃y ∀x Loves(x, y) says there is one person whom everyone loves. The domain of discourse must be stated explicitly; a formula can be true in one domain and false in another.`,
      },
      {
        title: "Validity, satisfiability, and compactness",
        body: `A formula is valid when it is true in every interpretation; satisfiable when it is true in at least one. Validity and satisfiability are dual: φ is valid exactly when ¬φ is unsatisfiable. In propositional logic, both questions are decidable by truth tables, although the table has 2ⁿ rows. In predicate logic, validity is undecidable in general (Church–Turing), but semi-decidable: if a formula is valid, a proof search can eventually find a proof. The compactness theorem says a set of first-order sentences has a model if every finite subset has a model; it is a powerful tool for constructing nonstandard models.`,
      },
    ],
    worked: [
      {
        title: "Testing an argument with a truth table",
        body: `Test whether the premises p → q and q → r entail p → r. Build the truth table for the conjunction (p → q) ∧ (q → r) and for p → r. The only row in which both premises are true is p = T, q = T, r = T, where the conclusion is also true. In every other row at least one premise is false, so the implication from the premises to the conclusion is vacuously true. The argument is valid; this is hypothetical syllogism. A shorter proof: assume p. From p → q, derive q by modus ponens. From q → r, derive r. Therefore p → r by conditional proof.`,
      },
      {
        title: "Translating English into quantified logic",
        body: `Translate: "Every student who studies hard passes, but some student does not study hard." Let S(x) mean x is a student, H(x) mean x studies hard, and P(x) mean x passes. The first clause is ∀x ((S(x) ∧ H(x)) → P(x)). The second is ∃x (S(x) ∧ ¬H(x)). The whole statement is the conjunction of the two. A common mistake is to write ∀x (S(x) → (H(x) → P(x))) for the first clause; that is equivalent by exportation, so it is acceptable. A more serious mistake is to write ∃x (S(x) → ¬H(x)), which is true whenever there is a non-student, and therefore does not say what the English sentence says.`,
      },
      {
        title: "Resolution refutation",
        body: `Show that (p ∨ q), (¬p ∨ r), and (¬q ∨ r) entail r. Add the negation of the conclusion, ¬r, and convert to clauses: {p, q}, {¬p, r}, {¬q, r}, {¬r}. Resolve {p, q} with {¬p, r} to get {q, r}. Resolve {q, r} with {¬q, r} to get {r}. Resolve {r} with {¬r} to get the empty clause. The empty clause is unsatisfiable, so the original set plus ¬r is unsatisfiable, which means the original premises entail r. Each resolution step eliminates exactly one complementary pair.`,
      },
    ],
    exam: [
      {
        question: `Which of the following is logically equivalent to p → q? (A) q → p (B) ¬p → ¬q (C) ¬q → ¬p (D) p ∧ ¬q`,
        answer: `The correct answer is C, the contrapositive. p → q is false only when p is true and q is false. The contrapositive ¬q → ¬p is false only when ¬q is true and ¬p is false, which is the same row q = false, p = true. Option A is the converse, which differs when p is false and q is true. Option B is the inverse, which also differs on that row. Option D is the negation of the implication, true exactly when the implication is false.`,
      },
      {
        question: `Negate the formula ∀x ∃y (P(x, y) → Q(y)).`,
        answer: `Apply the quantifier negations from the outside in. ¬∀x ∃y (P → Q) becomes ∃x ¬∃y (P → Q), then ∃x ∀y ¬(P → Q). Since P → Q is equivalent to ¬P ∨ Q, its negation is P ∧ ¬Q. The result is ∃x ∀y (P(x, y) ∧ ¬Q(y)). The key moves are swapping each quantifier and negating the body; do not negate the predicate names themselves.`,
      },
      {
        question: `Is the set of propositions {p → q, q → r, r → ¬p, p} satisfiable?`,
        answer: `Assume p is true. From p → q, q is true. From q → r, r is true. From r → ¬p, ¬p is true. But p and ¬p cannot both be true, so the set is unsatisfiable. Equivalently, the four formulas entail both p and ¬p, which is a contradiction. A truth table would show that no row makes all four premises true.`,
      },
      {
        question: `Express "there is exactly one student who passed" in predicate logic using S(x) and P(x).`,
        answer: `Exactly one means at least one and at most one: ∃x (S(x) ∧ P(x) ∧ ∀y ((S(y) ∧ P(y)) → y = x)). The first conjunct asserts existence; the universal clause says any other passing student must be the same object. An alternative is ∃x (S(x) ∧ P(x)) ∧ ∀y ∀z ((S(y) ∧ P(y) ∧ S(z) ∧ P(z)) → y = z). The identity predicate is essential; without it, "exactly one" cannot be expressed.`,
      },
    ],
    cheat: [
      "p → q ≡ ¬p ∨ q ≡ ¬q → ¬p. The converse and inverse are not equivalent.",
      "De Morgan: ¬(p ∧ q) ≡ ¬p ∨ ¬q; ¬(p ∨ q) ≡ ¬p ∧ ¬q.",
      "Quantifier negation: ¬∀x P ≡ ∃x ¬P; ¬∃x P ≡ ∀x ¬P.",
      "∀x (P(x) → Q(x)) means every P is a Q; ∃x (P(x) ∧ Q(x)) means some P is a Q.",
      "Resolution: derive a clause from two clauses with complementary literals; empty clause = contradiction.",
      "DNF = OR of ANDs; CNF = AND of ORs. Every formula has both.",
      "Valid ⇔ negation unsatisfiable. Satisfiable ⇔ some row of the truth table is true.",
      "Compactness: a first-order set has a model iff every finite subset has a model.",
    ],
    recap: `Propositional logic is truth-table arithmetic; predicate logic adds objects, predicates, and quantifiers. The two skills that matter most are translating English into precise formulas and manipulating those formulas without changing their truth value. Implication, contraposition, quantifier negation, and resolution cover the overwhelming majority of exam questions.`,
    code: {
      title: "Truth-table checker for propositional formulas",
      language: "python",
      code: `from itertools import product def implies(p, q): return (not p) or q def check(formula, variables): rows = [] for values in product([False, True], repeat=len(variables)): env = dict(zip(variables, values)) rows.append((env, formula(env))) return rows # (p -> q) and (q -> r) entails (p -> r)
variables = ["p", "q", "r"]
valid = True
for env, _ in check(lambda e: True, variables): premise = implies(env["p"], env["q"]) and implies(env["q"], env["r"]) conclusion = implies(env["p"], env["r"]) if premise and not conclusion: valid = False
print("valid" if valid else "invalid") # valid`,
      explanation:
        "The checker enumerates all eight assignments. The argument is invalid only if some row makes the premises true and the conclusion false; no such row exists, so hypothetical syllogism is valid.",
    },
    diagram: {
      title: "Implication and its relatives",
      caption: "Only the contrapositive has the same truth table as p → q.",
      mermaid: `flowchart LR I[p → q] --> C[Contrapositive: ¬q → ¬p] I -.-> V[Converse: q → p] I -.-> N[Inverse: ¬p → ¬q] I --> E[Expansion: ¬p ∨ q] C --> S[Same truth table] E --> S`,
    },
  },
  "gate-cs-engineering-mathematics-combinatorics-and-counting": {
    intro: `Combinatorics answers the question "how many?" without listing every object. The two primitive rules are the sum rule and the product rule. If a choice can be made in m ways or in n disjoint ways, the total is m + n. If a task consists of a first step with m choices and, for each of them, a second step with n choices, the total is m · n. Almost every counting argument is a careful application of these two rules, often after splitting a problem into disjoint cases or counting the complement.`,
    foundations: `A permutation is an ordered arrangement. The number of permutations of n distinct objects is n!, and the number of r-permutations chosen from n objects is P(n, r) = n!/(n−r)!. A combination is an unordered selection: C(n, r) = n!/(r!(n−r)!). The identity C(n, r) = C(n, n−r) and Pascal's rule C(n, r) = C(n−1, r−1) + C(n−1, r) follow by choosing whether a distinguished element is included. Permutations with repetition allowed are n^r; combinations with repetition are counted by stars and bars. The binomial theorem (x + y)^n = Σ C(n, k) x^k y^(n−k) is itself a counting statement: choose which k factors contribute x.`,
    concepts: [
      {
        title: "Permutations, combinations, and arrangements with restrictions",
        body: `When order matters, count permutations; when it does not, count combinations. A useful test is to ask whether swapping two chosen objects produces a different outcome. For arrangements with repeated objects, divide by the factorials of the repetition counts: the number of distinct strings from the letters of MISSISSIPPI is 11!/(4!4!2!). For circular arrangements, fix one object to break the rotation symmetry, giving (n−1)! arrangements of n distinct objects around a circle. If reflections are also considered identical, divide by 2, unless the arrangement is symmetric. Restrictions are handled by counting the complement or by placing the restricted objects first.`,
      },
      {
        title: "The pigeonhole principle",
        body: `If n objects are placed into m boxes and n > m, at least one box contains at least two objects. More generally, if n objects are placed into m boxes, some box contains at least ⌈n/m⌉ objects. The generalized form follows by contradiction: if every box contained at most k − 1 objects, the total would be at most m(k − 1). Pigeonhole arguments are existence proofs; they tell you that a collision must happen without identifying which objects collide. Classic applications include showing that two people in a group share a birthday month, that a graph has two vertices of the same degree, and that any sequence of n² + 1 distinct numbers contains an increasing or decreasing subsequence of length n + 1.`,
      },
      {
        title: "Inclusion–exclusion",
        body: `To count a union without double-counting, add the sizes of the sets, subtract the sizes of all pairwise intersections, add back the sizes of triple intersections, and continue alternating. For three sets, |A ∪ B ∪ C| = |A| + |B| + |C| − |A ∩ B| − |A ∩ C| − |B ∩ C| + |A ∩ B ∩ C|. The principle is most powerful when the complement is easier to count: the number of objects with none of a list of properties is the total minus the union of the property sets. Derangements, surjective functions, and strings avoiding forbidden patterns are standard applications.`,
      },
      {
        title: "Stars and bars: distributing identical objects",
        body: `The number of nonnegative integer solutions to x₁ + x₂ + ... + x_k = n is C(n + k − 1, k − 1). Picture n stars in a row and k − 1 bars separating them into k groups; every arrangement of stars and bars corresponds to exactly one solution. The number of positive integer solutions is C(n − 1, k − 1), obtained by giving each variable one star first. If each variable must be at least aᵢ, subtract the minimums and apply the nonnegative formula. If the bins are distinguishable, the variables are labeled; if the bins are identical, the problem becomes a partition problem and needs Stirling numbers or a separate case analysis.`,
      },
      {
        title: "Recurrences and Catalan numbers",
        body: `A recurrence defines a sequence by earlier values. The Fibonacci recurrence Fₙ = Fₙ₋₁ + Fₙ₋₂ counts, among other things, binary strings with no two consecutive ones and tilings of a 2 × n board by dominoes. The Catalan recurrence Cₙ = Σ Cᵢ Cₙ₋₁₋ᵢ with C₀ = 1 has the closed form Cₙ = C(2n, n)/(n + 1). Catalan numbers count balanced parenthesis strings, full binary trees with n internal nodes, Dyck paths that never go below the axis, and triangulations of a convex polygon. Recognizing the recurrence is usually more important than memorizing the closed form.`,
      },
      {
        title: "Partitions and Stirling numbers",
        body: `A partition of a set divides it into nonempty, pairwise disjoint blocks; the order of the blocks does not matter. The number of partitions of an n-element set into exactly k blocks is the Stirling number of the second kind S(n, k), and the total number of partitions is the Bell number Bₙ = Σ S(n, k). The recurrence S(n, k) = k S(n−1, k) + S(n−1, k−1) follows by considering whether the new element joins one of the k existing blocks or starts a new block. An ordered partition into k nonempty blocks is counted by k! S(n, k), which is also the number of surjective functions from an n-element set onto a k-element set.`,
      },
    ],
    worked: [
      {
        title: "Counting surjective functions",
        body: `How many functions from A = {1, 2, 3, 4} onto B = {x, y, z}? The total number of functions is 3⁴ = 81. Subtract the functions that miss at least one target. There are C(3,1) = 3 choices of a missing target, and for each, 2⁴ = 16 functions into the remaining two targets. Add back the functions that miss two targets, because they were subtracted twice: C(3,2) = 3 choices, and 1⁴ = 1 function for each. By inclusion–exclusion the answer is 81 − 3·16 + 3·1 = 36. Equivalently, 36 = 3! S(4, 3) = 6 · 6, since each surjection partitions the four inputs into three nonempty preimage blocks and then assigns the three blocks to the three outputs.`,
      },
      {
        title: "Stars and bars with lower bounds",
        body: `Count the nonnegative integer solutions of x₁ + x₂ + x₃ + x₄ = 12 with x₁ ≥ 2 and x₃ ≥ 1. Set y₁ = x₁ − 2 and y₃ = x₃ − 1; the other variables stay as they are. Then y₁ + x₂ + y₃ + x₄ = 9 with all variables nonnegative. Stars and bars gives C(9 + 4 − 1, 4 − 1) = C(12, 3) = 220. Without the lower bounds the count would be C(15, 3) = 455. If instead every variable had to be positive, the substitution zᵢ = xᵢ − 1 would reduce the sum to 8 and give C(11, 3) = 165.`,
      },
      {
        title: "Derangements of four objects",
        body: `A derangement is a permutation with no fixed point. Count derangements of {1, 2, 3, 4} by inclusion–exclusion. Start with 4! = 24 permutations. Subtract permutations fixing at least one element: C(4,1) · 3! = 4 · 6 = 24. Add back those fixing at least two: C(4,2) · 2! = 6 · 2 = 12. Subtract those fixing at least three: C(4,3) · 1! = 4 · 1 = 4. Add those fixing all four: C(4,4) · 0! = 1. The result is 24 − 24 + 12 − 4 + 1 = 9. The general formula is !n = n! Σ_{k=0}^{n} (−1)^k / k!, which is the nearest integer to n!/e for n ≥ 1.`,
      },
    ],
    exam: [
      {
        question: `How many ways are there to distribute 10 identical balls into 4 distinct boxes?`,
        answer: `This is the number of nonnegative integer solutions to x₁ + x₂ + x₃ + x₄ = 10. Stars and bars gives C(10 + 4 − 1, 4 − 1) = C(13, 3) = 286. If every box must receive at least one ball, substitute yᵢ = xᵢ − 1; then y₁ + y₂ + y₃ + y₄ = 6 and the count is C(9, 3) = 84.`,
      },
      {
        question: `How many 5-card hands from a standard 52-card deck contain at least one ace?`,
        answer: `Count the complement: hands with no ace. There are C(48, 5) such hands, since the deck has 48 non-aces. The total number of hands is C(52, 5). The answer is C(52, 5) − C(48, 5) = 2,598,960 − 1,712,304 = 886,656. A common wrong answer is 4 · C(51, 4), which counts hands with two aces twice.`,
      },
      {
        question: `Show that among any 25 people, at least three share a birth month.`,
        answer: `There are 12 birth months. If no month contained three people, each month would contain at most two, for a total of at most 24 people. With 25 people, the pigeonhole principle forces some month to contain at least ⌈25/12⌉ = 3 people. The argument is an existence proof; it does not identify the month or the people.`,
      },
      {
        question: `How many binary strings of length 8 contain exactly three 1s and no two 1s adjacent?`,
        answer: `First place the three 1s so that no two are adjacent. Think of the five 0s as creating six gaps: before the first 0, between consecutive 0s, and after the last 0. At most one 1 can go in each gap, so choose 3 of the 6 gaps: C(6, 3) = 20. Equivalently, the number of length-n binary strings with k nonadjacent 1s is C(n − k + 1, k); here C(8 − 3 + 1, 3) = C(6, 3) = 20.`,
      },
    ],
    cheat: [
      "P(n, r) = n!/(n−r)!; C(n, r) = n!/(r!(n−r)!); C(n, r) = C(n, n−r).",
      "Permutations with repetition: n^r. Distinct arrangements with repeated letters: n!/(n₁!n₂!···).",
      "Stars and bars: x₁+...+x_k = n, xᵢ ≥ 0 → C(n+k−1, k−1); xᵢ ≥ 1 → C(n−1, k−1).",
      "Pigeonhole: n objects in m boxes → some box has ⌈n/m⌉; if n > m, a collision.",
      "Inclusion–exclusion: |∪Aᵢ| = Σ|Aᵢ| − Σ|Aᵢ∩Aⱼ| + Σ|Aᵢ∩Aⱼ∩Aₖ| − ...",
      "Derangements: !n = n! Σ_{k=0}^{n} (−1)^k/k!; !4 = 9.",
      "Surjections from n-set to k-set: k! S(n,k) = Σ_{i=0}^{k} (−1)^i C(k,i)(k−i)^n.",
      "Catalan: Cₙ = C(2n,n)/(n+1); counts balanced parentheses, full binary trees, Dyck paths.",
    ],
    recap: `Counting is the art of choosing the right representation. Order versus no order selects permutations versus combinations; identical versus distinct bins selects stars and bars versus Stirling numbers; forbidden properties select inclusion–exclusion. When a direct count is messy, count the complement, split into disjoint cases, or build a recurrence. The formulas are short, but the exam difficulty is almost always in translating the English into the correct model.`,
    code: {
      title: "Brute-force verification of two counting formulas",
      language: "python",
      code: `from itertools import product, permutations
from math import comb # Nonnegative solutions of x1 + x2 + x3 = 5: stars and bars says C(7, 2) = 21
solutions = [(a, b, c) for a in range(6) for b in range(6) for c in range(6) if a + b + c == 5]
print(len(solutions), comb(5 + 3 - 1, 3 - 1)) # 21 21 # Derangements of 4 elements: formula says 9
derangements = [p for p in permutations(range(4)) if all(p[i] != i for i in range(4))]
print(len(derangements)) # 9`,
      explanation:
        "The enumeration confirms the stars-and-bars count and the derangement count on small inputs. Use brute force to check a formula when the exam question is small enough, then use the formula for the large case.",
    },
    diagram: {
      title: "Choosing a counting model",
      caption:
        "Order, repetition, and whether the bins are distinct determine the formula.",
      mermaid: `flowchart TD Q[Counting problem] --> O{Does order matter?} O -->|Yes| P[Permutations] O -->|No| C[Combinations] P --> PR{Repetition allowed?} C --> CR{Repetition allowed?} PR -->|Yes| N[ n^r ] PR -->|No| NP[ n!/(n-r)! ] CR -->|Yes| SB[Stars and bars] CR -->|No| NC[ C(n,r) ] SB --> B{Distinct bins?} B -->|Yes| SBY[ C(n+k-1,k-1) ] B -->|No| STIR[Stirling / partition count]`,
    },
  },
  "gate-cs-engineering-mathematics-graph-theory": {
    intro: `A graph G = (V, E) consists of a set of vertices V and a set of edges E, where each edge joins two vertices. In a simple undirected graph, there is at most one edge between any pair of vertices and no self-loops. A directed graph replaces each edge with an ordered pair (u, v). The degree of a vertex is the number of edges incident to it; in a directed graph, the in-degree and out-degree count incoming and outgoing edges separately. Graphs model roads, friendships, dependencies, state transitions, and networks, and almost every graph question begins by choosing the right representation: adjacency list, adjacency matrix, or edge list.`,
    foundations: `A walk is a sequence of vertices and edges; a trail has no repeated edge; a path has no repeated vertex. A cycle is a closed path with at least three edges. A graph is connected when every pair of vertices is joined by a path; the connected components are its maximal connected subgraphs. A tree is a connected acyclic graph. For a tree on n vertices, there are exactly n − 1 edges, every pair of vertices has a unique path, and adding any missing edge creates exactly one cycle. A spanning tree of a connected graph is a tree containing every vertex. A graph is bipartite when its vertices can be split into two independent sets; equivalently, it contains no odd cycle.`,
    concepts: [
      {
        title: "Degrees and the handshake lemma",
        body: `Every undirected edge contributes 1 to the degree of each of its two endpoints, so the sum of all degrees is 2|E|. This is the handshake lemma. It immediately implies that the number of odd-degree vertices is even, because the sum of the degrees is even and the even-degree vertices already contribute an even amount. In a directed graph, the sum of in-degrees equals the sum of out-degrees, and both equal |E|. A graph is k-regular when every vertex has degree k; a 3-regular graph on n vertices has 3n/2 edges, so n must be even. Degree sequences are not arbitrary: the Erdős–Gallai theorem gives necessary and sufficient conditions, but exam questions usually use the handshake lemma and the even-odd parity argument.`,
      },
      {
        title: "Connectivity, trees, and spanning trees",
        body: `A connected graph has one component; a disconnected graph has at least two. Removing a vertex can disconnect a graph; such a vertex is a cut vertex. Removing an edge can disconnect a graph; such an edge is a bridge. A tree has no cycles and no bridges other than its edges, and every edge is a bridge. A connected graph on n vertices is a tree exactly when it has n − 1 edges. Cayley's formula says there are n^(n−2) labeled trees on n vertices: for n = 4, there are 16 labeled trees. A spanning tree can be found by BFS, DFS, Kruskal, or Prim; the last two produce minimum spanning trees when the edges carry weights.`,
      },
      {
        title: "Euler and Hamiltonian graphs",
        body: `An Euler circuit traverses every edge exactly once and returns to the start. A connected undirected graph has an Euler circuit exactly when every vertex has even degree. It has an Euler path (not necessarily closed) exactly when exactly zero or two vertices have odd degree; if two are odd, the path starts at one and ends at the other. The directed version requires every vertex to have equal in-degree and out-degree for a circuit. A Hamiltonian cycle visits every vertex exactly once and returns to the start. Unlike Eulericity, Hamiltonicity has no simple degree characterization; deciding whether a Hamiltonian cycle exists is NP-complete. Sufficient conditions include Dirac's theorem (every vertex has degree at least n/2) and Ore's theorem (every nonadjacent pair has degree sum at least n).`,
      },
      {
        title: "Planarity and Euler’s formula",
        body: `A graph is planar when it can be drawn in the plane without crossing edges. For a connected planar graph with V vertices, E edges, and F faces (including the unbounded outer face), Euler's formula states V − E + F = 2. For a simple planar graph with V ≥ 3, every face has at least three edges, and counting edge-face incidences gives 3F ≤ 2E, which combines with Euler's formula to give E ≤ 3V − 6. If the graph is bipartite, every face has at least four edges, so E ≤ 2V − 4. The complete graph K₅ and the complete bipartite graph K₃,₃ are nonplanar; every nonplanar graph contains a subdivision of one of them (Kuratowski's theorem).`,
      },
      {
        title: "Coloring and bipartiteness",
        body: `A proper coloring assigns colors to vertices so that adjacent vertices receive different colors. The chromatic number χ(G) is the minimum number of colors needed. A graph is 2-colorable exactly when it is bipartite, which holds exactly when it has no odd cycle. Every graph with maximum degree Δ can be colored with Δ + 1 colors by the greedy algorithm; Brooks' theorem improves this to Δ colors unless the graph is complete or an odd cycle. The clique number ω(G) is a lower bound on χ(G), but the gap can be large: there are triangle-free graphs with arbitrarily high chromatic number. Planar graphs are 4-colorable (the four-color theorem), and every planar graph has a vertex of degree at most 5.`,
      },
      {
        title: "Matchings and Hall’s theorem",
        body: `A matching is a set of edges with no shared endpoints. A maximum matching has as many edges as possible; a perfect matching covers every vertex. In bipartite graphs, Hall's marriage theorem gives a necessary and sufficient condition for a matching that saturates one side: for every subset S of the left side, the neighborhood N(S) must have size at least |S|. The defect version says the maximum matching size is |L| − max_S (|S| − |N(S)|). König's theorem connects matchings and vertex covers in bipartite graphs: the size of a maximum matching equals the size of a minimum vertex cover. Both are polynomial-time computable, unlike the general matching problem's more intricate theory.`,
      },
    ],
    worked: [
      {
        title: "Using the handshake lemma",
        body: `A graph has 10 vertices and 15 edges. What is the sum of its degrees? By the handshake lemma the sum is 2 · 15 = 30. Can the graph be 3-regular? A 3-regular graph on 10 vertices would have degree sum 30, which matches 2|E| = 30, so the numbers are consistent. Can a graph with 10 vertices have exactly three vertices of odd degree? No: the number of odd-degree vertices must be even, because the degree sum is even. This parity argument answers many existence questions without constructing the graph.`,
      },
      {
        title: "Euler’s formula and a planarity bound",
        body: `A connected simple planar graph has 8 vertices and 12 edges. How many faces does it have? Euler's formula gives F = 2 − V + E = 2 − 8 + 12 = 6. The simple planar bound E ≤ 3V − 6 gives 12 ≤ 18, so the graph passes the necessary condition. If the graph were bipartite, the stronger bound E ≤ 2V − 4 would give 12 ≤ 12, which is tight; a bipartite planar graph with 8 vertices and 12 edges must have every face of length exactly 4.`,
      },
      {
        title: "Testing bipartiteness and coloring a cycle",
        body: `A cycle Cₙ is bipartite exactly when n is even. For odd n, attempting a 2-coloring alternates colors around the cycle and returns to the start with the same color as the first vertex, so the last edge joins two vertices of the same color. Therefore χ(Cₙ) = 2 for even n and 3 for odd n. More generally, a graph is bipartite iff it has no odd cycle, and a BFS that assigns alternating colors detects the violation when it encounters an edge joining two vertices at the same level.`,
      },
    ],
    exam: [
      {
        question: `A tree has 20 vertices. How many edges does it have, and how many edges must be added to create exactly one cycle?`,
        answer: `A tree on n vertices has n − 1 edges, so it has 19 edges. Adding any edge between two vertices that are not already adjacent creates exactly one cycle, because the tree already has a unique path between those vertices and the new edge closes it. Adding one edge therefore creates exactly one cycle. Adding a second edge can create a second independent cycle, or a more complex structure, depending on where it is placed.`,
      },
      {
        question: `Can a simple graph with 7 vertices have degree sequence (6, 5, 5, 4, 4, 3, 3)?`,
        answer: `Check the handshake lemma: the sum is 6 + 5 + 5 + 4 + 4 + 3 + 3 = 30, which is even, so the parity condition passes. But a vertex of degree 6 in a simple graph on 7 vertices must be adjacent to every other vertex. Then every other vertex has degree at least 1 from that universal vertex. The sequence is still possible in principle. Use the Havel–Hakimi algorithm: remove the 6 and subtract 1 from the next six degrees, giving (4, 4, 3, 3, 2, 2). Remove the 4 and subtract 1 from the next four: (3, 2, 2, 1, 2), reorder to (3, 2, 2, 2, 1). Continue; the process eventually produces a negative entry, so the sequence is not graphical.`,
      },
      {
        question: `How many labeled trees are there on 5 vertices?`,
        answer: `Cayley's formula gives n^(n−2) = 5³ = 125 labeled trees on 5 vertices. The formula counts trees whose vertices are distinguishable; if the vertices were unlabeled, the count would be the number of non-isomorphic trees, which is much smaller (three trees on 5 vertices). The Prüfer code gives a bijection between labeled trees and sequences of length n − 2 over the vertex set, which proves the formula.`,
      },
      {
        question: `A connected planar graph has 6 vertices, 10 edges, and no triangles. Is it possible?`,
        answer: `If the graph is simple, planar, and triangle-free, every face has length at least 4. Counting edge-face incidences gives 2E ≥ 4F, so F ≤ E/2 = 5. Euler's formula gives F = 2 − V + E = 2 − 6 + 10 = 6. This contradicts F ≤ 5. Therefore no such graph exists. The general bound for triangle-free planar graphs is E ≤ 2V − 4; here 10 ≤ 8 is false, which is the same contradiction.`,
      },
    ],
    cheat: [
      "Handshake: Σ deg(v) = 2|E|; the number of odd-degree vertices is even.",
      "Tree on n vertices: n − 1 edges, connected, acyclic, unique path between every pair.",
      "Cayley: n^(n−2) labeled trees on n vertices; Prüfer sequences have length n − 2.",
      "Euler circuit: connected and every degree even. Euler path: exactly 0 or 2 odd degrees.",
      "Planar connected: V − E + F = 2; simple planar E ≤ 3V − 6; bipartite planar E ≤ 2V − 4.",
      "Bipartite ⇔ no odd cycle ⇔ 2-colorable. χ(Cₙ) = 2 for even n, 3 for odd n.",
      "Greedy coloring uses at most Δ + 1 colors; Brooks improves to Δ except for cliques and odd cycles.",
      "Hall: matching saturating L exists iff |N(S)| ≥ |S| for every S ⊆ L. König: max matching = min vertex cover in bipartite graphs.",
    ],
    recap: `Graph theory is the study of connections. Degree counting gives global constraints from local information; trees are the minimal connected structures; Euler and Hamilton ask for tours with different constraints; planarity limits how many edges a drawing can have; coloring measures conflict; matchings measure pairing. The exam repeatedly tests the same handful of invariants: degree sums, component counts, edge bounds, cycles, and parity.`,
    code: {
      title: "Bipartite check with BFS",
      language: "python",
      code: `from collections import deque def is_bipartite(graph): color = {} for start in graph: if start in color: continue color[start] = 0 queue = deque([start]) while queue: u = queue.popleft() for v in graph[u]: if v not in color: color[v] = 1 - color[u] queue.append(v) elif color[v] == color[u]: return False return True graph = {0: [1, 3], 1: [0, 2], 2: [1, 3], 3: [0, 2]}
print(is_bipartite(graph)) # True (a 4-cycle)
graph[0].append(2)
graph[2].append(0)
print(is_bipartite(graph)) # False (a triangle)`,
      explanation:
        "BFS assigns alternating colors. If an edge joins two vertices with the same color, the graph contains an odd cycle and cannot be bipartite. The check is linear in vertices plus edges.",
    },
    diagram: {
      title: "Graph families and their edge counts",
      caption:
        "Trees, planar graphs, complete graphs, and bipartite graphs have different edge budgets.",
      mermaid: `flowchart TD G[Graph] --> T[Tree: n-1 edges] G --> P[Simple planar: E ≤ 3V-6] G --> B[Bipartite planar: E ≤ 2V-4] G --> K[Complete K_n: n(n-1)/2 edges] P --> E[Euler: V - E + F = 2] B --> H[Hall / König matching]`,
    },
  },
  "gate-cs-engineering-mathematics-linear-algebra": {
    intro: `Linear algebra is the study of vector spaces and the linear maps between them. A vector is an ordered list of numbers; a matrix is a rectangular array that represents a linear transformation, a system of equations, or a dataset. The central problem is solving Ax = b: given a matrix A and a vector b, find every vector x that the transformation A sends to b. The answer depends on the column space of A, the null space of A, and the rank of A, and those three ideas organize almost the entire subject.`,
    foundations: `A vector space over a field F is a set closed under addition and scalar multiplication, satisfying associativity, commutativity, distributivity, and the existence of a zero vector and additive inverses. The standard example is Fⁿ. A linear combination of vectors is a sum of scalar multiples; the span is the set of all such combinations. A set of vectors is linearly independent when the only combination equal to zero is the trivial one with every coefficient zero. A basis is an independent set that spans the space, and the dimension is the number of vectors in any basis. Every basis of a finite-dimensional space has the same size. A linear transformation T : V → W satisfies T(u + v) = T(u) + T(v) and T(cu) = cT(u); once bases are chosen, every such map is multiplication by a matrix.`,
    concepts: [
      {
        title: "Gaussian elimination, rank, and consistency",
        body: `To solve Ax = b, form the augmented matrix [A | b] and use elementary row operations to reach row echelon form. The number of pivots is the rank of A; the rank of the augmented matrix is the rank of [A | b]. The system is consistent exactly when rank(A) = rank([A | b]). If the system is consistent, the number of free variables is n − rank(A), where n is the number of unknowns. A unique solution occurs when rank(A) = rank([A | b]) = n; infinitely many solutions occur when the common rank is less than n. Row operations preserve the solution set but not the column space, so use them for solving systems, not for reading off the image of A.`,
      },
      {
        title: "Vector spaces, rank–nullity, and the four subspaces",
        body: `For an m × n matrix A, the column space C(A) is the span of its columns, a subspace of Fᵐ; its dimension is rank(A). The null space N(A) is the set of x with Ax = 0, a subspace of Fⁿ; its dimension is the nullity. The rank–nullity theorem states rank(A) + nullity(A) = n. The row space is the span of the rows, a subspace of Fⁿ with dimension rank(A); the left null space is the set of y with yᵀA = 0, a subspace of Fᵐ with dimension m − rank(A). These four subspaces satisfy orthogonal complement relationships: N(A) is orthogonal to the row space, and the left null space is orthogonal to the column space.`,
      },
      {
        title: "Determinants and invertibility",
        body: `The determinant is the signed volume scale factor of a linear transformation. For a square matrix A, det(A) ≠ 0 exactly when A is invertible, exactly when its columns are linearly independent, exactly when rank(A) = n, and exactly when 0 is not an eigenvalue. The determinant is multiplicative: det(AB) = det(A) det(B), and det(Aᵀ) = det(A). A row swap changes the sign; adding a multiple of one row to another leaves the determinant unchanged; multiplying a row by c multiplies the determinant by c. For a 2 × 2 matrix [[a, b], [c, d]], det = ad − bc. The inverse is A⁻¹ = adj(A)/det(A), where adj(A) is the transpose of the cofactor matrix. Cramer's rule writes each unknown as a ratio of determinants, which is elegant but computationally inefficient.`,
      },
      {
        title: "Eigenvalues, eigenvectors, and diagonalization",
        body: `A nonzero vector v is an eigenvector of A with eigenvalue λ when Av = λv. The eigenvalues are the roots of the characteristic polynomial det(A − λI) = 0. The algebraic multiplicity of λ is its multiplicity as a root; the geometric multiplicity is the dimension of the eigenspace N(A − λI). Geometric multiplicity never exceeds algebraic multiplicity. A matrix is diagonalizable exactly when it has n linearly independent eigenvectors, equivalently when geometric multiplicity equals algebraic multiplicity for every eigenvalue. Distinct eigenvalues always give independent eigenvectors, so a matrix with n distinct eigenvalues is diagonalizable. Symmetric real matrices are orthogonally diagonalizable: A = QΛQᵀ with Q orthogonal.`,
      },
      {
        title: "Orthogonality, projections, and least squares",
        body: `The dot product of u and v is uᵀv = Σ uᵢvᵢ; vectors are orthogonal when their dot product is zero. The length of v is √(vᵀv), and the Cauchy–Schwarz inequality says |uᵀv| ≤ ||u|| ||v||. The orthogonal projection of b onto a subspace W is the closest point of W to b. If the columns of A form a basis for W, the projection is A(AᵀA)⁻¹Aᵀb. When AᵀA is invertible, the least-squares solution of Ax ≈ b solves the normal equations AᵀAx = Aᵀb. Gram–Schmidt turns a basis into an orthonormal basis by subtracting projections onto the vectors already constructed. The projection matrix P = A(AᵀA)⁻¹Aᵀ is symmetric and idempotent: P² = P.`,
      },
      {
        title: "Linear transformations and change of basis",
        body: `A linear transformation is determined by what it does to a basis. If T has matrix A in the standard basis and B is a matrix whose columns are a new basis, then the matrix of T in the new basis is B⁻¹AB. This is a similarity transformation; similar matrices have the same determinant, trace, rank, and eigenvalues. The kernel of T is the set of vectors mapped to zero, and the image is the set of outputs; rank–nullity says dim(ker T) + dim(im T) = dim(V). Composition of transformations corresponds to matrix multiplication: if S has matrix A and T has matrix B, then S ∘ T has matrix AB, with the order matching the composition.`,
      },
    ],
    worked: [
      {
        title: "Solving a system and computing rank",
        body: `Solve x + 2y + z = 4, 2x + 4y + 2z = 8, x − y + z = 1. The second equation is twice the first, so it adds no information. Subtract the first from the third: −3y = −3, so y = 1. Substitute into the first: x + 2 + z = 4, so x + z = 2. The solution set is (x, y, z) = (2 − t, 1, t) for any t. The coefficient matrix has rank 2 and three unknowns, so the nullity is 1, matching the one free parameter. The system is consistent because the augmented rank is also 2.`,
      },
      {
        title: "Diagonalizing a symmetric 2 × 2 matrix",
        body: `Let A = [[2, 1], [1, 2]]. The characteristic polynomial is det([[2 − λ, 1], [1, 2 − λ]]) = (2 − λ)² − 1 = λ² − 4λ + 3 = (λ − 1)(λ − 3). The eigenvalues are 1 and 3. For λ = 1, solve (A − I)v = 0: [[1, 1], [1, 1]]v = 0, so v₁ + v₂ = 0 and an eigenvector is (1, −1). For λ = 3, [[−1, 1], [1, −1]]v = 0, so v₁ = v₂ and an eigenvector is (1, 1). The two eigenvectors are orthogonal, as expected for a symmetric matrix. Normalize them to get Q = (1/√2)[[1, 1], [1, −1]] and A = Q diag(3, 1) Qᵀ.`,
      },
      {
        title: "Least-squares line through three points",
        body: `Fit y = a + bx to the points (0, 1), (1, 2), (2, 2). The system is a = 1, a + b = 2, a + 2b = 2. In matrix form A = [[1, 0], [1, 1], [1, 2]] and b = (1, 2, 2)ᵀ. The normal equations are AᵀA = [[3, 3], [3, 5]] and Aᵀb = (5, 6)ᵀ. Solve 3a + 3b = 5 and 3a + 5b = 6; subtracting gives 2b = 1, so b = 0.5 and a = 5/6. The least-squares line is y = 5/6 + x/2. It does not pass through any of the three points exactly, but it minimizes the sum of squared vertical errors.`,
      },
    ],
    exam: [
      {
        question: `A is a 4 × 6 matrix with rank 3. What are the dimensions of its null space and left null space?`,
        answer: `The rank–nullity theorem for the domain gives nullity = 6 − 3 = 3, so the null space has dimension 3. The left null space is the null space of Aᵀ, a 6 × 4 matrix with the same rank 3; its dimension is 4 − 3 = 1. The four fundamental subspaces therefore have dimensions 3 (column space), 3 (row space), 3 (null space), and 1 (left null space).`,
      },
      {
        question: `If A is a 3 × 3 matrix with det(A) = 2, what is det(2A)?`,
        answer: `Multiplying a 3 × 3 matrix by 2 multiplies each of its three rows by 2, and each row scaling multiplies the determinant by 2. Therefore det(2A) = 2³ det(A) = 8 · 2 = 16. A common mistake is to answer 2 · 2 = 4; the factor is 2ⁿ for an n × n matrix.`,
      },
      {
        question: `Can a 3 × 3 matrix have eigenvalues 1, 1, 2 and only one linearly independent eigenvector for λ = 1?`,
        answer: `Yes. The algebraic multiplicity of λ = 1 is 2, but the geometric multiplicity can be 1. For example, the Jordan block [[1, 1, 0], [0, 1, 0], [0, 0, 2]] has eigenvalue 1 with algebraic multiplicity 2 and only one independent eigenvector, (1, 0, 0). The matrix is not diagonalizable. If the geometric multiplicity were 2, it would be diagonalizable.`,
      },
      {
        question: `Find the projection of b = (1, 2, 3) onto the line spanned by a = (1, 1, 1).`,
        answer: `The projection is (aᵀb / aᵀa) a. Here aᵀb = 6 and aᵀa = 3, so the coefficient is 2 and the projection is (2, 2, 2). The residual b − proj = (−1, 0, 1) is orthogonal to a: (−1) + 0 + 1 = 0. The closest point on the line is therefore (2, 2, 2).`,
      },
    ],
    cheat: [
      "Rank–nullity: rank(A) + nullity(A) = number of columns of A.",
      "Ax = b is consistent iff rank(A) = rank([A|b]); unique iff the common rank equals the number of unknowns.",
      "det(AB) = det(A)det(B); det(Aᵀ) = det(A); det(cA) = cⁿ det(A) for an n × n matrix.",
      "A invertible ⇔ det(A) ≠ 0 ⇔ rank(A) = n ⇔ columns independent ⇔ 0 is not an eigenvalue.",
      "Eigenvalues solve det(A − λI) = 0; geometric multiplicity ≤ algebraic multiplicity.",
      "Diagonalizable ⇔ n independent eigenvectors ⇔ geometric = algebraic multiplicity for every eigenvalue.",
      "Symmetric real matrices are orthogonally diagonalizable; distinct eigenvalues give orthogonal eigenvectors.",
      "Projection onto col(A): P = A(AᵀA)⁻¹Aᵀ; least squares solves AᵀAx = Aᵀb.",
    ],
    recap: `Linear algebra is organized by the equation Ax = b. The column space tells you which b are reachable; the null space tells you how many solutions there are; the rank counts the independent directions; the determinant tells you whether the transformation is invertible; eigenvalues tell you how the transformation stretches its own invariant directions. Once those five ideas are clear, most computational questions become row reduction plus a determinant or characteristic polynomial.`,
    code: {
      title: "Gaussian elimination with partial pivoting",
      language: "python",
      code: `def solve(A, b): n = len(A) M = [row[:] + [b[i]] for i, row in enumerate(A)] for col in range(n): pivot = max(range(col, n), key=lambda r: abs(M[r][col])) if abs(M[pivot][col]) < 1e-12: return None # singular or underdetermined M[col], M[pivot] = M[pivot], M[col] for r in range(col + 1, n): factor = M[r][col] / M[col][col] for c in range(col, n + 1): M[r][c] -= factor * M[col][c] x = [0.0] * n for i in range(n - 1, -1, -1): x[i] = (M[i][n] - sum(M[i][j] * x[j] for j in range(i + 1, n))) / M[i][i] return x print(solve([[1, 2, 1], [2, 4, 2], [1, -1, 1]], [4, 8, 1])) # singular in this form`,
      explanation:
        "Partial pivoting chooses the largest available pivot to control floating-point error. The example is intentionally singular: the second row is twice the first, so the algorithm reports None instead of dividing by zero.",
    },
    diagram: {
      title: "The four fundamental subspaces",
      caption:
        "Rank–nullity connects the dimensions of the column space and null space.",
      mermaid: `flowchart LR A["A: m × n, rank r"] --> C["Column space C(A): dimension r"] A --> R["Row space C(Aᵀ): dimension r"] A --> N["Null space N(A): dimension n - r"] A --> L["Left null space N(Aᵀ): dimension m - r"] N -.->|orthogonal| R L -.->|orthogonal| C`,
    },
  },
  "gate-cs-engineering-mathematics-calculus-and-optimization": {
    intro: `Calculus studies how quantities change. The derivative measures the instantaneous rate of change of a function, the integral measures accumulated change, and the fundamental theorem of calculus says the two operations are inverses of each other. Optimization asks for the input that makes a function as large or as small as possible. In computer science, derivatives become gradients, integrals become sums and expectations, and optimization becomes the engine behind machine learning, scheduling, and numerical methods.`,
    foundations: `The limit of f(x) as x approaches a is L when f(x) can be made arbitrarily close to L by taking x sufficiently close to a, but not equal to a. A function is continuous at a when the limit exists, the value exists, and the two are equal. The derivative is f'(x) = lim_{h→0} (f(x+h) − f(x))/h. Standard derivatives include (xⁿ)' = nxⁿ⁻¹, (eˣ)' = eˣ, (ln x)' = 1/x, (sin x)' = cos x, and (cos x)' = −sin x. The chain rule, product rule, and quotient rule combine these. The definite integral ∫ₐᵇ f(x) dx is the signed area under the curve, and the fundamental theorem says ∫ₐᵇ f'(x) dx = f(b) − f(a) when f' is continuous.`,
    concepts: [
      {
        title: "Limits, continuity, and asymptotics",
        body: `A limit exists only when the left-hand and right-hand limits agree. The squeeze theorem is often the fastest way to evaluate a limit: if g(x) ≤ f(x) ≤ h(x) near a and g and h both approach L, then f approaches L. L'Hôpital's rule applies to indeterminate forms 0/0 or ∞/∞ and replaces the ratio of functions by the ratio of their derivatives, provided the resulting limit exists. Growth rates are ordered as log log n < log n < √n < n < n log n < n² < 2ⁿ < n!. In algorithm analysis, constants and lower-order terms are discarded, but the limit comparison test tells you which term eventually dominates.`,
      },
      {
        title: "Differentiation and Taylor approximation",
        body: `The derivative is the slope of the tangent line, and the tangent line is the best linear approximation to the function near a point. The second derivative measures concavity: positive means convex, negative means concave. Taylor's theorem expands a smooth function around a: f(x) = f(a) + f'(a)(x−a) + f''(a)(x−a)²/2! + ... + Rₙ. The remainder Rₙ is controlled by the next derivative. The expansion is the basis for numerical methods, error analysis, and many optimization algorithms. For example, eˣ ≈ 1 + x + x²/2 near zero, and the error is bounded by e^|x| |x|³/6 for the cubic truncation.`,
      },
      {
        title: "Integration techniques and applications",
        body: `Integration is the inverse of differentiation up to a constant. Substitution reverses the chain rule: ∫ f(g(x))g'(x) dx = ∫ f(u) du. Integration by parts reverses the product rule: ∫ u dv = uv − ∫ v du. Partial fractions decompose a rational function into simpler terms. Definite integrals compute areas, volumes, averages, and probabilities. The average value of f on [a, b] is (1/(b−a))∫ₐᵇ f(x) dx. Improper integrals are defined by limits, and they converge when the limit exists. In probability, the integral of a density over an interval gives the probability of that interval.`,
      },
      {
        title: "Single-variable optimization",
        body: `A local maximum or minimum of a differentiable function occurs at a critical point where f'(x) = 0, or at a point where f' does not exist, or at an endpoint of the domain. The first-derivative test checks the sign change of f'; the second-derivative test checks the sign of f'': f'' > 0 gives a local minimum, f'' < 0 gives a local maximum, and f'' = 0 is inconclusive. On a closed interval, compare the values at all critical points and both endpoints. Global optimization is not local optimization plus hope: a function can have several local minima, and the global minimum is the smallest of the candidate values.`,
      },
      {
        title: "Multivariable optimization and Lagrange multipliers",
        body: `For f(x, y), the gradient ∇f = (∂f/∂x, ∂f/∂y) points in the direction of steepest increase. A local extremum in the interior of the domain requires ∇f = 0. The Hessian matrix of second partial derivatives classifies the critical point: positive definite gives a local minimum, negative definite gives a local maximum, and indefinite gives a saddle point. For a constrained problem maximize f subject to g = 0, the method of Lagrange multipliers solves ∇f = λ∇g together with g = 0. The multiplier λ measures how much the optimal value changes when the constraint is relaxed.`,
      },
      {
        title: "Convexity and why it simplifies optimization",
        body: `A set is convex when the line segment between any two of its points lies entirely in the set. A function is convex when f(θx + (1−θ)y) ≤ θf(x) + (1−θ)f(y) for θ ∈ [0, 1]. For a differentiable convex function, the tangent plane lies below the graph, and every local minimum is a global minimum. Strict convexity gives uniqueness. Jensen's inequality says f(E[X]) ≤ E[f(X)] for convex f. Convex optimization problems are attractive because first-order methods can find global optima efficiently; nonconvex problems may have many local minima and no easy certificate of global optimality.`,
      },
    ],
    worked: [
      {
        title: "Optimizing a cubic on a closed interval",
        body: `Find the maximum and minimum of f(x) = x³ − 3x + 2 on [−2, 2]. The derivative is f'(x) = 3x² − 3 = 3(x − 1)(x + 1), so the critical points are x = −1 and x = 1. Evaluate: f(−2) = −8 + 6 + 2 = 0; f(−1) = −1 + 3 + 2 = 4; f(1) = 1 − 3 + 2 = 0; f(2) = 8 − 6 + 2 = 4. The maximum is 4 at x = −1 and x = 2; the minimum is 0 at x = −2 and x = 1. The second-derivative test would classify x = −1 as a local maximum and x = 1 as a local minimum, but the endpoints tie the local extrema.`,
      },
      {
        title: "Lagrange multipliers with a linear constraint",
        body: `Maximize f(x, y) = xy subject to x + y = 10. The gradients are ∇f = (y, x) and ∇g = (1, 1). The Lagrange equations are y = λ, x = λ, and x + y = 10. Therefore x = y = 5, and the maximum value is 25. The constraint is a line; the product xy is the area of a rectangle with fixed perimeter, and the square maximizes it. The multiplier λ = 5 equals the marginal increase in the optimum when the constraint constant increases by 1.`,
      },
      {
        title: "A Taylor bound for e^x",
        body: `Approximate e^0.1 by 1 + 0.1 + 0.1²/2 = 1.105. The next term is 0.1³/6 ≈ 0.0001667, and the remainder after the quadratic is bounded by e^0.1 · 0.1³/6 < 1.11 · 0.0001667 ≈ 0.000185. The true value is about 1.105170, so the approximation error is about 0.00017, inside the bound. Taylor's theorem gives a certificate, not just an empirical guess.`,
      },
    ],
    exam: [
      {
        question: `Find all critical points of f(x, y) = x² + y² − 2x − 4y + 5 and classify them.`,
        answer: `Set the partial derivatives to zero: ∂f/∂x = 2x − 2 = 0 gives x = 1; ∂f/∂y = 2y − 4 = 0 gives y = 2. The only critical point is (1, 2). The Hessian is [[2, 0], [0, 2]], which is positive definite, so the point is a local minimum. The value is f(1, 2) = 1 + 4 − 2 − 8 + 5 = 0. Since the function is a sum of squares, (1, 2) is also the global minimum.`,
      },
      {
        question: `Evaluate ∫₀¹ x e^(x²) dx.`,
        answer: `Let u = x², so du = 2x dx and x dx = du/2. When x = 0, u = 0; when x = 1, u = 1. The integral becomes (1/2)∫₀¹ e^u du = (1/2)(e − 1). Differentiating the antiderivative (1/2)e^(x²) gives x e^(x²), confirming the result.`,
      },
      {
        question: `A rectangle has perimeter 20. What is its maximum area?`,
        answer: `Let the sides be x and y. The constraint is 2x + 2y = 20, so x + y = 10. The area is A = xy = x(10 − x) = 10x − x². The derivative is 10 − 2x, which is zero at x = 5. The second derivative is −2, so this is a maximum. The rectangle is a 5 × 5 square with area 25. The same result follows from Lagrange multipliers or the AM–GM inequality.`,
      },
      {
        question: `Does f(x) = x⁴ have a local minimum, a local maximum, or neither at x = 0?`,
        answer: `The derivative is 4x³, which is zero only at x = 0. The second derivative is 12x², which is also zero at x = 0, so the second-derivative test is inconclusive. But x⁴ ≥ 0 for every x and x⁴ = 0 only at x = 0, so x = 0 is a global minimum. The first-derivative test confirms it: f' < 0 for x < 0 and f' > 0 for x > 0, so the function decreases then increases.`,
      },
    ],
    cheat: [
      "Derivative rules: power, product, quotient, chain; (eˣ)′ = eˣ, (ln x)′ = 1/x, (sin x)′ = cos x.",
      "Taylor: f(x) = Σ f⁽ᵏ⁾(a)(x−a)ᵏ/k! + remainder; second-order term controls convexity.",
      "Optimization: solve f′ = 0, check endpoints, classify with f″ or the Hessian.",
      "Multivariable: ∇f = 0 for interior extrema; Hessian positive definite = min, negative definite = max, indefinite = saddle.",
      "Lagrange: ∇f = λ∇g plus g = 0; λ is the marginal value of relaxing the constraint.",
      "Convex f: every local minimum is global; Jensen: f(E[X]) ≤ E[f(X)].",
      "Integration by parts: ∫u dv = uv − ∫v du; substitution reverses the chain rule.",
      "Growth order: log n < √n < n < n log n < n² < 2ⁿ < n!.",
    ],
    recap: `Calculus turns change into arithmetic: derivatives measure local change, integrals accumulate it, and Taylor series connects the two. Optimization is the search for the best input, and the gradient plus the Hessian is the standard toolkit. In computer science, the same ideas reappear as asymptotic growth, gradient descent, cost functions, and probabilistic expectations.`,
    code: {
      title: "Gradient descent on a convex quadratic",
      language: "python",
      code: `def gradient_descent(start, lr=0.1, steps=100): x, y = start for _ in range(steps): gx = 2 * (x - 1) # d/dx of (x-1)^2 + (y-2)^2 gy = 2 * (y - 2) x -= lr * gx y -= lr * gy return x, y print(gradient_descent((0, 0))) # approaches (1.0, 2.0)
print(gradient_descent((0, 0), lr=1.1)) # diverges: step too large`,
      explanation:
        "The gradient points uphill, so subtracting a multiple of it moves downhill. A small learning rate converges slowly; a rate above the stability threshold overshoots and diverges. The example is the same quadratic used in the critical-point exercise.",
    },
    diagram: {
      title: "Classifying critical points",
      caption: "The gradient finds candidates; the Hessian classifies them.",
      mermaid: `flowchart TD F[Objective f] --> G[Compute gradient] G --> Z[Solve gradient = 0] Z --> H[Compute Hessian] H --> PD{Positive definite?} PD -->|Yes| MIN[Local minimum] PD -->|No| ND{Negative definite?} ND -->|Yes| MAX[Local maximum] ND -->|No| SADDLE[Saddle or inconclusive] MIN --> E[Check boundary and global values]`,
    },
  },
  "gate-cs-engineering-mathematics-probability": {
    intro: `Probability assigns numbers between 0 and 1 to events in a sample space. The sample space Ω is the set of all possible outcomes of an experiment; an event is a subset of Ω. For a fair die, Ω = {1, 2, 3, 4, 5, 6}, and the event "the roll is even" is {2, 4, 6}. When all outcomes are equally likely, the probability of an event A is |A|/|Ω|, but that formula is a special case, not the definition. The general definition is a function P on events satisfying P(Ω) = 1, P(A) ≥ 0, and countable additivity for disjoint events.`,
    foundations: `The complement rule says P(Aᶜ) = 1 − P(A). For any two events, P(A ∪ B) = P(A) + P(B) − P(A ∩ B). Conditional probability is P(A | B) = P(A ∩ B)/P(B), defined when P(B) > 0. Rearranging gives the multiplication rule P(A ∩ B) = P(A | B)P(B). Events A and B are independent when P(A ∩ B) = P(A)P(B), equivalently P(A | B) = P(A) when P(B) > 0. Independence is not the same as mutual exclusion: mutually exclusive events cannot occur together, while independent events do not influence each other's probabilities. A partition of Ω is a collection of pairwise disjoint events whose union is Ω; the law of total probability writes P(B) as the sum of P(B | Aᵢ)P(Aᵢ) over the blocks of a partition.`,
    concepts: [
      {
        title: "Sample spaces, equally likely outcomes, and counting",
        body: `For a finite sample space with equally likely outcomes, P(A) = |A|/|Ω|. The difficulty is almost always in defining Ω correctly. Two dice produce 36 ordered outcomes, not 21 unordered sums; coins produce 2ⁿ sequences, not n + 1 counts of heads. When outcomes are not equally likely, use the axioms and the rules rather than counting. For a continuous sample space, individual outcomes usually have probability zero, and probability is computed as an integral of a density over an interval. The probability of any event must lie between 0 and 1, and the probabilities of a partition sum to 1.`,
      },
      {
        title: "Conditional probability and independence",
        body: `Conditional probability restricts the sample space to B and renormalizes by P(B). The formula P(A | B) = P(A ∩ B)/P(B) is a definition, not a theorem. The multiplication rule extends to several events: P(A ∩ B ∩ C) = P(A)P(B | A)P(C | A ∩ B). Independence requires every pairwise and higher-order product condition; pairwise independence does not imply mutual independence. A classic warning: if A and B are mutually exclusive and both have positive probability, they are not independent, because knowing that one occurred tells you the other did not. Conversely, independent events can have a nonempty intersection.`,
      },
      {
        title: "Total probability and Bayes’ theorem",
        body: `If A₁, ..., Aₖ partition Ω, then P(B) = Σ P(B | Aᵢ)P(Aᵢ). Bayes' theorem reverses the conditioning: P(Aᵢ | B) = P(B | Aᵢ)P(Aᵢ) / Σ P(B | Aⱼ)P(Aⱼ). The base rate P(Aᵢ) is often the most important term and the most commonly forgotten. A test with 99% sensitivity and 99% specificity on a disease with 1% prevalence gives a positive predictive value of only 50%: out of 10,000 people, 100 are sick and 99 test positive, while 9,900 are healthy and 99 false-positive. The ratio 99/(99+99) is 0.5, not 0.99.`,
      },
      {
        title: "Random variables, expectation, and variance",
        body: `A random variable is a function from Ω to the real numbers. A discrete random variable has a probability mass function p(x) = P(X = x), with Σ p(x) = 1. A continuous random variable has a probability density function f(x), with P(a ≤ X ≤ b) = ∫ₐᵇ f(x) dx. The cumulative distribution function is F(x) = P(X ≤ x). Expectation is E[X] = Σ x p(x) or ∫ x f(x) dx; variance is Var(X) = E[(X − E[X])²] = E[X²] − (E[X])². Expectation is linear even for dependent variables: E[X + Y] = E[X] + E[Y]. Variance is not: Var(X + Y) = Var(X) + Var(Y) + 2Cov(X, Y), and the covariance term vanishes under independence.`,
      },
      {
        title: "Standard distributions",
        body: `The Bernoulli(p) distribution is 1 with probability p and 0 with probability 1 − p; mean p, variance p(1 − p). The binomial(n, p) counts successes in n independent Bernoulli trials; mean np, variance np(1 − p). The geometric(p) counts trials until the first success; mean 1/p, variance (1 − p)/p². The Poisson(λ) models counts in a fixed interval; mean and variance are both λ. The uniform(a, b) has density 1/(b − a); mean (a + b)/2, variance (b − a)²/12. The exponential(λ) models waiting times; mean 1/λ, variance 1/λ², and it is memoryless. The normal(μ, σ²) has the bell-shaped density; the standard normal has mean 0 and variance 1, and about 68% of its mass lies within one standard deviation.`,
      },
      {
        title: "Limit theorems and concentration",
        body: `The law of large numbers says the sample average of independent, identically distributed random variables converges to the population mean as the sample size grows. The central limit theorem says the standardized sample average converges in distribution to a standard normal, regardless of the underlying distribution, provided the variance is finite. Chebyshev's inequality gives a distribution-free bound: P(|X − μ| ≥ kσ) ≤ 1/k². Markov's inequality gives P(X ≥ a) ≤ E[X]/a for nonnegative X. These inequalities are loose but require almost no assumptions, which makes them useful in algorithm analysis and in proofs where the exact distribution is unknown.`,
      },
    ],
    worked: [
      {
        title: "Conditional probability with two dice",
        body: `Roll two fair dice. Given that the first die shows 4, what is the probability that the sum is greater than 8? The conditional sample space has six equally likely outcomes (4,1) through (4,6). The favorable outcomes are (4,5) and (4,6), so the probability is 2/6 = 1/3. Without the condition, the probability that the sum exceeds 8 is 10/36 = 5/18, because the sums 9 through 12 have 4 + 3 + 2 + 1 = 10 outcomes. The condition changes the denominator and the relevant outcomes, which is exactly what conditional probability formalizes.`,
      },
      {
        title: "Bayes with a diagnostic test",
        body: `A disease has prevalence 1%. A test has sensitivity 99% (P(+ | sick) = 0.99) and specificity 99% (P(− | healthy) = 0.99), so the false-positive rate is 1%. What is P(sick | +)? Take 10,000 people: 100 are sick, and 99 of them test positive; 9,900 are healthy, and 99 of them test positive. The total number of positives is 198, and 99 of them are true positives. Therefore P(sick | +) = 99/198 = 0.5. The base rate is small enough that false positives equal true positives. If the prevalence were 30%, the same test would give 0.99 · 3000 / (0.99 · 3000 + 0.01 · 7000) = 2970/3040 ≈ 0.977.`,
      },
      {
        title: "Expected tosses until the first head",
        body: `Let X be the number of tosses until the first head with a fair coin. Then P(X = k) = (1/2)^k for k = 1, 2, .... The expectation is Σ k/2^k. A clean way to compute it is to condition on the first toss: with probability 1/2 the game ends in one toss; with probability 1/2 the first toss is tails and the expected remaining number of tosses is again E[X]. Therefore E[X] = 1 + (1/2)E[X], so E[X] = 2. The variance is (1 − p)/p² = 2, and the distribution is memoryless: after any number of tails, the expected additional tosses is still 2.`,
      },
    ],
    exam: [
      {
        question: `Two events A and B have P(A) = 0.4, P(B) = 0.5, and P(A ∪ B) = 0.7. Are A and B independent?`,
        answer: `First compute P(A ∩ B) = P(A) + P(B) − P(A ∪ B) = 0.4 + 0.5 − 0.7 = 0.2. Independence would require P(A ∩ B) = 0.4 · 0.5 = 0.2. The two values match, so A and B are independent. They are not mutually exclusive, because their intersection has positive probability.`,
      },
      {
        question: `A fair coin is tossed 10 times. What is the probability of exactly 6 heads?`,
        answer: `The number of heads is binomial(10, 1/2). The probability is C(10, 6)(1/2)^6(1/2)^4 = 210/1024 = 105/512 ≈ 0.205. The binomial coefficient counts which six of the ten positions are heads; the powers of 1/2 give the probability of any particular sequence with six heads and four tails.`,
      },
      {
        question: `If X is uniform on [0, 4], find E[X], Var(X), and P(X > 2).`,
        answer: `For uniform(a, b), the mean is (a + b)/2 = 2 and the variance is (b − a)²/12 = 16/12 = 4/3. The density is 1/4 on [0, 4], so P(X > 2) = ∫₂⁴ (1/4) dx = 1/2. The probability is the length of the interval [2, 4] divided by the total length 4.`,
      },
      {
        question: `A Poisson random variable has mean 3. What are its variance and P(X = 0)?`,
        answer: `For Poisson(λ), the mean and variance are both λ, so the variance is 3. The probability of zero events is e^(−λ)λ⁰/0! = e^(−3) ≈ 0.0498. The Poisson model is appropriate for counts of rare events in a fixed interval when the events are independent and the rate is constant.`,
      },
    ],
    cheat: [
      "Axioms: P(Ω)=1, P(A)≥0, disjoint additivity. Complement: P(Aᶜ)=1−P(A).",
      "Union: P(A∪B)=P(A)+P(B)−P(A∩B). Conditional: P(A|B)=P(A∩B)/P(B).",
      "Independence: P(A∩B)=P(A)P(B). Mutual exclusion: P(A∩B)=0. They are different.",
      "Total probability: P(B)=ΣP(B|Aᵢ)P(Aᵢ). Bayes: P(Aᵢ|B)=P(B|Aᵢ)P(Aᵢ)/P(B).",
      "Binomial(n,p): mean np, variance np(1−p). Poisson(λ): mean λ, variance λ.",
      "Geometric(p): mean 1/p, variance (1−p)/p². Uniform(a,b): mean (a+b)/2, variance (b−a)²/12.",
      "Exponential(λ): mean 1/λ, variance 1/λ², memoryless. Normal(μ,σ²): 68% within 1σ.",
      "E[X+Y]=E[X]+E[Y] always; Var(X+Y)=Var(X)+Var(Y)+2Cov(X,Y).",
    ],
    recap: `Probability is counting with a budget and conditioning with a purpose. Define the sample space, translate the event, and choose between direct counting, the complement, total probability, or Bayes. Expectation is linear and therefore easy; variance requires independence or an explicit covariance term. The standard distributions are worth knowing cold because exam questions usually name the model and ask for a mean, a variance, or a tail probability.`,
    code: {
      title: "Simulating Bayes and the geometric distribution",
      language: "python",
      code: `import random def diagnostic_trial(prevalence=0.01, sensitivity=0.99, specificity=0.99, n=200000): sick = positives = true_pos = 0 for _ in range(n): has = random.random() < prevalence test = random.random() < (sensitivity if has else 1 - specificity) sick += has positives += test true_pos += has and test return true_pos / positives print(round(diagnostic_trial(), 3)) # about 0.5 def tosses_until_head(): count = 0 while True: count += 1 if random.random() < 0.5: return count trials = [tosses_until_head() for _ in range(100000)]
print(round(sum(trials) / len(trials), 2)) # about 2.0`,
      explanation:
        "The simulation makes the base-rate effect concrete: even with a 99% accurate test, only about half of positive results are true positives at 1% prevalence. The geometric simulation converges to the theoretical mean of 2 tosses.",
    },
    diagram: {
      title: "Choosing a probability tool",
      caption:
        "Conditioning and partitioning determine whether to count directly or use Bayes.",
      mermaid: `flowchart TD Q[Probability question] --> S[Define sample space Ω] S --> E[Write event A] E --> C{Equally likely outcomes?} C -->|Yes| COUNT[Count |A| / |Ω|] C -->|No| R[Use axioms and rules] R --> COND{Given that...?} COND -->|Yes| BAYES[Conditional / Bayes] COND -->|No| TOTAL[Total probability or complement] BAYES --> DIST[Identify distribution] TOTAL --> DIST`,
    },
  },
  "gate-cs-engineering-mathematics-statistics-and-estimation": {
    intro: `Statistics is the science of drawing conclusions from data that are incomplete and noisy. A population is the full set of objects we care about; a sample is the subset we actually observe. A parameter is a number describing the population, such as the mean μ or the variance σ². A statistic is a number computed from the sample, such as the sample mean x̄ or the sample variance s². Estimation uses statistics to guess parameters, and hypothesis testing uses statistics to decide whether the data are compatible with a claim.`,
    foundations: `The sample mean is x̄ = (1/n)Σxᵢ. The sample variance is s² = (1/(n−1))Σ(xᵢ − x̄)²; the denominator n−1 makes it an unbiased estimator of the population variance. The standard deviation is the square root of the variance. The median is the middle value when the data are sorted; the mode is the most frequent value. The range is max − min, and the interquartile range is Q₃ − Q₁. For a sampling distribution, the standard error of the mean is σ/√n, estimated by s/√n when σ is unknown. The central limit theorem makes the sample mean approximately normal for large n, which is the foundation of confidence intervals and tests.`,
    concepts: [
      {
        title: "Describing data: center, spread, and shape",
        body: `The mean is sensitive to outliers; the median is resistant. For a symmetric distribution, mean and median coincide; for a right-skewed distribution, the mean is typically larger than the median because the long right tail pulls it up. Variance and standard deviation measure spread around the mean, but they are in squared units and original units respectively. The coefficient of variation, s/x̄, compares spread across datasets with different scales. A box plot shows the median, quartiles, and potential outliers, using the 1.5 × IQR rule to flag points beyond the whiskers. Always plot the data before summarizing it; Anscombe's quartet shows that very different datasets can share the same mean, variance, and correlation.`,
      },
      {
        title: "Sampling distributions and the central limit theorem",
        body: `A sampling distribution is the distribution of a statistic over repeated samples. The mean of the sample mean is μ, and its standard deviation is σ/√n. The central limit theorem says that for independent observations with finite variance, the standardized sample mean (x̄ − μ)/(σ/√n) converges to a standard normal as n grows. The approximation is usually good for n ≥ 30 unless the underlying distribution is extremely skewed or heavy-tailed. The law of large numbers says x̄ converges to μ; the CLT additionally describes the shape of the fluctuations around μ.`,
      },
      {
        title: "Point estimation: bias, variance, and MSE",
        body: `An estimator θ̂ of a parameter θ is unbiased when E[θ̂] = θ. Its mean squared error is MSE(θ̂) = Var(θ̂) + Bias(θ̂)², so an estimator can trade a little bias for a large reduction in variance. An estimator is consistent when it converges to θ in probability as n → ∞. The maximum likelihood estimator (MLE) maximizes the likelihood of the observed data; under regularity conditions it is consistent and asymptotically efficient. The method of moments equates sample moments to population moments and solves for the parameters. For a Bernoulli(p) sample, the MLE is p̂ = x̄; for a normal sample, the MLE of μ is x̄ and the MLE of σ² uses denominator n, while the unbiased estimator uses n−1.`,
      },
      {
        title: "Confidence intervals",
        body: `A 95% confidence interval for a population mean, when σ is known, is x̄ ± z_{0.025} σ/√n, where z_{0.025} ≈ 1.96. When σ is unknown and the sample is small, replace σ by s and z by the t-distribution with n−1 degrees of freedom. A confidence interval does not mean "there is a 95% probability that μ lies in this particular interval"; the parameter is fixed, and the interval is random. The correct interpretation is that 95% of intervals constructed by this procedure would contain μ. A wider interval gives more confidence but less precision; increasing n narrows the interval in proportion to 1/√n.`,
      },
      {
        title: "Hypothesis testing and errors",
        body: `A hypothesis test starts with a null hypothesis H₀ and an alternative H₁. A test statistic is computed from the sample, and a p-value is the probability, assuming H₀ is true, of observing a statistic at least as extreme as the one observed. A small p-value is evidence against H₀, but it is not the probability that H₀ is true. A Type I error rejects a true null; its probability is the significance level α. A Type II error fails to reject a false null; its probability is β, and power is 1 − β. Reducing α usually increases β unless the sample size or effect size increases. A two-tailed test splits α across both tails; a one-tailed test puts it all in the direction of the alternative.`,
      },
      {
        title: "Correlation and linear regression",
        body: `The Pearson correlation coefficient r measures the strength and direction of a linear relationship; it lies between −1 and 1, and r² is the fraction of variance in one variable explained by a linear fit to the other. Correlation does not imply causation: a lurking variable can drive both, or the relationship can be coincidental. Spearman's rank correlation replaces values by ranks and is more robust to outliers and monotone nonlinear relationships. Simple linear regression fits y = β₀ + β₁x by minimizing the sum of squared residuals; the slope is β₁ = Cov(x, y)/Var(x), and the intercept is β₀ = ȳ − β₁x̄. Residual plots reveal nonlinearity and heteroscedasticity that a single R² can hide.`,
      },
    ],
    worked: [
      {
        title: "Maximum likelihood for a Bernoulli sample",
        body: `Observe n independent Bernoulli trials with unknown success probability p, and let k be the number of successes. The likelihood is L(p) = p^k(1 − p)^(n−k). The log-likelihood is k ln p + (n−k) ln(1 − p). Differentiate: k/p − (n−k)/(1 − p) = 0. Cross-multiply: k(1 − p) = (n−k)p, so k = np and p̂ = k/n. The second derivative is negative at this point, confirming a maximum. The MLE is the sample proportion, which is unbiased: E[p̂] = p.`,
      },
      {
        title: "A 95% confidence interval for a mean",
        body: `A sample of 25 students has a mean study time of 12 hours per week and a sample standard deviation of 4 hours. Assume the population is approximately normal. The standard error is s/√n = 4/5 = 0.8. With 24 degrees of freedom, the t critical value for 95% confidence is about 2.064. The interval is 12 ± 2.064 · 0.8 = 12 ± 1.651, or [10.349, 13.651]. If the sample were much larger, the t value would approach 1.96, and the interval would narrow because the standard error shrinks.`,
      },
      {
        title: "A one-sample t-test",
        body: `A factory claims its bottles contain 500 ml on average. A sample of 16 bottles has mean 495 ml and standard deviation 8 ml. Test at α = 0.05 whether the mean is different from 500. The standard error is 8/4 = 2. The t statistic is (495 − 500)/2 = −2.5 with 15 degrees of freedom. The two-tailed critical value at α = 0.05 is about 2.131. Since |−2.5| > 2.131, reject H₀. The p-value is approximately 0.025, which is below 0.05. The test suggests the mean is different from 500, but the effect size is 5 ml; practical significance depends on the product's tolerance.`,
      },
    ],
    exam: [
      {
        question: `A sample has values 2, 4, 4, 4, 5, 5, 7, 9. Find the mean, median, mode, and sample variance.`,
        answer: `The sum is 40 and n = 8, so the mean is 5. Sorted, the middle two values are 4 and 5, so the median is 4.5. The mode is 4, which appears three times. The squared deviations from 5 are 9, 1, 1, 1, 0, 0, 4, 16; their sum is 32. The sample variance is 32/(8−1) = 32/7 ≈ 4.571, and the sample standard deviation is about 2.138.`,
      },
      {
        question: `What happens to a 95% confidence interval when the sample size quadruples?`,
        answer: `The standard error is proportional to 1/√n. Quadrupling n divides √n by 2, so the standard error and the interval width are halved, assuming the sample standard deviation stays roughly the same. The confidence level stays 95%; only the precision improves. If you wanted a narrower interval without more data, you would have to lower the confidence level.`,
      },
      {
        question: `A test has α = 0.05 and power 0.80. What is the probability of a Type II error?`,
        answer: `Power is 1 − β, so β = 1 − 0.80 = 0.20. A Type II error is failing to reject a false null hypothesis; its probability is 20%. A Type I error is rejecting a true null; its probability is α = 5%. The two error probabilities move in opposite directions when the sample size and effect size are fixed.`,
      },
      {
        question: `Explain why correlation does not imply causation with a concrete example.`,
        answer: `Ice-cream sales and drowning deaths are positively correlated, but eating ice cream does not cause drowning. A third variable, hot weather, increases both: more people buy ice cream and more people swim. The correlation is real, but the causal direction is confounded. Only a controlled experiment or a carefully identified natural experiment can support a causal claim.`,
      },
    ],
    cheat: [
      "Sample variance: s² = Σ(xᵢ − x̄)²/(n−1); population variance divides by N.",
      "Standard error of the mean: σ/√n, estimated by s/√n when σ is unknown.",
      "CLT: (x̄ − μ)/(σ/√n) → N(0,1); good for n ≥ 30 in most cases.",
      "95% CI for mean: x̄ ± 1.96σ/√n (z) or x̄ ± t_{n−1,0.025}s/√n (t).",
      "MSE = variance + bias²; unbiased estimator has E[θ̂] = θ.",
      "Type I error = α = P(reject H₀ | H₀ true); Type II = β; power = 1 − β.",
      "Pearson r ∈ [−1,1]; r² is explained variance; Spearman uses ranks.",
      "Regression slope β₁ = Cov(x,y)/Var(x); intercept β₀ = ȳ − β₁x̄.",
    ],
    recap: `Statistics separates signal from noise. Describe the sample, model the sampling distribution, estimate the parameter with an explicit bias-variance trade-off, and quantify uncertainty with an interval or a test. The central limit theorem is what makes the normal and t distributions appear everywhere. Correlation and regression describe association; causation requires a design, not a coefficient.`,
    code: {
      title: "Mean, variance, and a confidence interval from scratch",
      language: "python",
      code: `import math data = [2, 4, 4, 4, 5, 5, 7, 9]
n = len(data)
mean = sum(data) / n
variance = sum((x - mean) ** 2 for x in data) / (n - 1)
se = math.sqrt(variance / n)
# t critical for 95% with 7 df is about 2.365
lo, hi = mean - 2.365 * se, mean + 2.365 * se
print(round(mean, 2), round(variance, 2), (round(lo, 2), round(hi, 2)))
# 5.0 4.57 (2.24, 7.76)`,
      explanation:
        "The computation follows the definitions exactly: mean, then sample variance with n−1, then the standard error and t-based interval. Doing it once by hand makes the formula meaningful; the code is only a check.",
    },
    diagram: {
      title: "From sample to inference",
      caption: "Estimation and testing both rely on the sampling distribution.",
      mermaid: `flowchart LR P[Population parameter] --> S[Sample statistic] S --> SD[Sampling distribution] SD --> CI[Confidence interval] SD --> T[Hypothesis test] CI --> D[Decision with uncertainty] T --> D D --> E[Effect size and practical significance]`,
    },
  },
  "gate-cs-engineering-mathematics-numerical-methods": {
    intro: `Numerical methods compute approximate answers to problems that are difficult or impossible to solve exactly. The approximation is not a defect to hide; it is the subject. Every method has an error, a convergence rate, and a cost per step, and the exam asks you to compare those quantities. The main families are root finding, interpolation, numerical integration, and the solution of linear systems.`,
    foundations: `Absolute error is |x̂ − x|; relative error is |x̂ − x|/|x| for x ≠ 0. Truncation error comes from replacing an infinite process by a finite one, as in a Taylor series cut off after a few terms. Round-off error comes from representing real numbers with finite precision. A method converges with order p when the error at step n+1 is bounded by a constant times the error at step n raised to the power p. Bisection converges linearly, Newton's method quadratically near a simple root, and the secant method with order about 1.618. A problem is well-conditioned when small changes in the input produce small changes in the output; a problem can be ill-conditioned even when the algorithm is stable.`,
    concepts: [
      {
        title: "Floating-point representation and error",
        body: `IEEE 754 double precision uses 64 bits: 1 sign bit, 11 exponent bits, and 52 fraction bits, giving about 15–17 significant decimal digits. Machine epsilon is the gap between 1 and the next representable number, about 2.2 × 10⁻¹⁶ for doubles. Catastrophic cancellation occurs when subtracting nearly equal numbers: 1.0000001 − 1.0000000 loses most of the significant digits. A stable algorithm controls the growth of round-off error; an unstable algorithm amplifies it. The condition number of a problem measures the relative change in the output for a relative change in the input, independent of the algorithm used.`,
      },
      {
        title: "Root finding: bisection, Newton, and secant",
        body: `Bisection starts with an interval [a, b] where f(a) and f(b) have opposite signs. It evaluates the midpoint, keeps the half with the sign change, and repeats. After n steps the error is at most (b − a)/2ⁿ, so bisection is guaranteed but slow. Newton's method uses the tangent line: x_{n+1} = x_n − f(x_n)/f'(x_n). Near a simple root it converges quadratically, but it can diverge, cycle, or fail when f' is zero or the starting point is poor. The secant method replaces the derivative with a finite difference and converges superlinearly without requiring an analytic derivative. Fixed-point iteration x_{n+1} = g(x_n) converges locally when |g'(x*)| < 1.`,
      },
      {
        title: "Interpolation and polynomial approximation",
        body: `Given n + 1 distinct points, there is exactly one polynomial of degree at most n passing through all of them. The Lagrange form writes P(x) = Σ yᵢ Lᵢ(x), where Lᵢ is 1 at xᵢ and 0 at the other nodes. The Newton divided-difference form is more efficient when adding new points. The interpolation error is f(x) − P(x) = f⁽ⁿ⁺¹⁾(ξ)/(n+1)! · Π(x − xᵢ) for some ξ in the interval. High-degree interpolation can oscillate wildly near the endpoints (Runge's phenomenon), which is why cubic splines are preferred for large datasets: they piece together low-degree polynomials with continuity conditions.`,
      },
      {
        title: "Numerical integration",
        body: `The trapezoidal rule approximates the area under f on [a, b] by a trapezoid: (b − a)(f(a) + f(b))/2. The composite trapezoidal rule splits the interval into n equal parts and sums the trapezoids; its error is O(h²), where h = (b − a)/n. Simpson's rule uses a quadratic through three points: (b − a)(f(a) + 4f(mid) + f(b))/6, with error O(h⁴) for smooth functions. Simpson's rule requires an even number of subintervals in its composite form. Gaussian quadrature chooses optimal nodes and weights and can be exact for polynomials of degree 2n − 1 with n nodes. The choice of method is a trade-off between accuracy, smoothness assumptions, and the number of function evaluations.`,
      },
      {
        title: "Solving linear systems and iterative methods",
        body: `Gaussian elimination with partial pivoting solves Ax = b in O(n³) operations and is the standard direct method. Pivoting swaps rows to put the largest available entry on the diagonal, reducing round-off error. LU decomposition factors A = LU and reuses the factors for multiple right-hand sides. The condition number κ(A) = ||A|| ||A⁻¹|| measures sensitivity: a large condition number means small input errors can produce large solution errors. Iterative methods such as Jacobi and Gauss–Seidel update an initial guess repeatedly; they converge for strictly diagonally dominant matrices and for symmetric positive definite matrices (Gauss–Seidel).`,
      },
      {
        title: "Numerical differentiation and ODEs",
        body: `The forward difference (f(x + h) − f(x))/h approximates f'(x) with error O(h), and the central difference (f(x + h) − f(x − h))/(2h) has error O(h²). Too large an h causes truncation error; too small an h causes catastrophic cancellation. Euler's method for y' = f(t, y) steps y_{n+1} = y_n + h f(t_n, y_n), with local error O(h²) and global error O(h). The improved Euler and Runge–Kutta methods use several slope estimates per step to achieve higher order. Stability depends on the step size relative to the problem's time scale.`,
      },
    ],
    worked: [
      {
        title: "Bisection for the square root of 2",
        body: `Find a root of f(x) = x² − 2 on [1, 2]. The midpoint is 1.5, and f(1.5) = 0.25 > 0, so the root lies in [1, 1.5]. The next midpoint is 1.25, and f(1.25) = −0.4375 < 0, so the root lies in [1.25, 1.5]. The next midpoint is 1.375, and f(1.375) = −0.109375 < 0, so the root lies in [1.375, 1.5]. After n steps the interval length is 1/2ⁿ; after 10 steps it is less than 0.001, and after 20 steps it is less than 10⁻⁶. Bisection is slow but its convergence is unconditional once the sign change is established.`,
      },
      {
        title: "Newton’s method for the square root of 2",
        body: `For f(x) = x² − 2, Newton's iteration is x_{n+1} = x_n − (x_n² − 2)/(2x_n) = (x_n + 2/x_n)/2. Starting at x₀ = 1: x₁ = 1.5, x₂ = (1.5 + 1.3333)/2 = 1.41667, x₃ = 1.41422, x₄ = 1.41421. The number of correct digits roughly doubles each step, which is quadratic convergence. The method fails if the derivative is zero at the root or if the starting point is far from the basin of attraction.`,
      },
      {
        title: "Simpson’s rule for an integral",
        body: `Approximate ∫₀² x² dx using Simpson's rule. The exact value is 8/3 ≈ 2.6667. With a = 0, b = 2, midpoint 1: f(0) = 0, f(1) = 1, f(2) = 4. Simpson gives (2 − 0)(0 + 4·1 + 4)/6 = 2 · 8/6 = 8/3, exact. Simpson's rule is exact for quadratics, which is why it nails this integral. For a cubic, the error would be nonzero but still small; the error formula involves the fourth derivative.`,
      },
    ],
    exam: [
      {
        question: `How many bisection steps are needed to reduce the error to 10⁻⁶ on an initial interval of length 1?`,
        answer: `The error after n steps is at most 1/2ⁿ. Solve 1/2ⁿ ≤ 10⁻⁶; taking logarithms gives n ≥ log₂(10⁶) ≈ 19.93, so 20 steps suffice. Bisection converges linearly, so each step adds one bit of accuracy. Newton's method would typically need only a handful of steps near a simple root.`,
      },
      {
        question: `What is the order of convergence of Newton’s method, and when does it fail?`,
        answer: `Newton's method converges quadratically near a simple root: the error at the next step is proportional to the square of the current error. It fails when f'(x*) = 0 at the root (the root is multiple), when the derivative is zero or undefined near the iterate, or when the starting point is outside the basin of attraction. It can also cycle between values.`,
      },
      {
        question: `Compare the trapezoidal rule and Simpson’s rule for a smooth function.`,
        answer: `The composite trapezoidal rule has error O(h²), while Simpson's rule has error O(h⁴). Simpson's rule is therefore much more accurate for the same step size when the fourth derivative is bounded, but it requires an even number of subintervals and assumes sufficient smoothness. For a function with a discontinuous derivative, the higher-order advantage can disappear.`,
      },
      {
        question: `What does a condition number of 10⁸ for a linear system imply?`,
        answer: `The condition number bounds the relative error in the solution by roughly κ(A) times the relative error in the input. With κ(A) = 10⁸, about eight digits of accuracy can be lost, so a double-precision computation (about 16 digits) may retain only about eight reliable digits. The system is ill-conditioned; better formulation or higher precision may be needed.`,
      },
    ],
    cheat: [
      "Absolute error |x̂−x|; relative error |x̂−x|/|x|; machine epsilon ≈ 2.2×10⁻¹⁶ for doubles.",
      "Bisection: guaranteed, linear, error ≤ (b−a)/2ⁿ; needs a sign change.",
      "Newton: x_{n+1}=x_n−f/f′, quadratic near a simple root; can diverge.",
      "Secant: superlinear (order ≈1.618), no derivative; fixed point converges if |g′|<1.",
      "Interpolation error: f⁽ⁿ⁺¹⁾(ξ)/(n+1)! · Π(x−xᵢ); high degree can cause Runge oscillation.",
      "Trapezoidal O(h²); Simpson O(h⁴); Gaussian quadrature exact for degree 2n−1 with n nodes.",
      "Gaussian elimination O(n³), use partial pivoting; κ(A) measures sensitivity.",
      "Euler O(h) global; central difference O(h²); small h can cause cancellation.",
    ],
    recap: `Numerical methods replace an exact problem with a sequence of finite computations, then control the error. Bisection trades speed for certainty; Newton trades certainty for quadratic speed; interpolation and quadrature trade smoothness assumptions for accuracy; linear solvers trade factorization cost for reuse. The exam usually asks for the order of convergence, the error formula, or the reason a method fails, so learn the assumptions behind each method rather than only the update rule.`,
    code: {
      title: "Bisection and Newton side by side",
      language: "python",
      code: `def bisection(f, a, b, steps=20): for _ in range(steps): m = (a + b) / 2 if f(a) * f(m) <= 0: b = m else: a = m return (a + b) / 2 def newton(f, df, x0, steps=10): x = x0 for _ in range(steps): x = x - f(x) / df(x) return x f = lambda x: x * x - 2
df = lambda x: 2 * x
print(bisection(f, 1, 2), newton(f, df, 1)) # both near sqrt(2)`,
      explanation:
        "Bisection needs 20 iterations to reach about six decimal places; Newton reaches similar accuracy in four or five. The comparison makes the convergence-order difference concrete.",
    },
    diagram: {
      title: "Choosing a numerical method",
      caption:
        "The problem structure determines whether a direct, iterative, or interpolation method is appropriate.",
      mermaid: `flowchart TD P[Numerical problem] --> R{Root finding?} R -->|Bracket and sign change| B[Bisection: guaranteed, linear] R -->|Smooth, good start| N[Newton: quadratic] R -->|No derivative| S[Secant: superlinear] P --> I{Integration?} I -->|Smooth| SIM[Simpson O(h^4)] I -->|Rough| TRAP[Trapezoidal O(h^2)] P --> L{Linear system?} L -->|Small/medium| GE[Gaussian elimination O(n^3)] L -->|Large sparse| IT[Jacobi / Gauss-Seidel]`,
    },
  },
  "gate-cs-engineering-mathematics-lattice-partial-orders-and-semilattices": {
    intro: `A partial order is a relation that is reflexive, antisymmetric, and transitive. It captures the idea of "less than or equal to" without requiring every pair of elements to be comparable. The divisors of 12 ordered by divisibility form a partial order: 2 ≤ 6 because 2 divides 6, but 4 and 6 are incomparable because neither divides the other. A lattice is a partial order in which every pair of elements has a least upper bound and a greatest lower bound. These two operations, join and meet, turn order theory into algebra and connect directly to Boolean logic, dataflow analysis, and type systems.`,
    foundations: `In a poset (P, ≤), a is covered by b when a < b and there is no c with a < c < b. The Hasse diagram draws each element as a point and each cover relation as an upward edge, omitting reflexive and transitive edges. An element is minimal when nothing is strictly below it and maximal when nothing is strictly above it; a least element is below every element and a greatest element is above every element. A chain is a subset in which every pair is comparable; an antichain is a subset in which no two distinct elements are comparable. The join a ∨ b is the least upper bound of a and b; the meet a ∧ b is the greatest lower bound. A lattice has both operations for every pair; a semilattice has only one. A complete lattice has joins and meets for every subset, not just finite pairs.`,
    concepts: [
      {
        title: "Posets, Hasse diagrams, and comparability",
        body: `A partial order allows incomparability, which is what distinguishes it from a total order. The subset relation on a power set is a poset: {1} ⊆ {1, 2}, but {1, 3} and {2, 4} are incomparable. The divisibility relation on positive integers is a poset: 2 | 6, but 4 and 6 are incomparable. A Hasse diagram is read bottom-up: an edge from a to b means a is covered by b, so a < b and no element lies between them. Minimal elements sit at the bottom of their component, but a poset can have several minimal elements. A finite poset always has at least one minimal and one maximal element; an infinite poset need not.`,
      },
      {
        title: "Lattices, joins, and meets",
        body: `A lattice is a poset in which every pair of elements has a join and a meet. Equivalently, it is a set with two binary operations satisfying idempotence (a ∨ a = a, a ∧ a = a), commutativity, associativity, and absorption (a ∨ (a ∧ b) = a, a ∧ (a ∨ b) = a). In the divisor lattice of 12, join is lcm and meet is gcd: 4 ∨ 6 = 12 and 4 ∧ 6 = 2. In the power set lattice, join is union and meet is intersection. A lattice is bounded when it has a least element 0 and a greatest element 1. It is complete when every subset has a join and a meet; every finite lattice is complete, but not every infinite lattice is.`,
      },
      {
        title: "Distributive and modular lattices",
        body: `A lattice is distributive when meet distributes over join and join distributes over meet: a ∧ (b ∨ c) = (a ∧ b) ∨ (a ∧ c), and the dual law. It is modular when a ≤ c implies a ∨ (b ∧ c) = (a ∨ b) ∧ c. Every distributive lattice is modular, but not conversely. The diamond M₃ and the pentagon N₅ are the two smallest non-distributive lattices; Birkhoff's theorem says a lattice is distributive exactly when it contains neither M₃ nor N₅ as a sublattice. M₃ is modular but not distributive; N₅ is not even modular. The divisor lattice of 12 is distributive because 12 has at most two prime factors with exponents arranged as a product of chains.`,
      },
      {
        title: "Boolean algebras and logic",
        body: `A Boolean algebra is a complemented distributive lattice. Every element a has a complement ¬a satisfying a ∨ ¬a = 1 and a ∧ ¬a = 0. The power set of a set, with union, intersection, and complement, is the canonical Boolean algebra. Finite Boolean algebras are isomorphic to the power set of their atoms, so their size is always 2ⁿ. Boolean expressions, truth tables, and logic gates are Boolean algebra in disguise: disjunction is join, conjunction is meet, and negation is complement. De Morgan's laws are the lattice identities (a ∨ b)′ = a′ ∧ b′ and (a ∧ b)′ = a′ ∨ b′.`,
      },
      {
        title: "Fixed points and program analysis",
        body: `A monotone function on a complete lattice has a least fixed point (Knaster–Tarski). Start with the bottom element and iterate f repeatedly; the sequence increases, and in a finite lattice it stabilizes at the least fixed point. This is the mathematical basis of dataflow analysis: the lattice elements are sets of facts, the transfer functions are monotone, and the fixed point is the analysis result. Abstract interpretation uses the same idea with an abstract lattice that over-approximates program behavior. The height of the lattice bounds the number of iterations, which is why finite lattices guarantee termination.`,
      },
    ],
    worked: [
      {
        title: "The divisor lattice of 12",
        body: `The positive divisors of 12 are 1, 2, 3, 4, 6, 12. Under divisibility, 1 is the least element and 12 is the greatest. The cover relations are 1 < 2, 1 < 3, 2 < 4, 2 < 6, 3 < 6, 4 < 12, and 6 < 12. The Hasse diagram has two paths from 1 to 12: 1-2-4-12 and 1-3-6-12, with 2-6 in between. The join of 4 and 6 is lcm(4, 6) = 12; the meet is gcd(4, 6) = 2. Every pair has a join and a meet, so it is a lattice. It is distributive because it is a product of the chains {1,2,4} and {1,3}, which correspond to the prime powers 2² and 3¹.`,
      },
      {
        title: "Checking distributivity with a counterexample",
        body: `The diamond lattice M₃ has elements 0, a, b, c, 1, with 0 below a, b, c and each of those below 1; the three middle elements are pairwise incomparable. It is modular, but it is not distributive. Take a, b, c: a ∧ (b ∨ c) = a ∧ 1 = a, while (a ∧ b) ∨ (a ∧ c) = 0 ∨ 0 = 0. Since a ≠ 0, distributivity fails. This is the standard witness that M₃ is not distributive. Any lattice containing a diamond sublattice inherits the failure.`,
      },
      {
        title: "A Boolean algebra of subsets",
        body: `Let U = {1, 2, 3} and take the power set P(U) ordered by inclusion. Join is union, meet is intersection, and complement is U \\ A. The bottom is ∅ and the top is U. The atoms are {1}, {2}, {3}, and every subset is a join of atoms: {1, 2} = {1} ∨ {2}. There are 2³ = 8 elements, matching the 2ⁿ formula. The lattice is distributive because union distributes over intersection, and complemented because every set has a complement. This is the Boolean algebra behind three-variable truth tables.`,
      },
    ],
    exam: [
      {
        question: `Is the set of divisors of 18 under divisibility a lattice? Is it distributive?`,
        answer: `The divisors are 1, 2, 3, 6, 9, 18. For any two divisors, the join is their lcm and the meet is their gcd, both of which are divisors of 18, so it is a lattice. Since 18 = 2 · 3², the divisor lattice is the product of chains of lengths 2 and 3, hence distributive. It is not a Boolean algebra because 18 has a squared prime factor; the divisor lattice of a square-free number is Boolean.`,
      },
      {
        question: `In a lattice, prove that a ∨ (a ∧ b) = a.`,
        answer: `Since a ∧ b ≤ a, the element a is an upper bound of a and a ∧ b. The join a ∨ (a ∧ b) is the least upper bound, so a ∨ (a ∧ b) ≤ a. On the other hand, a ≤ a ∨ (a ∧ b) because join is an upper bound. Antisymmetry gives equality. This is the absorption law, and its dual a ∧ (a ∨ b) = a follows by the same argument with the order reversed.`,
      },
      {
        question: `How many elements does a finite Boolean algebra have?`,
        answer: `Every finite Boolean algebra is isomorphic to the power set of its set of atoms. If there are k atoms, the algebra has 2^k elements. Therefore every finite Boolean algebra has size a power of 2. The divisor lattice of a square-free number with k prime factors is Boolean and has 2^k elements; the divisor lattice of 12 = 2² · 3 has 6 elements and is distributive but not Boolean.`,
      },
      {
        question: `What is the least fixed point of f(S) = S ∪ {1} on the power set of {1, 2}?`,
        answer: `Start with the bottom element ∅. f(∅) = {1}; f({1}) = {1}; the sequence stabilizes at {1}. The least fixed point is {1}. The greatest fixed point is the top element {1, 2}, since f({1, 2}) = {1, 2}. Knaster–Tarski guarantees both exist for a monotone function on a complete lattice; the least fixed point is reached by iterating from bottom.`,
      },
    ],
    cheat: [
      "Partial order: reflexive, antisymmetric, transitive; incomparable pairs are allowed.",
      "Hasse diagram: cover relations only; read bottom to top; omit reflexive and transitive edges.",
      "Lattice: every pair has a join (least upper bound) and meet (greatest lower bound).",
      "Distributive: a∧(b∨c) = (a∧b)∨(a∧c). Modular: a≤c ⇒ a∨(b∧c) = (a∨b)∧c.",
      "Birkhoff: distributive ⇔ no M₃ or N₅ sublattice. M₃ is modular but not distributive; N₅ is neither.",
      "Boolean algebra = complemented distributive lattice; finite size 2^k; atoms generate everything.",
      "Knaster–Tarski: monotone f on a complete lattice has a least fixed point, reached by iterating from bottom.",
      "Divisor lattice: join = lcm, meet = gcd; square-free n gives a Boolean algebra.",
    ],
    recap: `Partial orders describe hierarchy without forcing total comparison. Lattices add the ability to combine and intersect information, and distributive lattices add the familiar algebra of union and intersection. Boolean algebras are the special case that powers logic and set theory. The fixed-point theorem is the bridge from order theory to program analysis: monotone transfer functions on a finite lattice always settle.`,
    code: {
      title: "Build a divisor lattice and check joins and meets",
      language: "python",
      code: `from math import gcd def divisors(n): return [d for d in range(1, n + 1) if n % d == 0] def lcm(a, b): return a * b // gcd(a, b) n = 12
D = divisors(n)
for a in D: for b in D: join = lcm(a, b) meet = gcd(a, b) assert join in D and meet in D
print(D)
print("join(4,6) =", lcm(4, 6), "meet(4,6) =", gcd(4, 6))
# [1, 2, 3, 4, 6, 12]
# join(4,6) = 12 meet(4,6) = 2`,
      explanation:
        "Closure under lcm and gcd is exactly the lattice property for the divisibility order. The script checks every pair, which is a useful way to verify a candidate lattice before drawing its Hasse diagram.",
    },
    diagram: {
      title: "The divisor lattice of 12",
      caption:
        "Join is lcm and meet is gcd; the diagram is a product of two chains.",
      mermaid: `flowchart TD One[1] --> Two[2] One --> Three[3] Two --> Four[4] Two --> Six[6] Three --> Six Four --> Twelve[12] Six --> Twelve`,
    },
  },
  "gate-cs-engineering-mathematics-eigenvalues-and-diagonalization": {
    intro: `An eigenvector of a square matrix A is a nonzero vector v that A merely scales: Av = λv for some scalar λ, the eigenvalue. The direction of v is preserved; only its length changes, and possibly its sign. Eigenvalues reveal how a transformation stretches, compresses, or reflects space, and diagonalization turns repeated application of A into independent scalar multiplications. They are central to Markov chains, differential equations, principal component analysis, and stability analysis.`,
    foundations: `The eigenvalues of A are the roots of the characteristic polynomial det(A − λI) = 0. For an n × n matrix, this polynomial has degree n, so there are n eigenvalues counted with algebraic multiplicity over the complex numbers. The eigenspace for λ is N(A − λI), and its dimension is the geometric multiplicity. The algebraic multiplicity is at least the geometric multiplicity. The trace of A equals the sum of the eigenvalues, and the determinant equals their product. A matrix is diagonalizable when A = PDP⁻¹ for a diagonal D; the columns of P are eigenvectors and the diagonal entries of D are the corresponding eigenvalues.`,
    concepts: [
      {
        title: "Finding eigenvalues and eigenvectors",
        body: `To find the eigenvalues, solve det(A − λI) = 0. For each eigenvalue λ, solve the homogeneous system (A − λI)v = 0 to find the eigenvectors. The zero vector is excluded by definition, so the eigenspace is the null space of A − λI minus the zero vector, plus the zero vector for the subspace. For a 2 × 2 matrix [[a, b], [c, d]], the characteristic polynomial is λ² − (a + d)λ + (ad − bc), so the trace and determinant appear directly. Always check an eigenvector by multiplying it back through A; arithmetic slips in the characteristic polynomial are common.`,
      },
      {
        title: "Multiplicities and diagonalizability",
        body: `The algebraic multiplicity of λ is the number of times it appears as a root of the characteristic polynomial. The geometric multiplicity is the dimension of its eigenspace. A matrix is diagonalizable exactly when the geometric multiplicity equals the algebraic multiplicity for every eigenvalue, equivalently when there are n linearly independent eigenvectors. Distinct eigenvalues always have independent eigenvectors, so a matrix with n distinct eigenvalues is automatically diagonalizable. A defective matrix has a repeated eigenvalue with too few eigenvectors; its Jordan form has off-diagonal 1s instead of a diagonal.`,
      },
      {
        title: "Similarity and change of basis",
        body: `Two matrices A and B are similar when B = P⁻¹AP for some invertible P. Similar matrices represent the same linear transformation in different bases, so they share eigenvalues, determinant, trace, rank, and characteristic polynomial. Diagonalization is the special case where the similar matrix is diagonal. The columns of P are the eigenvectors of A, and D contains the eigenvalues in the same order. If A is diagonalizable, then A^k = PD^kP⁻¹, which makes powers and matrix exponentials easy to compute.`,
      },
      {
        title: "Symmetric matrices and orthogonal diagonalization",
        body: `A real symmetric matrix has real eigenvalues and an orthonormal basis of eigenvectors. Therefore it can be written A = QΛQᵀ with Q orthogonal and Λ diagonal. This is the spectral theorem. Symmetric positive definite matrices have all eigenvalues positive; positive semidefinite matrices have nonnegative eigenvalues. The quadratic form xᵀAx is positive for every nonzero x exactly when A is positive definite. The eigenvalues of a symmetric matrix are the extrema of the Rayleigh quotient xᵀAx/xᵀx over unit vectors, which is why the largest eigenvalue is the maximum stretching factor.`,
      },
      {
        title: "Applications: Markov chains, powers, and PCA",
        body: `A stochastic matrix has nonnegative entries and columns (or rows, depending on convention) summing to 1. Its largest eigenvalue is 1, and the corresponding eigenvector is the stationary distribution of the Markov chain. Power iteration repeatedly multiplies a vector by A; if the dominant eigenvalue is unique in magnitude, the vector converges to the dominant eigenvector. In principal component analysis, the covariance matrix is symmetric positive semidefinite; its eigenvectors are the principal directions and its eigenvalues are the variances along those directions. In differential equations, eigenvalues determine stability: negative real parts decay, positive real parts grow, and imaginary parts oscillate.`,
      },
      {
        title: "Jordan form and defective matrices",
        body: `Not every matrix is diagonalizable, but every complex matrix is similar to a Jordan matrix, which is block diagonal with eigenvalues on the diagonal and 1s on the superdiagonal within each block. A Jordan block of size k for λ has λ on the diagonal, 1 on the superdiagonal, and zeros elsewhere. The number of Jordan blocks for λ equals the geometric multiplicity, and the largest block size equals the index of the eigenvalue. The Jordan form exists over the complex numbers; over the reals, a real matrix may need 2 × 2 rotation blocks for complex eigenvalues.`,
      },
    ],
    worked: [
      {
        title: "A 2 × 2 matrix with distinct eigenvalues",
        body: `Let A = [[4, 1], [2, 3]]. The trace is 7 and the determinant is 12 − 2 = 10, so the characteristic polynomial is λ² − 7λ + 10 = (λ − 2)(λ − 5). The eigenvalues are 2 and 5. For λ = 2, solve (A − 2I)v = 0: [[2, 1], [2, 1]]v = 0, so 2v₁ + v₂ = 0 and v = (1, −2) is an eigenvector. For λ = 5, [[−1, 1], [2, −2]]v = 0, so v₁ = v₂ and v = (1, 1) is an eigenvector. The two eigenvectors are independent, so A = P diag(2, 5) P⁻¹ with P = [[1, 1], [−2, 1]].`,
      },
      {
        title: "A defective matrix",
        body: `Let A = [[1, 1], [0, 1]]. The characteristic polynomial is (1 − λ)², so λ = 1 has algebraic multiplicity 2. Solve (A − I)v = 0: [[0, 1], [0, 0]]v = 0, so v₂ = 0 and the only eigenvectors are multiples of (1, 0). The geometric multiplicity is 1, less than the algebraic multiplicity 2, so A is not diagonalizable. Its Jordan form is [[1, 1], [0, 1]], a single 2 × 2 Jordan block.`,
      },
      {
        title: "A Markov chain steady state",
        body: `Let P = [[0.8, 0.3], [0.2, 0.7]] be a column-stochastic transition matrix. The eigenvalues solve λ² − 1.5λ + 0.5 = 0, so λ = 1 and λ = 0.5. For λ = 1, solve (P − I)v = 0: [[−0.2, 0.3], [0.2, −0.3]]v = 0, so 2v₁ = 3v₂ and v = (3, 2). Normalize to sum to 1: (0.6, 0.4). The stationary distribution is 60% in state 1 and 40% in state 2. The second eigenvalue 0.5 controls the rate of convergence to the steady state.`,
      },
    ],
    exam: [
      {
        question: `A 3 × 3 matrix has eigenvalues 2, 2, and 5. What are its trace and determinant?`,
        answer: `The trace is the sum of the eigenvalues: 2 + 2 + 5 = 9. The determinant is the product: 2 · 2 · 5 = 20. These identities hold for every square matrix, counting algebraic multiplicity, and they provide a quick check on a characteristic polynomial.`,
      },
      {
        question: `Is every matrix with distinct eigenvalues diagonalizable?`,
        answer: `Yes. Eigenvectors corresponding to distinct eigenvalues are linearly independent. An n × n matrix with n distinct eigenvalues therefore has n independent eigenvectors, which form a basis. The matrix is diagonalizable with those eigenvectors as the columns of P. The converse is false: a matrix with repeated eigenvalues can still be diagonalizable if each eigenspace has full geometric multiplicity.`,
      },
      {
        question: `Can a real matrix have a complex eigenvalue?`,
        answer: `Yes. The matrix [[0, −1], [1, 0]] represents a 90-degree rotation and has characteristic polynomial λ² + 1, with eigenvalues i and −i. Since the matrix has real entries, complex eigenvalues occur in conjugate pairs. The corresponding eigenvectors are complex, and the real matrix cannot be diagonalized over the reals, but it can be block-diagonalized with 2 × 2 rotation blocks.`,
      },
      {
        question: `What is the dominant eigenvalue of a stochastic matrix, and why?`,
        answer: `A stochastic matrix has eigenvalue 1. The Perron–Frobenius theorem says that for an irreducible nonnegative matrix, the spectral radius equals the largest eigenvalue and is positive; for a stochastic matrix, the spectral radius is 1. The eigenvector for eigenvalue 1 is the stationary distribution. Other eigenvalues have magnitude at most 1, and if they are strictly smaller, power iteration converges to the stationary distribution.`,
      },
    ],
    cheat: [
      "Eigenvalues solve det(A − λI) = 0; eigenvectors solve (A − λI)v = 0, v ≠ 0.",
      "Trace = sum of eigenvalues; determinant = product of eigenvalues (with multiplicity).",
      "Algebraic multiplicity ≥ geometric multiplicity; diagonalizable iff they are equal for every eigenvalue.",
      "n distinct eigenvalues ⇒ diagonalizable. Symmetric real ⇒ orthogonally diagonalizable.",
      "A = PDP⁻¹ ⇒ A^k = PD^kP⁻¹. Similar matrices share eigenvalues, determinant, trace, rank.",
      "Symmetric positive definite ⇔ all eigenvalues > 0; positive semidefinite ⇔ all ≥ 0.",
      "Stochastic matrix: eigenvalue 1, stationary eigenvector; second eigenvalue controls convergence.",
      "Power iteration converges to the dominant eigenvector when the largest eigenvalue is unique in magnitude.",
    ],
    recap: `Eigenvalues are the invariant scaling factors of a linear transformation, and eigenvectors are the directions that survive without rotating. The characteristic polynomial finds the eigenvalues; the eigenspaces determine whether the matrix can be diagonalized. Symmetric matrices are the best case: real eigenvalues and an orthogonal eigenbasis. Markov chains, PCA, stability, and iterative methods all reduce to finding the dominant or stationary eigenvector.`,
    code: {
      title: "Power iteration for the dominant eigenvector",
      language: "python",
      code: `def power_iteration(A, steps=100): n = len(A) v = [1.0 / n] * n for _ in range(steps): w = [sum(A[i][j] * v[j] for j in range(n)) for i in range(n)] norm = max(abs(x) for x in w) or 1 v = [x / norm for x in w] eigenvalue = sum((A[i][j] * v[j]) for i in range(n) for j in range(n)) / sum(v[j] ** 2 for j in range(n)) return eigenvalue, v A = [[4, 1], [2, 3]]
print(power_iteration(A)) # approaches eigenvalue 5 and eigenvector (1, 1)`,
      explanation:
        "Power iteration repeatedly applies A and rescales. The component along the dominant eigenvector grows fastest, so the direction converges to that eigenvector. The Rayleigh quotient then recovers the eigenvalue.",
    },
    diagram: {
      title: "Eigenvalue decision flow",
      caption: "Multiplicities determine whether a matrix is diagonalizable.",
      mermaid: `flowchart TD A[Matrix A] --> C[Characteristic polynomial] C --> E[Eigenvalues] E --> G[Eigenspaces: geometric multiplicities] G --> Q{Geometric = algebraic for all?} Q -->|Yes| D[Diagonalizable: A = PDP^-1] Q -->|No| J[Defective: Jordan form] D --> S{Symmetric?} S -->|Yes| O[Orthogonal: A = QΛQ^T] S -->|No| P[General similarity]`,
    },
  },
  "gate-cs-engineering-mathematics-random-variables-and-distributions": {
    intro: `A random variable turns the outcomes of an experiment into numbers. If Ω is the sample space, a random variable X is a function X : Ω → ℝ. The distribution of X describes how probability is spread across those numbers. A discrete random variable has a probability mass function p(x) = P(X = x), and a continuous random variable has a probability density function f(x) such that P(a ≤ X ≤ b) = ∫ₐᵇ f(x) dx. The cumulative distribution function F(x) = P(X ≤ x) works for both and is often the cleanest object to manipulate.`,
    foundations: `For a discrete variable, Σ p(x) = 1 and p(x) ≥ 0. For a continuous variable, ∫ f(x) dx = 1 and f(x) ≥ 0, but f(x) is not itself a probability; only integrals over intervals are probabilities. The CDF is nondecreasing, right-continuous, goes from 0 to 1, and satisfies P(a < X ≤ b) = F(b) − F(a). The expectation of g(X) is Σ g(x)p(x) or ∫ g(x)f(x) dx; this is sometimes called the law of the unconscious statistician. Variance is E[(X − μ)²] = E[X²] − μ². The moment generating function M_X(t) = E[e^{tX}] encodes all moments when it exists in a neighborhood of zero.`,
    concepts: [
      {
        title: "Mass, density, and the CDF",
        body: `A discrete distribution assigns positive probability to individual points. A continuous distribution assigns probability zero to every individual point, so P(X = a) = 0 even though X can equal a; probability lives in intervals. The density f is the derivative of the CDF at points where the derivative exists. A mixed distribution has both a discrete part and a continuous part, and its CDF has jumps plus a smooth component. When a problem gives a CDF, differentiate it to get the density on the continuous pieces and read the jumps as point masses. Always check that the total probability integrates or sums to 1.`,
      },
      {
        title: "Expectation, variance, and moments",
        body: `Expectation is a weighted average: each value is weighted by its probability or density. It is linear regardless of dependence: E[aX + bY] = aE[X] + bE[Y]. Variance measures squared spread around the mean: Var(aX + b) = a²Var(X). The standard deviation is the square root of the variance and has the same units as X. The k-th moment is E[X^k]; the k-th central moment is E[(X − μ)^k]. Skewness standardizes the third central moment, and kurtosis standardizes the fourth. The moment generating function, when it exists, uniquely determines the distribution and makes sums of independent variables easy: M_{X+Y}(t) = M_X(t)M_Y(t).`,
      },
      {
        title: "Discrete distributions",
        body: `Bernoulli(p) is a single yes/no trial, with mean p and variance p(1 − p). Binomial(n, p) counts successes in n independent Bernoulli trials, with mean np and variance np(1 − p); its PMF is C(n, k)p^k(1 − p)^{n−k}. Geometric(p) counts trials until the first success, with mean 1/p and variance (1 − p)/p²; it is memoryless in the discrete sense that P(X > m + n | X > m) = P(X > n). Negative binomial(r, p) counts trials until the r-th success, with mean r/p. Poisson(λ) counts events in a fixed interval, with mean and variance λ; it is the limit of Binomial(n, λ/n) as n grows. Hypergeometric models sampling without replacement from a finite population, with mean nK/N and variance n(K/N)(1 − K/N)(N − n)/(N − 1).`,
      },
      {
        title: "Continuous distributions",
        body: `Uniform(a, b) has constant density 1/(b − a), mean (a + b)/2, and variance (b − a)²/12. Exponential(λ) has density λe^{−λx} for x ≥ 0, mean 1/λ, variance 1/λ², and is memoryless: P(X > s + t | X > s) = P(X > t). Normal(μ, σ²) has the bell-shaped density; standardizing Z = (X − μ)/σ gives the standard normal, and about 68% of the mass lies within one standard deviation, 95% within two, and 99.7% within three. Gamma generalizes the exponential and models sums of waiting times. Beta is a flexible distribution on [0, 1], often used for probabilities and proportions.`,
      },
      {
        title: "Joint distributions and independence",
        body: `For two random variables, the joint CDF is F(x, y) = P(X ≤ x, Y ≤ y). In the discrete case, the joint PMF is p(x, y) = P(X = x, Y = y); in the continuous case, the joint density f(x, y) integrates over regions to give probabilities. The marginal distributions are obtained by summing or integrating out the other variable. X and Y are independent when the joint distribution factors: p(x, y) = p_X(x)p_Y(y) or f(x, y) = f_X(x)f_Y(y). Independence implies Cov(X, Y) = 0, but zero covariance does not imply independence in general; the converse holds for jointly normal variables. Conditional expectation E[Y | X = x] is a function of x, and the law of total expectation says E[Y] = E[E[Y | X]].`,
      },
      {
        title: "Transformations and sums",
        body: `If Y = g(X) and g is one-to-one, the density of Y is f_X(g⁻¹(y)) |d/dy g⁻¹(y)|. The absolute value of the derivative is the Jacobian factor that preserves total probability. For sums of independent variables, the distribution of X + Y is the convolution of their distributions: the PMF is Σ p_X(k)p_Y(n − k), and the density is ∫ f_X(t)f_Y(z − t) dt. Poisson variables add: Poisson(λ₁) + Poisson(λ₂) = Poisson(λ₁ + λ₂). Binomials with the same p add their trial counts. Normal variables add means and variances. The central limit theorem then explains why sums of many small independent effects are approximately normal.`,
      },
    ],
    worked: [
      {
        title: "A binomial probability",
        body: `A multiple-choice test has 10 questions, each with 4 options, and a student guesses independently. Let X be the number correct. Then X ~ Binomial(10, 0.25). The probability of exactly 3 correct is C(10, 3)(0.25)³(0.75)⁷ = 120 · 0.015625 · 0.1334839 ≈ 0.2503. The mean is 2.5 and the variance is 10 · 0.25 · 0.75 = 1.875. The probability of at least 8 correct is tiny: C(10,8)(0.25)⁸(0.75)² + C(10,9)(0.25)⁹(0.75) + (0.25)¹⁰ ≈ 0.000416. Guessing is not a strategy.`,
      },
      {
        title: "Poisson approximation",
        body: `A call center receives an average of 3 calls per minute. Model the count as Poisson(3). The probability of exactly 5 calls is e^{−3}3⁵/5! ≈ 0.1008. The probability of at most 2 calls is e^{−3}(1 + 3 + 4.5) ≈ 0.4232. If the rate were 3 per minute and we looked at a 2-minute interval, the count would be Poisson(6). The Poisson model assumes independent events with a constant rate; clustering or a varying rate violates the assumption. For a binomial with large n and small p, Poisson(np) is a good approximation.`,
      },
      {
        title: "Exponential memorylessness",
        body: `The lifetime of a component is exponential with mean 5 years, so λ = 1/5. The probability it lasts more than 8 years is e^{−8/5} ≈ 0.2019. Given that it has already lasted 3 years, the probability it lasts at least 5 more years is P(X > 8 | X > 3) = e^{−8/5}/e^{−3/5} = e^{−1} ≈ 0.3679, which equals P(X > 5). The component does not age in this model; the remaining lifetime distribution is the same regardless of how long it has survived.`,
      },
      {
        title: "Standardizing a normal variable",
        body: `Suppose X ~ Normal(70, 10²). Find P(60 ≤ X ≤ 85). Standardize: z₁ = (60 − 70)/10 = −1 and z₂ = (85 − 70)/10 = 1.5. The probability is Φ(1.5) − Φ(−1) = 0.9332 − 0.1587 = 0.7745. The interval is not symmetric around the mean, so the two tail probabilities must be looked up separately. For P(X > 90), z = 2 and the upper tail is 1 − Φ(2) ≈ 0.0228.`,
      },
    ],
    exam: [
      {
        question: `X is uniform on [0, 10]. Find E[X], Var(X), and P(X < 3).`,
        answer: `For Uniform(0, 10), the mean is 5 and the variance is (10 − 0)²/12 = 100/12 ≈ 8.33. The density is 1/10 on [0, 10], so P(X < 3) = 3/10 = 0.3. The CDF is F(x) = x/10 for 0 ≤ x ≤ 10, which gives the same answer directly.`,
      },
      {
        question: `If X ~ Poisson(4), find P(X = 0), P(X ≥ 2), and Var(X).`,
        answer: `P(X = 0) = e^{−4} ≈ 0.0183. P(X ≥ 2) = 1 − P(X = 0) − P(X = 1) = 1 − e^{−4}(1 + 4) ≈ 1 − 0.0916 = 0.9084. The variance of Poisson(4) is 4, equal to its mean.`,
      },
      {
        question: `Two independent random variables have Var(X) = 3 and Var(Y) = 5. Find Var(2X − Y + 4).`,
        answer: `Use Var(aX + bY + c) = a²Var(X) + b²Var(Y) + 2abCov(X, Y). Independence makes Cov(X, Y) = 0. Therefore Var(2X − Y + 4) = 4 · 3 + (−1)² · 5 = 12 + 5 = 17. The constant 4 does not affect variance.`,
      },
      {
        question: `A geometric random variable has p = 0.2. What is the probability that the first success occurs on the third trial?`,
        answer: `P(X = 3) = (1 − p)²p = 0.8² · 0.2 = 0.128. The mean is 1/p = 5 trials, and the variance is (1 − p)/p² = 0.8/0.04 = 20. The geometric distribution is memoryless, so after two failures the expected additional trials is still 5.`,
      },
    ],
    cheat: [
      "PMF sums to 1; PDF integrates to 1; F(x) = P(X ≤ x), and P(a < X ≤ b) = F(b) − F(a).",
      "E[g(X)] = Σg(x)p(x) or ∫g(x)f(x)dx; Var(X) = E[X²] − (E[X])².",
      "Bernoulli(p): mean p, variance p(1−p). Binomial(n,p): np, np(1−p).",
      "Geometric(p): mean 1/p, variance (1−p)/p²; memoryless. Poisson(λ): mean λ, variance λ.",
      "Uniform(a,b): mean (a+b)/2, variance (b−a)²/12. Exponential(λ): mean 1/λ, variance 1/λ².",
      "Normal(μ,σ²): standardize z = (x−μ)/σ; 68–95–99.7 rule.",
      "Independent sums: Poissons add; binomials with same p add n; normals add means and variances.",
      "Cov(X,Y) = E[XY] − E[X]E[Y]; independence ⇒ covariance 0, but not conversely.",
    ],
    recap: `Random variables convert outcomes into numbers, and distributions describe the probability of those numbers. Discrete variables use sums; continuous variables use integrals. Expectation and variance summarize location and spread, while the standard families provide ready-made models for counts, waiting times, and measurement error. Joint distributions and convolutions extend the toolkit to several variables, and the normal distribution reappears through the central limit theorem.`,
    code: {
      title: "Simulate distributions and compare sample moments",
      language: "python",
      code: `import random, statistics def binomial(n, p): return sum(random.random() < p for _ in range(n)) def poisson(lam): # Knuth's algorithm import math L, k, prod = math.exp(-lam), 0, 1.0 while True: prod *= random.random() if prod <= L: return k k += 1 b = [binomial(10, 0.25) for _ in range(100000)]
p = [poisson(3) for _ in range(100000)]
print(round(statistics.mean(b), 3), round(statistics.pvariance(b), 3)) # 2.5, 1.875
print(round(statistics.mean(p), 3), round(statistics.pvariance(p), 3)) # 3, 3`,
      explanation:
        "The sample means and variances converge to the theoretical values. Simulation is a check on intuition, not a substitute for the formulas, but it is useful for seeing the shape of a distribution before calculating a tail probability.",
    },
    diagram: {
      title: "Choosing a distribution",
      caption:
        "The data type and the experiment structure point to the right family.",
      mermaid: `flowchart TD Q[Random variable] --> D{Discrete or continuous?} D -->|Discrete| C{What is counted?} C -->|Successes in n trials| B[Binomial] C -->|Trials until first success| G[Geometric] C -->|Events in an interval| P[Poisson] C -->|Sample without replacement| H[Hypergeometric] D -->|Continuous| W{What is measured?} W -->|Waiting time| E[Exponential] W -->|Symmetric measurement error| N[Normal] W -->|Proportion in [0,1]| BE[Beta]`,
    },
  },
  "gate-cs-engineering-mathematics-recurrence-relations-and-generating-functions":
    {
      intro: `A recurrence relation defines each term of a sequence using earlier terms. The Fibonacci sequence Fₙ = Fₙ₋₁ + Fₙ₋₂ with F₀ = 0 and F₁ = 1 is the canonical example. Recurrences describe the running time of divide-and-conquer algorithms, the number of combinatorial objects of a given size, and the state of a system that evolves in discrete steps. Solving a recurrence means finding a closed form, an asymptotic bound, or both.`,
      foundations: `A linear recurrence has the form aₙ = c₁aₙ₋₁ + c₂aₙ₋₂ + ... + cₖaₙ₋ₖ + f(n). It is homogeneous when f(n) = 0 and has constant coefficients when the cᵢ do not depend on n. The order is k, the number of previous terms used. The characteristic equation of a homogeneous constant-coefficient recurrence is rᵏ − c₁rᵏ⁻¹ − ... − cₖ = 0. If the roots are distinct, the general solution is a linear combination of rᵢⁿ. If a root r is repeated m times, the corresponding terms are rⁿ, nrⁿ, ..., nᵐ⁻¹rⁿ. A nonhomogeneous recurrence needs a particular solution in addition to the homogeneous solution; the particular solution is guessed from the form of f(n).`,
      concepts: [
        {
          title: "First-order recurrences and iteration",
          body: `A first-order linear recurrence has the form aₙ = r aₙ₋₁ + d. Iterating gives aₙ = rⁿa₀ + d(1 + r + ... + rⁿ⁻¹). When r ≠ 1, the sum is d(rⁿ − 1)/(r − 1); when r = 1, it is dn. The fixed point is a* = d/(1 − r) when r ≠ 1, and the solution can be written aₙ = a* + (a₀ − a*)rⁿ. Compound interest, population growth with immigration, and the number of nodes in a branching process all fit this pattern. The key question is whether |r| < 1 (converges to the fixed point), |r| > 1 (grows exponentially), or |r| = 1 (linear or constant).`,
        },
        {
          title: "Homogeneous second-order recurrences",
          body: `For aₙ = c₁aₙ₋₁ + c₂aₙ₋₂, solve r² − c₁r − c₂ = 0. If the roots r₁ and r₂ are distinct, aₙ = A r₁ⁿ + B r₂ⁿ, with A and B determined by the initial conditions. If the roots are equal, aₙ = (A + Bn)rⁿ. The Fibonacci recurrence has characteristic equation r² − r − 1 = 0, with roots φ = (1 + √5)/2 and ψ = (1 − √5)/2. The initial conditions F₀ = 0 and F₁ = 1 give Binet's formula Fₙ = (φⁿ − ψⁿ)/√5. Since |ψ| < 1, Fₙ is the nearest integer to φⁿ/√5 for large n.`,
        },
        {
          title: "Nonhomogeneous recurrences",
          body: `For aₙ − c₁aₙ₋₁ − ... − cₖaₙ₋ₖ = f(n), first solve the homogeneous recurrence, then find one particular solution. If f(n) is a polynomial of degree d, guess a polynomial of degree d; if f(n) is an exponential cⁿ, guess a constant times cⁿ, unless c is already a root of the characteristic equation, in which case multiply by n (or nᵐ for a root of multiplicity m). The general solution is the homogeneous solution plus the particular solution. Initial conditions determine the constants. For example, aₙ − 3aₙ₋₁ = 2ⁿ has homogeneous solution A3ⁿ and particular solution D2ⁿ; substituting gives D = −2, so aₙ = A3ⁿ − 2^{n+1}.`,
        },
        {
          title: "Generating functions",
          body: `The ordinary generating function of a sequence aₙ is A(x) = Σ aₙxⁿ. It turns a recurrence into an algebraic equation. The shift rule says Σ aₙ₊₁xⁿ = (A(x) − a₀)/x, and the convolution rule says the product of two generating functions corresponds to the convolution of their coefficients. For Fibonacci, F(x) = Σ Fₙxⁿ satisfies F(x) = x + xF(x) + x²F(x), so F(x) = x/(1 − x − x²). Partial fractions recover Binet's formula. Generating functions are especially powerful for combinatorial recurrences because multiplication of generating functions corresponds to choosing how to split a structure.`,
        },
        {
          title: "Catalan numbers",
          body: `The Catalan numbers satisfy C₀ = 1 and Cₙ = Σ_{i=0}^{n−1} CᵢCₙ₋₁₋ᵢ for n ≥ 1. The generating function C(x) = Σ Cₙxⁿ satisfies C(x) = 1 + xC(x)². Solving the quadratic and choosing the branch that is finite at 0 gives C(x) = (1 − √(1 − 4x))/(2x). Expanding the square root gives Cₙ = C(2n, n)/(n + 1). Catalan numbers count balanced parenthesis strings, full binary trees with n internal nodes, Dyck paths that never go below the axis, and triangulations of a convex (n + 2)-gon. Recognizing the convolution recurrence is usually the key step.`,
        },
        {
          title: "Divide-and-conquer recurrences",
          body: `Recurrences of the form T(n) = aT(n/b) + f(n) describe algorithms that split a problem into a subproblems of size n/b and spend f(n) combining the results. The Master theorem compares f(n) with n^{log_b a}. If f(n) = O(n^{log_b a − ε}) for some ε > 0, then T(n) = Θ(n^{log_b a}). If f(n) = Θ(n^{log_b a}), then T(n) = Θ(n^{log_b a} log n). If f(n) = Ω(n^{log_b a + ε}) and the regularity condition af(n/b) ≤ cf(n) holds for some c < 1, then T(n) = Θ(f(n)). Merge sort has a = 2, b = 2, f(n) = n, so T(n) = Θ(n log n). Binary search has a = 1, b = 2, f(n) = 1, so T(n) = Θ(log n).`,
        },
      ],
      worked: [
        {
          title: "Solving a second-order recurrence",
          body: `Solve aₙ = 5aₙ₋₁ − 6aₙ₋₂ with a₀ = 1 and a₁ = 2. The characteristic equation is r² − 5r + 6 = 0, with roots r = 2 and r = 3. The general solution is aₙ = A2ⁿ + B3ⁿ. Using the initial conditions: A + B = 1 and 2A + 3B = 2. Subtract twice the first equation from the second: B = 0, so A = 1. Therefore aₙ = 2ⁿ. The sequence is 1, 2, 4, 8, ..., which indeed satisfies the recurrence.`,
        },
        {
          title: "A nonhomogeneous recurrence",
          body: `Solve aₙ = 3aₙ₋₁ + 2ⁿ with a₀ = 1. The homogeneous solution is A3ⁿ. Since 2 is not a root of the homogeneous characteristic equation, guess a particular solution D2ⁿ. Substitute: D2ⁿ = 3D2ⁿ⁻¹ + 2ⁿ. Divide by 2ⁿ⁻¹: 2D = 3D + 2, so D = −2. The general solution is aₙ = A3ⁿ − 2^{n+1}. Using a₀ = 1: A − 2 = 1, so A = 3. Therefore aₙ = 3^{n+1} − 2^{n+1}. Check n = 1: 9 − 4 = 5, and 3 · 1 + 2 = 5.`,
        },
        {
          title: "Merge sort recurrence",
          body: `Merge sort splits an array of n elements into two halves, sorts each recursively, and merges them in linear time. The recurrence is T(n) = 2T(n/2) + n, with T(1) = 1. Here a = 2, b = 2, so n^{log_b a} = n. Since f(n) = n = Θ(n^{log_b a}), the Master theorem gives T(n) = Θ(n log n). A recursion tree shows log n levels, each costing n, for a total of n log n. The same result follows by unrolling: T(n) = 2T(n/2) + n = 4T(n/4) + 2n = ... = nT(1) + n log n.`,
        },
        {
          title: "Counting balanced parentheses",
          body: `The number of balanced parenthesis strings with n pairs is the Catalan number Cₙ. For n = 3, the five strings are ((())), (()()), (())(), ()(()), and ()()(). The recurrence Cₙ = Σ CᵢCₙ₋₁₋ᵢ comes from splitting at the first return to zero: the string is a balanced prefix wrapped around a balanced remainder. The closed form is Cₙ = C(2n, n)/(n + 1). For n = 3, C(6, 3)/4 = 20/4 = 5.`,
        },
      ],
      exam: [
        {
          question: `Solve T(n) = 4T(n/2) + n with T(1) = 1.`,
          answer: `Here a = 4, b = 2, so n^{log_b a} = n². The forcing function f(n) = n is polynomially smaller than n², so the Master theorem's first case applies: T(n) = Θ(n²). Intuitively, the number of leaves is 4^{log₂ n} = n², and the work at the leaves dominates the linear merge cost at each level.`,
        },
        {
          question: `Find the generating function for the sequence 1, 1, 1, 1, ... and use it to sum the series.`,
          answer: `The generating function is A(x) = Σ_{n≥0} xⁿ = 1/(1 − x) for |x| < 1. This is the geometric series. Differentiating gives Σ n x^{n−1} = 1/(1 − x)², so Σ n xⁿ = x/(1 − x)². These identities are the basic building blocks for solving recurrences with generating functions.`,
        },
        {
          question: `What is the closed form of the Fibonacci recurrence Fₙ = Fₙ₋₁ + Fₙ₋₂ with F₀ = 0, F₁ = 1?`,
          answer: `The characteristic roots are φ = (1 + √5)/2 and ψ = (1 − √5)/2. The general solution is Fₙ = Aφⁿ + Bψⁿ. Initial conditions give A = 1/√5 and B = −1/√5, so Fₙ = (φⁿ − ψⁿ)/√5. Since |ψ| < 1, the second term vanishes, and Fₙ is the nearest integer to φⁿ/√5.`,
        },
        {
          question: `How many full binary trees are there with 4 internal nodes?`,
          answer: `The number of full binary trees with n internal nodes is the Catalan number Cₙ. For n = 4, C₄ = C(8, 4)/5 = 70/5 = 14. The recurrence Cₙ = Σ CᵢCₙ₋₁₋ᵢ splits the tree at the root into a left subtree with i internal nodes and a right subtree with n − 1 − i internal nodes.`,
        },
      ],
      cheat: [
        "First order aₙ = raₙ₋₁ + d: aₙ = rⁿa₀ + d(rⁿ−1)/(r−1) for r ≠ 1; aₙ = a₀ + dn for r = 1.",
        "Homogeneous second order: solve r² − c₁r − c₂ = 0; distinct roots A r₁ⁿ + B r₂ⁿ; repeated (A + Bn)rⁿ.",
        "Fibonacci: Fₙ = (φⁿ − ψⁿ)/√5, φ = (1+√5)/2, ψ = (1−√5)/2.",
        "Nonhomogeneous: general = homogeneous + particular; multiply guess by n on resonance.",
        "Generating function: A(x) = Σaₙxⁿ; shift (A − a₀)/x; convolution = product.",
        "Fibonacci GF: x/(1 − x − x²). Catalan GF: (1 − √(1−4x))/(2x).",
        "Catalan: Cₙ = C(2n,n)/(n+1); counts balanced parentheses, full binary trees, Dyck paths.",
        "Master theorem: compare f(n) with n^{log_b a}; cases Θ(n^{log_b a}), Θ(n^{log_b a} log n), Θ(f(n)).",
      ],
      recap: `Recurrences describe sequences by their history. The characteristic equation handles linear homogeneous recurrences, a particular solution handles forcing terms, and generating functions turn the whole sequence into one algebraic object. Catalan numbers and the Master theorem are the two recurrences that appear most often in algorithms and combinatorics. The safe workflow is always the same: identify the type, solve the homogeneous part, find a particular solution or generating function, and fit the initial conditions.`,
      code: {
        title: "Dynamic programming for Fibonacci and Catalan numbers",
        language: "python",
        code: `def fib(n): a, b = 0, 1 for _ in range(n): a, b = b, a + b return a def catalan(n): dp = [0] * (n + 1) dp[0] = 1 for i in range(1, n + 1): dp[i] = sum(dp[j] * dp[i - 1 - j] for j in range(i)) return dp[n] print([fib(i) for i in range(10)])
print([catalan(i) for i in range(6)])
# [0,1,1,2,3,5,8,13,21,34]
# [1,1,2,5,14,42]`,
        explanation:
          "The iterative Fibonacci routine avoids the exponential recursion by keeping only the last two values. The Catalan routine directly implements the convolution recurrence; its O(n²) cost is fine for moderate n, while the closed form is faster for a single large value.",
      },
      diagram: {
        title: "Choosing a recurrence technique",
        caption: "The shape of the recurrence determines the method.",
        mermaid: `flowchart TD R[Recurrence] --> T{Type} T -->|First order| I[Iterate or fixed point] T -->|Linear homogeneous| C[Characteristic roots] T -->|Nonhomogeneous| P[Homogeneous + particular] T -->|Combinatorial convolution| G[Generating function] T -->|Divide and conquer| M[Master theorem or recursion tree] C --> F[Fit initial conditions] P --> F G --> F M --> B[Asymptotic bound]`,
      },
    },
};
