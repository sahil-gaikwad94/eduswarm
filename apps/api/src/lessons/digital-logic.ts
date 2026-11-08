import type { TopicLesson } from '../topicLessons.js';

/**
 * Digital Logic — 7 authored topic lessons.
 *
 * Each entry is a standalone chapter for one topic. No shared module essay,
 * no runtime composition, no study-coach preamble. The subject begins in the
 * first sentence and the revision schedule is the only meta material, kept at
 * the very end.
 */
export const digitalLogic: Record<string, TopicLesson> = {
  'gate-cs-digital-logic-number-systems-and-codes': {
    intro: `A number system is a positional notation: the value of a digit depends on its position. In base b, the string dₖdₖ₋₁...d₀.d₋₁d₋₂... has the value Σ dᵢbⁱ. Decimal uses b = 10, binary uses b = 2, octal uses b = 8, and hexadecimal uses b = 16. Digital hardware uses binary because two voltage levels are easy to distinguish and regenerate, but octal and hexadecimal are shorthand for compactly writing binary groups. A code is a mapping from bit patterns to meanings: BCD maps each decimal digit to four bits, Gray code orders patterns so neighbours differ in one bit, and ASCII maps characters to seven-bit values.`,

    foundations: `To convert an integer from decimal to base b, divide repeatedly by b and read the remainders from last to first. To convert a fraction, multiply repeatedly by b and read the integer parts from first to last. Binary, octal, and hexadecimal convert by grouping: three bits per octal digit, four bits per hexadecimal digit. An n-bit unsigned word represents 0 through 2ⁿ − 1. Signed integers use sign-magnitude, one's complement, or two's complement; two's complement dominates because addition and subtraction use one circuit and there is no negative zero. A code is not a number system: BCD uses only the patterns 0000 through 1001, and the other six patterns are invalid.`,

    concepts: [
      {
        title: 'Positional notation and base conversion',
        body: `Every positional system follows the same expansion. Binary 1011.01 is 1·2³ + 0·2² + 1·2¹ + 1·2⁰ + 0·2⁻¹ + 1·2⁻² = 11.25. Hexadecimal 2F is 2·16 + 15 = 47. Conversion between binary and octal or hexadecimal is a grouping exercise: pad the integer part on the left and the fraction part on the right, then replace each group of three or four bits. For example, 101101.11 is 55.6 in octal and 2D.C in hexadecimal. Decimal-to-binary conversion of the integer part uses repeated division; the fraction uses repeated multiplication, and many decimal fractions produce repeating binary expansions.`,
      },
      {
        title: 'Unsigned binary arithmetic and word size',
        body: `Binary addition is the same column arithmetic as decimal, with a carry whenever a column reaches 2. Binary subtraction borrows 2 from the next column. Multiplication is repeated shift-and-add: each 1 bit of the multiplier contributes a shifted copy of the multiplicand. In an n-bit unsigned word, the range is 0 to 2ⁿ − 1, and a result that needs more than n bits overflows. A carry out of the most significant bit is not always an error in unsigned arithmetic, but it means the exact result does not fit in n bits. Word size determines both range and precision; doubling the number of bits squares the number of representable values.`,
      },
      {
        title: 'Signed integers: sign-magnitude, one’s complement, two’s complement',
        body: `Sign-magnitude uses the leftmost bit as a sign and the rest as magnitude. It has two representations of zero and needs separate adder and subtractor logic. One's complement flips every bit of the magnitude to negate; it also has two zeros and an end-around carry. Two's complement negates by flipping all bits and adding 1. In n bits, the range is −2ⁿ⁻¹ through 2ⁿ⁻¹ − 1. For 8 bits, that is −128 through 127. The pattern 10000000 is −128, not −0, and 11111111 is −1. Addition is ordinary binary addition with the carry out discarded; overflow occurs when the sign of the result is wrong, equivalently when the carry into the sign bit differs from the carry out of it.`,
      },
      {
        title: 'Fractions, fixed point, and floating point',
        body: `A fixed-point format reserves a fixed number of bits for the integer part and the fraction part. Qm.n notation means m integer bits and n fraction bits, with a resolution of 2⁻ⁿ. Fixed point is fast and predictable, but its range and precision are coupled. Floating point separates sign, exponent, and significand so the binary point can move. IEEE 754 single precision uses 1 sign bit, 8 exponent bits with bias 127, and 23 fraction bits, giving 24 significant bits of precision. Double precision uses 1, 11, and 52 bits with bias 1023. Not every decimal fraction is exact in binary: 0.1 repeats forever, so it is stored as the nearest representable value.`,
      },
      {
        title: 'Common codes: BCD, excess-3, Gray, ASCII, Unicode',
        body: `BCD encodes each decimal digit separately in four bits, so 27 is 0010 0111. It simplifies decimal displays but wastes six patterns per digit and needs correction logic after addition. Excess-3 adds 3 to each decimal digit before encoding, producing a self-complementing code. Gray code is a binary-reflected code in which consecutive values differ in exactly one bit; it is used in rotary encoders and Karnaugh-map ordering to avoid transient wrong outputs. ASCII is a 7-bit character code, extended to 8-bit bytes in practice. Unicode assigns code points to characters across languages and is encoded in UTF-8, UTF-16, or UTF-32; UTF-8 is variable-length and backward-compatible with ASCII.`,
      },
      {
        title: 'Error detection: parity, Hamming distance, Hamming codes',
        body: `A parity bit makes the total number of 1s even or odd, detecting any single-bit error but not locating it and not catching an even number of errors. The Hamming distance between two codewords is the number of bit positions in which they differ. A code with minimum distance d can detect d − 1 errors and correct floor((d − 1)/2) errors. Hamming(7,4) places four data bits at positions 3, 5, 6, and 7, and three parity bits at positions 1, 2, and 4. Each parity bit covers the positions whose binary indices contain that bit. The syndrome formed from the three parity checks gives the binary index of the flipped bit, so a single error can be corrected.`,
      },
    ],

    worked: [
      {
        title: 'Convert 156.625 to binary and hexadecimal',
        body: `Divide 156 repeatedly by 2: 156 → 78 remainder 0, 78 → 39 remainder 0, 39 → 19 remainder 1, 19 → 9 remainder 1, 9 → 4 remainder 1, 4 → 2 remainder 0, 2 → 1 remainder 0, 1 → 0 remainder 1. Reading remainders upward gives 10011100. For the fraction, multiply 0.625 by 2: 1.25 → integer 1; multiply 0.25 by 2: 0.5 → integer 0; multiply 0.5 by 2: 1.0 → integer 1. Reading integer parts downward gives .101. Therefore 156.625 = 10011100.101₂. Group into four-bit nibbles: 1001 1100 . 1010 = 9C.A₁₆. The octal form is 234.5₈, since 010 011 100 . 101 = 234.5.`,
      },
      {
        title: 'Represent −45 in 8-bit two’s complement',
        body: `Write +45 in 8 bits: 00101101. Flip every bit: 11010010. Add 1: 11010011. Therefore −45 is 11010011 in 8-bit two's complement. To check, add 45 and −45: 00101101 + 11010011 = 1 00000000; the carry out is discarded, leaving 00000000. The range of an 8-bit two's complement number is −128 through 127, and 11010011 lies inside it. The same pattern interpreted as unsigned is 211, which is why the interpretation must be known from context.`,
      },
      {
        title: 'Convert between binary and Gray code',
        body: `For binary 1011, the Gray code is computed from left to right: the most significant Gray bit equals the most significant binary bit, so g₃ = 1. Each remaining Gray bit is the XOR of the current and previous binary bits: g₂ = 1 ⊕ 0 = 1, g₁ = 0 ⊕ 1 = 1, g₀ = 1 ⊕ 1 = 0. The result is 1110. To reverse, the most significant binary bit equals the most significant Gray bit, and each next binary bit is the XOR of the previous binary bit and the current Gray bit: b₃ = 1, b₂ = 1 ⊕ 1 = 0, b₁ = 0 ⊕ 1 = 1, b₀ = 1 ⊕ 0 = 1, recovering 1011. Consecutive Gray codes differ in exactly one bit, which is why they are used for position encoders.`,
      },
      {
        title: 'Add 27 and 15 in BCD',
        body: `Encode each decimal digit: 27 = 0010 0111, 15 = 0001 0101. Add the low nibbles: 0111 + 0101 = 1100. Since 1100 is greater than 1001, add the correction 0110: 1100 + 0110 = 1 0010. The low digit is 0010 and a carry 1 goes to the high nibble. Add the high nibbles plus the carry: 0010 + 0001 + 0001 = 0100. The result is 0100 0010, which decodes to 42. Without the correction, the invalid pattern 1100 would appear; BCD addition always adds 6 to any nibble sum above 9.`,
      },
      {
        title: 'Encode 1011 in Hamming(7,4)',
        body: `Place the data bits d₁ = 1, d₂ = 0, d₃ = 1, d₄ = 1 at positions 3, 5, 6, and 7. Position 1 checks positions 1, 3, 5, 7: p₁ = d₁ ⊕ d₂ ⊕ d₄ = 1 ⊕ 0 ⊕ 1 = 0. Position 2 checks positions 2, 3, 6, 7: p₂ = d₁ ⊕ d₃ ⊕ d₄ = 1 ⊕ 1 ⊕ 1 = 1. Position 4 checks positions 4, 5, 6, 7: p₄ = d₂ ⊕ d₃ ⊕ d₄ = 0 ⊕ 1 ⊕ 1 = 0. The codeword is 0 1 1 0 0 1 1. Each parity check has even parity. If bit 5 flips, the checks involving position 5 fail, and the syndrome 101 identifies position 5.`,
      },
    ],

    exam: [
      {
        question: `How many bits are needed to represent the decimal values 0 through 999 in pure binary?`,
        answer: `Find the smallest n with 2ⁿ ≥ 1000. Since 2⁹ = 512 and 2¹⁰ = 1024, ten bits are needed. Nine bits cover only 0 through 511. In BCD, the same range would need 12 bits, because each of the three decimal digits uses four bits; BCD trades bit efficiency for easy decimal display.`,
      },
      {
        question: `What is the range of a 12-bit two’s complement integer?`,
        answer: `The range is −2¹¹ through 2¹¹ − 1, which is −2048 through 2047. The most negative value is 100000000000, and the most positive is 011111111111. An unsigned 12-bit word would cover 0 through 4095. The two's complement range is asymmetric because zero uses one pattern and there is no negative zero.`,
      },
      {
        question: `Why is 0.1 not exactly representable in binary floating point?`,
        answer: `0.1 in decimal is 1/10, and 10 has a prime factor 5, which is not a factor of 2. In base 2, the expansion of 1/10 is 0.0001100110011... repeating forever. A finite significand must round it to the nearest representable value, so 0.1 is stored as an approximation. This is why repeated additions of 0.1 can produce a result slightly different from 1.0.`,
      },
      {
        question: `How many invalid BCD patterns exist in a four-bit nibble, and why does BCD addition need correction?`,
        answer: `A nibble has 16 patterns, and only 0000 through 1001 represent decimal digits, so six patterns are invalid. When two BCD digits are added, a nibble sum can land in the invalid range 1010 through 1111, or produce a carry at 16 instead of 10. Adding 0110 (6) skips the six invalid patterns and propagates the correct decimal carry.`,
      },
    ],

    cheat: [
      'Value in base b: Σ dᵢbⁱ; integer conversion by repeated division, fraction by repeated multiplication.',
      'Group 3 bits per octal digit and 4 bits per hexadecimal digit, padding from the binary point.',
      'n-bit unsigned range: 0 to 2ⁿ − 1. n-bit two’s complement range: −2ⁿ⁻¹ to 2ⁿ⁻¹ − 1.',
      'Two’s complement negation: flip all bits, add 1. Discard the final carry when adding.',
      'Signed overflow: carry into the sign bit ≠ carry out of the sign bit.',
      'BCD uses 0000–1001 only; add 0110 to a nibble sum greater than 1001.',
      'Gray code: gᵢ = bᵢ ⊕ bᵢ₊₁; inverse: bᵢ = bᵢ₊₁ ⊕ gᵢ.',
      'Hamming(7,4): parity at positions 1, 2, 4; syndrome gives the error position.',
    ],

    recap: `Number systems are positional expansions, and conversion is repeated division or multiplication. Fixed-width binary introduces ranges and overflow; two's complement makes signed arithmetic uniform. Codes such as BCD, Gray, and ASCII map bit patterns to meanings rather than magnitudes. Error-detecting codes add redundancy, and Hamming codes use that redundancy to locate as well as detect a single-bit error.`,

    code: {
      title: 'Base conversion, two’s complement, and Gray code',
      language: 'python',
      code: `def to_base(n, b):
    digits = "0123456789ABCDEF"
    if n == 0:
        return "0"
    out = []
    while n:
        out.append(digits[n % b])
        n //= b
    return "".join(reversed(out))

def twos_complement(value, bits=8):
    return value & ((1 << bits) - 1)

def binary_to_gray(n):
    return n ^ (n >> 1)

def gray_to_binary(g):
    b = g
    shift = 1
    while g >> shift:
        b ^= g >> shift
        shift += 1
    return b

print(to_base(156, 2), to_base(156, 16))       # 10011100 9C
print(twos_complement(-45))                    # 211 -> 11010011
print(bin(binary_to_gray(0b1011)))             # 0b1110
print(bin(gray_to_binary(0b1110)))             # 0b1011`,

      explanation: 'The functions implement the definitions rather than relying on a library: repeated division for the base, a bit mask for two’s complement, and the XOR identities for Gray code. Each result can be checked by expanding it back to decimal.',
    },

    diagram: {
      title: 'Number systems and codes',
      caption: 'A number system gives magnitude; a code gives meaning to a bit pattern.',
      mermaid: `flowchart TD
  N[Bit patterns] --> P[Positional number systems]
  N --> C[Codes]
  P --> B[Binary base 2]
  P --> O[Octal base 8]
  P --> H[Hexadecimal base 16]
  P --> S[Signed representations]
  S --> SM[Sign-magnitude]
  S --> OC[One's complement]
  S --> TC[Two's complement]
  C --> BCD[BCD and excess-3]
  C --> G[Gray code]
  C --> A[ASCII and Unicode]
  C --> E[Parity and Hamming]`,
    },
  },

  'gate-cs-digital-logic-boolean-algebra-and-logic-gates': {
    intro: `Boolean algebra is the algebra of two values, usually written 0 and 1. The three basic operations are AND (·), OR (+), and NOT (′). A Boolean function maps each combination of inputs to one output, and a truth table lists every combination. Logic gates are the physical devices that implement these operations: AND, OR, NOT, NAND, NOR, XOR, and XNOR. The algebra matters because a smaller expression needs fewer gates, less power, and less delay; the gates matter because any Boolean function can be built from a small set of them.`,

    foundations: `The operations are defined by truth tables, not by arithmetic. AND is 1 only when both inputs are 1; OR is 1 when at least one input is 1; NOT flips the value. A literal is a variable or its complement. A product term is an AND of literals, and a sum term is an OR of literals. A function is in sum-of-products (SOP) form when it is an OR of product terms, and in product-of-sums (POS) form when it is an AND of sum terms. Two functions are equivalent when they have the same truth table for every input combination. Boolean algebra provides identities for transforming one expression into another without changing that table.`,

    concepts: [
      {
        title: 'Operations, precedence, and truth tables',
        body: `By convention, NOT binds tightest, then AND, then OR; parentheses override the convention. A function of n variables has 2ⁿ rows in its truth table, so the table grows exponentially and becomes impractical beyond a handful of inputs. The order of variables in the table must be fixed, usually counting in binary from all zeros to all ones. A minterm is a product that is 1 on exactly one row; a maxterm is a sum that is 0 on exactly one row. Every function can be written as the OR of the minterms where it is 1, or as the AND of the maxterms where it is 0.`,
      },
      {
        title: 'Laws and identities',
        body: `The core identities are: A + 0 = A, A · 1 = A, A + 1 = 1, A · 0 = 0, A + A = A, A · A = A, A + A′ = 1, A · A′ = 0, (A′)′ = A. AND and OR are commutative and associative, and each distributes over the other: A(B + C) = AB + AC and A + BC = (A + B)(A + C). Absorption says A + AB = A and A(A + B) = A. De Morgan's laws are (AB)′ = A′ + B′ and (A + B)′ = A′B′. The consensus theorem says AB + A′C + BC = AB + A′C; the term BC is redundant because it is covered whenever either of the other two terms is active.`,
      },
      {
        title: 'Canonical SOP and POS forms',
        body: `A canonical SOP writes every 1 of the function as a minterm and ORs them. For F(A, B, C) with 1s at rows 1, 3, 5, and 7, the canonical SOP is A′B′C + A′BC + AB′C + ABC, often written Σm(1, 3, 5, 7). A canonical POS writes every 0 as a maxterm and ANDs them, written ΠM(...). The two forms are duals: the minterm indices of F are the maxterm indices of F′. Canonical forms are unique, which makes them useful for specification and comparison, but they are rarely minimal. Simplification reduces the number of literals and gates while preserving the truth table.`,
      },
      {
        title: 'Logic gates and universal gates',
        body: `The AND gate outputs the product, the OR gate outputs the sum, and the inverter outputs the complement. NAND and NOR are the negated versions of AND and OR. XOR outputs 1 when the inputs differ, and XNOR outputs 1 when they are equal. NAND and NOR are functionally complete: any Boolean function can be built using only NAND gates or only NOR gates. A NAND gate with both inputs tied together acts as an inverter; two NANDs can form an AND; three can form an OR. XOR is not functionally complete by itself because it cannot produce a constant 1 from constant 0 inputs without an external 1.`,
      },
      {
        title: 'Gate realization and cost',
        body: `A logic circuit is evaluated by gate count, literal count, fan-in, and propagation delay. Multi-input gates are usually built from two-input gates, so a k-input AND costs k − 1 two-input ANDs. A two-level SOP realization uses one AND layer and one OR layer, with inverters for complemented literals. The same function may have several minimal forms depending on whether the cost is gates, literals, or delay. Factoring can reduce gate count but increases depth; a balanced tree reduces depth but may increase the number of gates. Exam questions often ask for the minimum number of NAND gates or the number of literals in the simplest expression.`,
      },
      {
        title: 'Logic families and electrical realities',
        body: `TTL and CMOS are the two classic families. CMOS uses complementary transistors, draws negligible static power, and dominates modern designs; TTL is bipolar and draws more static current. Fan-out is the number of gate inputs one output can drive without leaving the guaranteed logic levels. Noise margin is the difference between the worst-case output level and the input threshold. Propagation delay is the time from a valid input to a valid output. Real gates also have rise and fall times, input capacitance, and power-delay product. These parameters explain why a logically correct circuit can still fail at high speed or when loaded too heavily.`,
      },
    ],

    worked: [
      {
        title: 'Simplify A′B + AB + AB′',
        body: `Group the first two terms: A′B + AB = B(A′ + A) = B. The expression becomes B + AB′. Use absorption in the form X + X′Y = X + Y with X = B and Y = A: B + AB′ = B + A. Therefore A′B + AB + AB′ = A + B. Check the truth table: the original is 1 for (A, B) = (0, 1), (1, 0), and (1, 1), which is exactly the OR function. The simplification removes two gates and one literal.`,
      },
      {
        title: 'Simplify Σm(1, 3, 5, 7)',
        body: `Write the minterms for three variables: m1 = A′B′C, m3 = A′BC, m5 = AB′C, m7 = ABC. Factor C from all four: C(A′B′ + A′B + AB′ + AB). The expression inside the parentheses is 1 for every combination of A and B, so it equals 1. Therefore F = C. The function ignores A and B completely. This is the kind of simplification a Karnaugh map makes visual: all four 1s form a group that spans both values of A and both values of B, leaving only C.`,
      },
      {
        title: 'Build XOR from four NAND gates',
        body: `Let N1 = (A · B)′. Then N2 = (A · N1)′ and N3 = (B · N1)′. The output is N4 = (N2 · N3)′. Evaluate (0, 0): N1 = 1, N2 = 1, N3 = 1, N4 = 0. Evaluate (0, 1): N1 = 1, N2 = 1, N3 = 0, N4 = 1. Evaluate (1, 0): N1 = 1, N2 = 0, N3 = 1, N4 = 1. Evaluate (1, 1): N1 = 0, N2 = 1, N3 = 1, N4 = 0. The output is 1 exactly when the inputs differ, which is XOR. The construction uses four two-input NAND gates and no explicit inverter.`,
      },
      {
        title: 'Apply De Morgan to a gate network',
        body: `The expression (A + B)′C′ can be rewritten as A′B′C′ by De Morgan. Conversely, A′B′ + C′ becomes (A + B)′ + C′, which is the negation of (A + B)C. De Morgan is not just algebraic manipulation; it is the rule that turns an AND-OR network into a NAND-NAND network, or an OR-AND network into a NOR-NOR network. When converting a design to NAND-only, push the negation through the gates and flip AND to OR at each boundary. The truth table stays identical, which is the only proof that matters.`,
      },
    ],

    exam: [
      {
        question: `Simplify AB + A′C + BC using the consensus theorem.`,
        answer: `The term BC is the consensus of AB and A′C. When B = C = 1, the expression becomes A + A′ = 1 regardless of BC, so the BC term is redundant. The simplified form is AB + A′C. Removing it does not change the truth table and saves one AND gate and one OR input.`,
      },
      {
        question: `How many minterms does a Boolean function of five variables have, and how many rows are in its truth table?`,
        answer: `A five-variable function has 2⁵ = 32 rows and therefore 32 possible minterms, one for each input combination. A canonical SOP contains at most 32 terms. The number of distinct functions is 2³², which is why exhaustive enumeration is impractical and algebra or K-maps are used instead.`,
      },
      {
        question: `Why are NAND and NOR called universal gates?`,
        answer: `A set of gates is functionally complete when every Boolean function can be realized using only gates from that set. NAND alone can produce NOT (tie both inputs), AND (NAND followed by NOT), and OR (De Morgan: A + B = (A′B′)′), so it can build any SOP expression. NOR is the dual: it can produce NOT, OR, and AND. AND and OR alone cannot produce NOT, so they are not universal.`,
      },
      {
        question: `A function is 1 when an odd number of its three inputs are 1. Write its canonical SOP and simplify it.`,
        answer: `The 1 rows are 001, 010, 100, and 111, so F = A′B′C + A′BC′ + AB′C′ + ABC. This is the three-input XOR, F = A ⊕ B ⊕ C. It cannot be simplified to fewer than four three-literal product terms in SOP form, because each 1 is isolated from the others in the K-map. The expression is already minimal in literal count for a two-level SOP.`,
      },
    ],

    cheat: [
      'De Morgan: (AB)′ = A′ + B′; (A + B)′ = A′B′.',
      'Absorption: A + AB = A; A(A + B) = A. Consensus: AB + A′C + BC = AB + A′C.',
      'Canonical SOP: OR of minterms where F = 1. Canonical POS: AND of maxterms where F = 0.',
      'NAND and NOR are universal; XOR is not functionally complete on its own.',
      'XOR: A⊕B = A′B + AB′; A⊕A = 0; A⊕0 = A; A⊕1 = A′.',
      'A k-input AND built from two-input gates needs k − 1 gates.',
      'Two-level SOP has AND layer then OR layer; NAND-NAND is equivalent by De Morgan.',
      'Fan-out, noise margin, and propagation delay are electrical limits, not logic errors.',
    ],

    recap: `Boolean algebra turns logical specifications into expressions, and identities turn those expressions into cheaper ones. Canonical SOP and POS give unambiguous starting points; De Morgan, absorption, and consensus do the simplification. NAND and NOR universality means a single gate type can implement any function. Gate count is only one cost: depth, fan-out, and delay decide whether the circuit works at speed.`,

    code: {
      title: 'Evaluate a Boolean expression and verify an identity',
      language: 'python',
      code: `from itertools import product

def f(a, b, c):
    return (not a and b) or (a and b) or (a and not b)

def g(a, b, c):
    return a or b

rows = list(product([False, True], repeat=3))
print(all(f(*row) == g(*row) for row in rows))  # True

# NAND-only XOR
def nand(x, y):
    return not (x and y)

def xor_nand(a, b):
    n1 = nand(a, b)
    return nand(nand(a, n1), nand(b, n1))

print(all(xor_nand(a, b) == (a != b) for a, b in product([False, True], repeat=2)))  # True`,

      explanation: 'The first check proves the algebraic simplification by exhausting all eight rows. The second builds XOR from four NANDs exactly as the gate-level construction describes, then verifies it on all four input pairs.',
    },

    diagram: {
      title: 'From truth table to gate network',
      caption: 'Canonical form is a specification; identities and K-maps produce the implementation.',
      mermaid: `flowchart TD
  T[Truth table] --> M[Minterms where F = 1]
  M --> S[Canonical SOP]
  S --> A[Boolean algebra / K-map]
  A --> R[Minimal SOP or POS]
  R --> N[NAND-NAND or NOR-NOR]
  N --> G[Gate network]`,
    },
  },

  'gate-cs-digital-logic-karnaugh-maps-and-minimization': {
    intro: `A Karnaugh map is a truth table rearranged so that adjacent cells differ in exactly one input. Grouping adjacent 1s produces product terms that differ in one variable, and that variable can be eliminated. The map turns Boolean simplification into a visual covering problem: cover every 1 with as few groups as possible, make each group as large as possible, and use don't-care cells to enlarge groups when doing so simplifies the result. For up to four variables the map is fast and reliable; beyond that, tabular methods or CAD tools take over.`,

    foundations: `A K-map for n variables has 2ⁿ cells, one per minterm. Rows and columns are labeled in Gray-code order so that neighbouring cells differ in one bit. A group must contain 1, 2, 4, 8, or 16 cells, must be rectangular, and may wrap around the edges. A group of size 2 eliminates one variable, size 4 eliminates two, size 8 eliminates three. A product term is an implicant; a prime implicant is not contained in any larger implicant; an essential prime implicant covers at least one 1 that no other prime implicant covers. A minimal SOP is a smallest cover of the 1s by prime implicants. POS minimization groups the 0s and reads sum terms with complemented variables.`,

    concepts: [
      {
        title: 'Map layout and Gray-code adjacency',
        body: `A two-variable map has rows A = 0, 1 and columns B = 0, 1. A three-variable map usually has rows A = 0, 1 and columns BC = 00, 01, 11, 10; the column order 00, 01, 11, 10 is Gray code, not binary order. A four-variable map has rows AB = 00, 01, 11, 10 and columns CD = 00, 01, 11, 10. The top row wraps to the bottom row, the left column wraps to the right column, and the four corners are mutually adjacent. A five-variable map uses two four-variable maps, one for the fifth variable equal to 0 and one for it equal to 1, with corresponding cells adjacent across the two layers.`,
      },
      {
        title: 'Grouping rules and reading product terms',
        body: `Circle only 1s (or only 0s for POS), in groups whose size is a power of two. Every cell in a group must be covered, groups may overlap, and a group may wrap around an edge. To read a group, identify the variables that stay constant across all cells: a variable that is 0 throughout contributes its complement, a variable that is 1 throughout contributes itself, and a variable that changes is eliminated. For example, a group covering cells 000 and 001 keeps A = 0 and B = 0 and eliminates C, giving A′B′. A group covering all four cells with A = 1 gives A. Larger groups produce fewer literals.`,
      },
      {
        title: 'Don’t-care conditions',
        body: `Some input combinations never occur or their output does not matter. Mark these cells with X and treat each X as 0 or 1, whichever helps the cover. Don't-cares can bridge groups that would otherwise be separate, turning two two-cell groups into one four-cell group and removing a literal. They should never be used to justify covering a 0 or to create a group that contains no 1. In POS minimization, a don't-care can be treated as 0 when it helps a group of zeros. The final circuit must still behave correctly on all specified inputs; the don't-care rows are free.`,
      },
      {
        title: 'ESSENTIAL PRIME IMPLICANTS AND MINIMAL COVERS',
        body: `After listing all prime implicants, find the 1s covered by exactly one prime implicant; that implicant is essential and must be in every minimal cover. Remove the covered 1s and repeat. If a choice remains, use a Petrick-style branch or a greedy heuristic, then compare literal counts. A cover can be minimal in the number of terms but not in the number of literals, so the cost criterion must be stated. The K-map makes prime implicants visible as maximal groups; the covering step is the part that still requires judgment on larger maps.`,
      },
      {
        title: 'POS minimization and mixed forms',
        body: `To minimize a POS expression, group the 0s instead of the 1s. Each group yields a sum term: a variable that is 0 throughout appears uncomplemented, a variable that is 1 throughout appears complemented, and a changing variable is dropped. For example, a group of zeros with B = 0 and C = 0 across both values of A yields the sum term (B + C). The final POS is the AND of all group terms. Some functions have a smaller SOP and some a smaller POS; compare both when the question asks for the minimum literal count. Mixed forms such as XOR-heavy functions may be smaller than either two-level form.`,
      },
      {
        title: 'Five variables, Quine–McCluskey, and hazards',
        body: `A five-variable K-map is two four-variable layers; a group can use corresponding cells in both layers, which eliminates the fifth variable. Beyond five variables the drawing becomes hard to read, and the Quine–McCluskey tabular method is used: list minterms, combine terms that differ in one bit, mark combined terms, and repeat until no more combinations are possible. The remaining terms are prime implicants; a covering table selects the essential ones. Two-level minimization can still leave static hazards, because two product terms that are adjacent in the map may momentarily both drop during a single variable change. Adding the consensus term that bridges the adjacent groups removes the hazard.`,
      },
    ],

    worked: [
      {
        title: 'Minimize Σm(0, 1, 2, 3, 4, 6)',
        body: `Plot the six 1s on a three-variable map with columns BC = 00, 01, 11, 10. The cells 0, 1, 2, 3 occupy the entire A = 0 row, so they form a group of four and give A′. The cells 0, 2, 4, 6 occupy the entire C = 0 column (with wraparound), so they form another group of four and give C′. The two groups cover every 1, and neither is redundant. The minimal SOP is F = A′ + C′. No single group covers all six 1s because they do not form a power-of-two rectangle.`,
      },
      {
        title: 'Minimize Σm(0, 2, 5, 7, 8, 10, 13, 15)',
        body: `On a four-variable map, the cells 0, 2, 8, 10 have B = 0 and D = 0, so they form a group of four giving B′D′. The cells 5, 7, 13, 15 have B = 1 and D = 1, so they form a group of four giving BD. Every 1 is covered exactly once, so both groups are essential. The minimal SOP is F = B′D′ + BD, which is the XNOR of B and D. The function does not depend on A or C at all.`,
      },
      {
        title: 'Use don’t-cares to simplify',
        body: `Let F(A, B, C) = Σm(0, 1, 5) with don't-cares d(2, 3, 7). Plot the 1s and Xs. The cells 0, 1, 2, 3 form a group of four with A = 0, giving A′. The cells 5 and 7 form a group of two with A = 1 and C = 1, giving AC. The cover is A′ + AC, which simplifies by absorption to A′ + C. The don't-care at 2 and 3 made the first group possible; the don't-care at 7 made the second group possible. Without them, the 1s would need more terms.`,
      },
      {
        title: 'POS minimization from the zeros',
        body: `Let F(A, B, C) = ΠM(0, 1, 4, 5). The zeros are 000, 001, 100, and 101. They share B = 0 and C = 0, across both values of A, so one group of four yields the sum term (B + C). Therefore F = B + C. Check the zeros: B + C is 0 only when B = 0 and C = 0, which is exactly the four listed rows. Grouping the 1s instead would give a more complicated SOP, which shows why comparing SOP and POS matters.`,
      },
    ],

    exam: [
      {
        question: `Why must a K-map group have a size that is a power of two?`,
        answer: `A group of size 2ᵏ spans k variables that change and therefore eliminates exactly k literals. Each doubling of the group removes one variable from the product term. A group of size 3 or 6 cannot be described by a single product term because the changing variables do not form a complete set of combinations, so it would not correspond to one implicant. Power-of-two groups are exactly the subcubes of the Boolean cube.`,
      },
      {
        question: `What is an essential prime implicant, and why does it simplify the covering step?`,
        answer: `A prime implicant is essential when it covers at least one 1 that no other prime implicant covers. That 1 must be covered by some term, and only this implicant can do it, so every minimal cover must include the implicant. After selecting all essential prime implicants, the remaining uncovered 1s are handled by a smaller covering problem. This often determines the entire minimal cover without search.`,
      },
      {
        question: `How does a static-1 hazard arise, and how does a K-map reveal it?`,
        answer: `A static-1 hazard occurs when one input changes and the output should stay 1, but two product terms hand off the 1 through different gates with different delays, causing a momentary 0. On a K-map, it appears as two adjacent groups that touch but are not covered by a common implicant. Adding the consensus term that covers the adjacent pair removes the hazard, at the cost of one extra gate.`,
      },
      {
        question: `How many cells does a five-variable K-map have, and how are they arranged?`,
        answer: `It has 2⁵ = 32 cells, arranged as two four-variable maps, one for the fifth variable equal to 0 and one for it equal to 1. Cells in the same position on the two layers are adjacent, so a group can span both layers and eliminate the fifth variable. The two layers are not physically adjacent on paper, but the adjacency rule treats them as if they were stacked.`,
      },
    ],

    cheat: [
      'n-variable K-map: 2ⁿ cells; rows and columns in Gray order 00, 01, 11, 10.',
      'Group sizes are 1, 2, 4, 8, 16; a group of 2ᵏ eliminates k variables.',
      'Groups may overlap, wrap edges, and use the four corners as one group.',
      'A group of 1s gives a product term; a group of 0s gives a sum term for POS.',
      'Prime implicant: no larger group contains it. Essential: covers a 1 no other prime covers.',
      'Don’t-cares can be 0 or 1, but never use them to cover a real 0.',
      'SOP: variables constant 1 appear plain, constant 0 appear complemented.',
      'POS: variables constant 0 appear plain, constant 1 appear complemented.',
    ],

    recap: `A K-map is a truth table drawn so that logical adjacency becomes physical adjacency. Grouping maximal power-of-two rectangles produces prime implicants, and covering the 1s with the essential ones gives a minimal SOP. Don't-cares enlarge groups without changing specified behavior, and grouping the 0s gives the POS form. The map is a tool for up to four or five variables; beyond that, the same ideas become the Quine–McCluskey table.`,

    code: {
      title: 'Check which minterms a product term covers',
      language: 'python',
      code: `def covers(minterm, fixed):
    # fixed is a dict of variable index -> required bit, e.g. {0: 0, 2: 1}
    return all(((minterm >> (2 - i)) & 1) == bit for i, bit in fixed.items())

# Three-variable map, variable order A B C (A is the high bit).
# Product term A' (A = 0) covers all minterms with A = 0.
covered = [m for m in range(8) if covers(m, {0: 0})]
print(covered)  # [0, 1, 2, 3]

# Product term C (C = 1) covers every odd minterm.
print([m for m in range(8) if covers(m, {2: 1})])  # [1, 3, 5, 7]`,

      explanation: 'A product term is a set of fixed variable values; every minterm matching those values is covered. This is exactly the membership test used when checking whether a proposed group is a valid implicant.',
    },

    diagram: {
      title: 'K-map minimization workflow',
      caption: 'Plot, group, read, and cover; then check for hazards.',
      mermaid: `flowchart TD
  T[Truth table or minterm list] --> P[Plot 1s and don't-cares]
  P --> G[Find maximal power-of-two groups]
  G --> E[Select essential prime implicants]
  E --> C{Cover all 1s?}
  C -->|No| S[Choose additional prime implicants]
  C -->|Yes| R[Read minimal SOP]
  S --> R
  R --> H[Check static hazards]
  H --> I[Add consensus terms if needed]`,
    },
  },

  'gate-cs-digital-logic-combinational-circuits': {
    intro: `A combinational circuit produces outputs that depend only on the current inputs. There is no memory and no feedback: change the inputs, wait for the propagation delay, and the outputs settle to the value dictated by the Boolean function. Adders, subtractors, comparators, multiplexers, decoders, encoders, and programmable logic arrays are all combinational. They are the arithmetic and routing fabric on which sequential systems are built.`,

    foundations: `A half adder adds two bits and produces a sum and a carry. A full adder adds three bits, including a carry-in. Ripple-carry adders chain full adders, so the carry propagates through every stage. A multiplexer selects one of several inputs using select lines. A decoder asserts exactly one of 2ⁿ outputs for each n-bit input. An encoder reverses that mapping, and a priority encoder resolves simultaneous requests. A ROM stores a truth table, a PLA has a programmable AND array and a programmable OR array, and a PAL has a fixed OR array. Combinational hazards are momentary wrong outputs caused by unequal path delays.`,

    concepts: [
      {
        title: 'Adders and carry propagation',
        body: `A half adder has S = A ⊕ B and C = AB. A full adder has S = A ⊕ B ⊕ Cᵢₙ and Cₒᵤₜ = AB + ACᵢₙ + BCᵢₙ. The carry lookahead adder defines generate Gᵢ = AᵢBᵢ and propagate Pᵢ = Aᵢ ⊕ Bᵢ, then Cᵢ₊₁ = Gᵢ + PᵢCᵢ. Expanding the recurrence gives each carry as a sum of generate terms, so all carries can be computed in parallel with a tree of gates. The ripple-carry adder is smaller but its worst-case delay grows linearly with the number of bits; the lookahead adder trades area for logarithmic depth.`,
      },
      {
        title: 'Subtractors, comparators, and overflow',
        body: `Subtraction is addition of the two's complement: A − B = A + B′ + 1. A full subtractor has difference A ⊕ B ⊕ Bᵢₙ and borrow A′B + A′Bᵢₙ + BBᵢₙ. A magnitude comparator computes greater-than, equal, and less-than by comparing bits from most significant to least significant. For signed addition, overflow is the XOR of the carry into the sign bit and the carry out of the sign bit. For unsigned addition, overflow is simply the carry out of the most significant bit. The same adder hardware can perform both operations; the interpretation of the flags determines what the result means.`,
      },
      {
        title: 'Multiplexers as function generators',
        body: `A 2ⁿ-to-1 multiplexer has n select lines and 2ⁿ data inputs. Its output is the selected data input: F = Σ Dᵢ·mᵢ, where mᵢ is the minterm of the select variables. A 2-to-1 MUX implements F = S′D₀ + SD₁. Any Boolean function of n variables can be implemented by a 2ⁿ-to-1 MUX with the variables connected to the select lines and the data inputs tied to 0 or 1. A smaller MUX can implement the same function by using some variables as data inputs; for example, a 4-to-1 MUX with two select lines can implement a three-variable function by feeding the third variable, its complement, 0, or 1 into each data input.`,
      },
      {
        title: 'Decoders, encoders, and priority encoders',
        body: `An n-to-2ⁿ decoder asserts exactly one output for each input combination; an active-low decoder asserts the selected output as 0. A decoder plus an OR gate implements any SOP function: connect the minterms of the function to the OR inputs. An encoder performs the inverse mapping, but only one input may be active at a time. A priority encoder handles multiple active inputs and outputs the index of the highest-priority one, plus a valid signal. Priority encoders are used in interrupt controllers and bus arbiters, where simultaneous requests are normal.`,
      },
      {
        title: 'ROM, PLA, PAL, and programmable logic',
        body: `A ROM is a fixed AND array followed by a programmable OR array: every minterm is generated, and the OR plane selects which minterms are summed. A PLA has both a programmable AND array and a programmable OR array, so it can implement multiple functions with shared product terms. A PAL has a programmable AND array and a fixed OR array, which is cheaper but less flexible. The size of a PLA is described by the number of inputs, product terms, and outputs. These devices are the bridge between discrete gates and modern FPGAs, which use lookup tables instead of fixed arrays.`,
      },
      {
        title: 'Hazards and timing',
        body: `A static-1 hazard occurs when an output should remain 1 during a single input change but momentarily glitches to 0; a static-0 hazard is the dual. A dynamic hazard produces multiple transitions when one is expected. Hazards arise when two paths from the changed input to the output have different delays. On a K-map, a static-1 hazard appears when two adjacent groups are not covered by a common implicant. Adding the consensus term that bridges them removes the hazard. In synchronous systems, hazards can sometimes be ignored if the output is sampled after settling, but they must be eliminated when the signal drives an asynchronous input or a clock.`,
      },
    ],

    worked: [
      {
        title: 'Derive the full adder',
        body: `The full adder has three inputs A, B, and Cᵢₙ. The sum is 1 when an odd number of inputs are 1, so S = A ⊕ B ⊕ Cᵢₙ. The carry is 1 when at least two inputs are 1, so Cₒᵤₜ = AB + ACᵢₙ + BCᵢₙ. Check the row A = 1, B = 1, Cᵢₙ = 0: S = 0 and Cₒᵤₜ = 1, which is the binary sum 2. Check A = 1, B = 0, Cᵢₙ = 1: S = 0 and Cₒᵤₜ = 1, also 2. Check all three 1s: S = 1 and Cₒᵤₜ = 1, which is 3.`,
      },
      {
        title: 'Implement a function with a 4-to-1 MUX',
        body: `Implement F(A, B, C) = Σm(1, 2, 6, 7) with A and B as select lines. For each combination of AB, determine F as a function of C. AB = 00: m0 = 0, m1 = 1, so F = C. AB = 01: m2 = 1, m3 = 0, so F = C′. AB = 10: m4 = 0, m5 = 0, so F = 0. AB = 11: m6 = 1, m7 = 1, so F = 1. Connect D₀ = C, D₁ = C′, D₂ = 0, D₃ = 1. The MUX select lines are A and B, and the output is F.`,
      },
      {
        title: 'Implement a function with a decoder',
        body: `Use a 3-to-8 active-high decoder and an OR gate to implement F(A, B, C) = Σm(0, 2, 5). The decoder outputs O₀ through O₇, where Oᵢ is 1 exactly when the input is minterm i. Connect O₀, O₂, and O₅ to the OR gate. The OR outputs 1 exactly on those minterms, so it computes F. If the decoder is active-low, use a NAND gate instead of an OR gate, because the selected output is 0 and the NAND of the selected zeros produces 1.`,
      },
      {
        title: 'Find and remove a static-1 hazard',
        body: `Let F = AB + A′C. When B = C = 1 and A changes from 1 to 0, the term AB turns off while A′C turns on. If the inverter delay is longer than the AND gate delay, both terms are 0 for a moment and F glitches to 0. On the K-map, the two groups touch at the boundary A = 1, B = C = 1 and A = 0, B = C = 1. The consensus term BC covers that boundary. Adding it gives F = AB + A′C + BC, which is logically equivalent but has no static-1 hazard for this transition.`,
      },
    ],

    exam: [
      {
        question: `How many select lines does a 16-to-1 multiplexer need, and how many data inputs does a 3-to-8 decoder have?`,
        answer: `A 16-to-1 MUX has 16 = 2⁴ data inputs, so it needs 4 select lines. A 3-to-8 decoder has 3 inputs and 8 outputs, so it has 3 input lines. The pattern is the same: an n-bit select or input code addresses 2ⁿ destinations.`,
      },
      {
        question: `Why is a ripple-carry adder slower than a carry-lookahead adder?`,
        answer: `In a ripple-carry adder, the carry out of each full adder depends on the carry out of the previous stage, so the worst-case carry delay grows linearly with the number of bits. A carry-lookahead adder computes generate and propagate signals for each bit and combines them in a tree, so the carry delay grows logarithmically. The lookahead adder uses more gates, but it breaks the serial dependency.`,
      },
      {
        question: `How can a 2-to-1 multiplexer be used as a programmable inverter?`,
        answer: `Connect the input signal to D₀ and its complement to D₁, and use a control signal S as the select. When S = 0, the output is the input; when S = 1, the output is the complement. The MUX selects between the two functions under program control. This is a simple example of using a MUX as a one-bit lookup table.`,
      },
      {
        question: `What is the difference between a decoder and a demultiplexer?`,
        answer: `A decoder takes an n-bit input and asserts one of 2ⁿ outputs; it does not route a data signal. A demultiplexer takes one data input and routes it to one of 2ⁿ outputs selected by n select lines. A decoder with an enable input can act as a demultiplexer by treating the enable as the data input, because the enabled output is the only one asserted.`,
      },
    ],

    cheat: [
      'Half adder: S = A⊕B, C = AB. Full adder: S = A⊕B⊕Cin, Cout = AB + ACin + BCin.',
      'Carry lookahead: G = AB, P = A⊕B, Cᵢ₊₁ = Gᵢ + PᵢCᵢ.',
      'Subtraction: A − B = A + B′ + 1. Signed overflow = carry-in to sign XOR carry-out.',
      '2-to-1 MUX: F = S′D₀ + SD₁. An n-variable function can use a 2ⁿ:1 MUX directly.',
      'n-to-2ⁿ decoder asserts one output per input; OR the selected minterms to implement SOP.',
      'Priority encoder outputs the highest-priority active input and a valid flag.',
      'ROM: fixed AND, programmable OR. PLA: programmable AND and OR. PAL: programmable AND, fixed OR.',
      'Static-1 hazard: add the consensus term bridging adjacent K-map groups.',
    ],

    recap: `Combinational circuits are Boolean functions made physical. Adders chain carry logic, multiplexers select data, decoders expand codes, and encoders compress them. The same function can be built from gates, a MUX, a decoder, or a PLA, and the choice depends on cost, speed, and programmability. Hazards are a timing phenomenon, not a logic error; they appear when a single input change takes two paths with different delays.`,

    code: {
      title: 'Simulate a full adder and a 4-to-1 multiplexer',
      language: 'python',
      code: `def full_adder(a, b, cin):
    s = a ^ b ^ cin
    cout = (a and b) or (a and cin) or (b and cin)
    return int(s), int(cout)

for a in (0, 1):
    for b in (0, 1):
        for cin in (0, 1):
            print(a, b, cin, "->", full_adder(a, b, cin))

def mux4(d0, d1, d2, d3, s1, s0):
    return [d0, d1, d2, d3][(s1 << 1) | s0]

print(mux4(0, 1, 1, 0, 1, 0))  # 1`,

      explanation: 'The full adder is written directly from its sum and carry equations, and the MUX uses the select bits as an index. Both are evaluated exhaustively or on a representative input, which is the same check a truth table provides.',
    },

    diagram: {
      title: 'Full adder from two half adders',
      caption: 'The sum is XOR of all three bits; the carry is the OR of the pairwise carries.',
      mermaid: `flowchart LR
  A[A] --> X1[XOR]
  B[B] --> X1
  X1 --> X2[XOR]
  Cin[Cin] --> X2
  X2 --> S[Sum]
  A --> A1[AND]
  B --> A1
  X1 --> A2[AND]
  Cin --> A2
  B --> A3[AND]
  Cin --> A3
  A1 --> O[OR]
  A2 --> O
  A3 --> O
  O --> Cout[Cout]`,
    },
  },

  'gate-cs-digital-logic-sequential-circuits': {
    intro: `A sequential circuit has memory: its output depends on the current inputs and on the past sequence of inputs. The memory is built from latches and flip-flops, which store one bit each. A latch is level-sensitive and transparent while its enable is active; a flip-flop is edge-triggered and samples its input only at a clock transition. Sequential circuits include registers, counters, and finite-state machines. Their behavior is described by state tables, state diagrams, and next-state equations rather than by a single truth table.`,

    foundations: `The SR latch is the simplest memory element. A NOR latch with S = 1, R = 0 sets Q = 1; S = 0, R = 1 resets Q = 0; S = R = 0 holds; S = R = 1 is forbidden because both outputs go to 0 and the release race is unpredictable. A D latch removes the forbidden state by tying the two inputs to be complementary: when EN = 1, Q follows D; when EN = 0, Q holds. A D flip-flop samples D only on the active clock edge. A JK flip-flop adds a toggle mode, and a T flip-flop toggles when T = 1. Setup time, hold time, and clock-to-Q delay constrain the maximum clock frequency.`,

    concepts: [
      {
        title: 'Latches: SR, D, and level sensitivity',
        body: `A latch has no clock edge; it has an enable level. The gated SR latch uses an enable to prevent changes when EN = 0, but it still has the forbidden S = R = 1 state. The D latch ties S = D and R = D′, so the forbidden state never occurs. While EN = 1 the latch is transparent: Q follows D with a propagation delay. While EN = 0 the latch holds its value. Transparency is useful for simple storage but dangerous in synchronous designs, because a long enable pulse can let a new value race through several stages.`,
      },
      {
        title: 'Edge-triggered flip-flops and characteristic equations',
        body: `A positive-edge-triggered D flip-flop updates Q to D on the rising clock edge and holds otherwise. Its characteristic equation is Q⁺ = D. A JK flip-flop has Q⁺ = JQ′ + K′Q: J = 1, K = 0 sets; J = 0, K = 1 resets; J = K = 1 toggles; J = K = 0 holds. A T flip-flop has Q⁺ = T ⊕ Q. Flip-flops are built as master–slave pairs, where the master is transparent on one clock level and the slave on the other, so the input is sampled once per edge rather than throughout the level.`,
      },
      {
        title: 'Timing: setup, hold, clock-to-Q, and metastability',
        body: `Setup time tₛᵤ is the interval before the clock edge during which D must be stable. Hold time tₕ is the interval after the edge during which D must remain stable. Clock-to-Q t_cq is the delay from the edge to the output. For a path from one flip-flop through combinational logic to another, the clock period must satisfy T ≥ t_cq + t_comb + tₛᵤ + t_skew. If D changes inside the setup-hold window, the flip-flop can enter a metastable state that resolves unpredictably; synchronizers reduce this risk.`,
      },
      {
        title: 'Finite-state machines: Mealy and Moore',
        body: `A finite-state machine has a finite set of states, an input alphabet, an output alphabet, a next-state function, and an output function. In a Moore machine the output depends only on the current state; in a Mealy machine it depends on the state and the current input. Mealy outputs can respond within the same clock cycle, but they can glitch when the input changes. Moore outputs are registered and cleaner, but they typically need one more state for the same sequence. State diagrams draw states as circles and transitions as labeled arrows; state tables list next state and output for every state-input pair.`,
      },
      {
        title: 'Analyzing a sequential circuit',
        body: `To analyze a circuit, write the next-state equations from the flip-flop inputs, write the output equations, and derive the state table. For each current state and input, compute the next state and output. Then draw the state diagram and identify the function. If the circuit has unused states, check whether they eventually lead into the used states; a self-starting machine does, a lockout machine does not. Analysis is the inverse of design: design starts from a specification and ends with equations, analysis starts with equations and ends with behavior.`,
      },
      {
        title: 'Registers, counters, and shift registers',
        body: `A register is a group of flip-flops sharing a clock. An n-bit register stores n bits and can load them in parallel. A shift register moves bits one position per clock: serial-in serial-out delays the input by n cycles, serial-in parallel-out converts serial data to a parallel word, and parallel-in serial-out does the reverse. A counter is a register whose next state follows a fixed sequence. Ripple counters chain flip-flops and suffer accumulated delay; synchronous counters clock all flip-flops together and decode the next state with combinational logic. Ring and Johnson counters use shift registers with feedback.`,
      },
    ],

    worked: [
      {
        title: 'Analyze a D flip-flop with D = Q ⊕ X',
        body: `The next-state equation is Q⁺ = Q ⊕ X. Build the state table: when X = 0, Q⁺ = Q, so the state holds; when X = 1, Q⁺ = Q′, so the state toggles. This is exactly a T flip-flop with T = X. If Q = 0 and X = 1, the next state is 1; if Q = 1 and X = 1, the next state is 0. The output is the state itself. The circuit has two states and no unused states.`,
      },
      {
        title: 'Convert a D flip-flop to a JK flip-flop',
        body: `We need D such that the D flip-flop behaves like a JK flip-flop. The JK characteristic equation is Q⁺ = JQ′ + K′Q, and the D flip-flop has Q⁺ = D. Therefore connect D = JQ′ + K′Q. This requires an inverter for Q, two AND gates, and an OR gate. The conversion is combinational logic in front of the D input. The same method works for any flip-flop conversion: equate the target characteristic equation to the available next-state equation and solve for the input.`,
      },
      {
        title: 'Compute the maximum clock frequency',
        body: `A synchronous path has t_cq = 2 ns, combinational delay t_comb = 5 ns, setup time t_su = 1 ns, and clock skew t_skew = 0.5 ns. The minimum clock period is T ≥ 2 + 5 + 1 + 0.5 = 8.5 ns. The maximum frequency is 1/8.5 ns ≈ 117.6 MHz. Hold-time violations are checked separately: the shortest path from launch to capture must be longer than t_h, otherwise the new data can overwrite the old data too early.`,
      },
      {
        title: 'Explain the SR latch race',
        body: `Start with Q = 0 and Q′ = 1. Apply S = 1, R = 1 to a NOR latch: both outputs are forced to 0. Now change S and R to 0 simultaneously. Both NOR gates see one 0 input, and each tries to drive its output to 1, but each output is the other gate's input. The result depends on which gate is faster and on stray capacitance. The final state is unpredictable, which is why S = R = 1 is forbidden. The D latch avoids the problem by making S and R complementary.`,
      },
      {
        title: 'Design the state table for a 1011 sequence detector',
        body: `Use four states: S0 (no useful prefix), S1 (last bit 1), S2 (last bits 10), S3 (last bits 101). On input 0: S0 goes to S0, S1 goes to S2, S2 goes to S0, S3 goes to S2. On input 1: S0 goes to S1, S1 stays in S1, S2 goes to S3, S3 goes to S1 and outputs 1, because 1011 has been seen and the final 1 is also the start of a possible overlapping match. This is a Mealy machine: the output 1 occurs on the transition into S1 from S3, not on the state itself.`,
      },
    ],

    exam: [
      {
        question: `What is the difference between a latch and a flip-flop?`,
        answer: `A latch is level-sensitive: while its enable is active, the output can follow the input. A flip-flop is edge-triggered: it samples the input only at a clock transition and holds at all other times. Flip-flops are preferred in synchronous designs because the single sampling instant makes timing analysis and state transitions predictable. A latch can be used as a storage element, but its transparency creates race paths.`,
      },
      {
        question: `How many flip-flops are needed for a modulo-10 counter, and how many states are unused?`,
        answer: `A modulo-10 counter needs ceil(log₂ 10) = 4 flip-flops, because 3 flip-flops provide only 8 states. Four flip-flops provide 16 states, so 16 − 10 = 6 states are unused. A self-starting design ensures that any unused state eventually leads into the valid counting sequence; otherwise the counter can lock up after a glitch.`,
      },
      {
        question: `A positive-edge-triggered D flip-flop has D = 1 and clock = 0. What is Q after the next rising edge?`,
        answer: `The flip-flop samples D at the rising edge, so Q becomes 1 after the clock-to-Q delay. Before the edge, Q retains its previous value regardless of D, because the input is not transparent. If D changes immediately after the edge, the new value is not captured until the next rising edge, provided the hold time is respected.`,
      },
      {
        question: `Why can a Mealy machine output glitch when its input changes?`,
        answer: `A Mealy output is a combinational function of the current state and the current input. When the input changes, the output can change immediately through the combinational path, before the next clock edge. If the input has noise or slow rise times, the output can show multiple transitions. A Moore output depends only on the registered state, so it changes only after a clock edge and is glitch-free at the state-transition level.`,
      },
    ],

    cheat: [
      'SR latch: S=1,R=0 set; S=0,R=1 reset; S=R=0 hold; S=R=1 forbidden.',
      'D latch: transparent when EN=1, holds when EN=0. D flip-flop: Q⁺ = D at the active edge.',
      'JK flip-flop: Q⁺ = JQ′ + K′Q. T flip-flop: Q⁺ = T⊕Q.',
      'Setup/hold: D stable before and after the clock edge; T ≥ t_cq + t_comb + t_su + t_skew.',
      'Moore output depends on state only; Mealy output depends on state and input.',
      'n-bit register stores 2ⁿ possible values; modulo-N counter needs ceil(log₂N) flip-flops.',
      'Ring counter: n states. Johnson counter: 2n states. Both use shift-register feedback.',
      'Unused states must be checked for self-starting behavior.',
    ],

    recap: `Sequential circuits add time to logic. Latches store a level, flip-flops sample an edge, and timing constraints decide whether the stored value is reliable. State machines describe behavior as states and transitions; Mealy and Moore differ in when the output is produced. Analysis derives a state table from next-state equations, while design goes the other way. Counters and registers are the most common sequential building blocks.`,

    code: {
      title: 'Simulate a D flip-flop and a JK flip-flop',
      language: 'python',
      code: `class DFlipFlop:
    def __init__(self):
        self.q = 0
    def edge(self, d):
        self.q = d
        return self.q

class JKFlipFlop:
    def __init__(self):
        self.q = 0
    def edge(self, j, k):
        if j and k:
            self.q ^= 1
        elif j:
            self.q = 1
        elif k:
            self.q = 0
        return self.q

d = DFlipFlop()
print([d.edge(x) for x in [1, 1, 0, 0]])  # [1, 1, 0, 0]

jk = JKFlipFlop()
print([jk.edge(1, 0), jk.edge(0, 0), jk.edge(1, 1), jk.edge(1, 1)])  # [1, 1, 0, 1]`,

      explanation: 'Each edge method is the characteristic equation in code. The D flip-flop simply overwrites its state; the JK flip-flop checks the toggle case first, then set, then reset, then hold. The sequence shows the difference between level and edge behavior.',
    },

    diagram: {
      title: 'From SR latch to edge-triggered D flip-flop',
      caption: 'The D latch removes the forbidden state; the master–slave pair removes transparency.',
      mermaid: `flowchart LR
  SR[SR latch] --> D[D latch: S=D, R=D']
  D --> MS[Master-slave D flip-flop]
  MS --> E[Edge-triggered storage]
  E --> R[Registers]
  E --> C[Counters]
  E --> F[FSM state registers]`,
    },
  },

  'gate-cs-digital-logic-registers-counters-and-fsm-design': {
    intro: `Registers and counters are the storage and sequencing primitives of digital systems, and finite-state machines are the control structures that use them. A register holds a word; a shift register moves it one bit at a time; a counter walks through a prescribed sequence; an FSM maps inputs and current state to outputs and a next state. Designing an FSM is a complete exercise in digital logic: specify the behavior, draw the state diagram, minimize the states, encode them, choose flip-flops, derive the excitation and next-state equations, and implement the combinational logic.`,

    foundations: `An n-bit register is n D flip-flops with a common clock. A shift register adds a mode control: hold, shift left, shift right, or parallel load. A counter is a register whose next state is a function of the current state; a modulo-N counter has N valid states and returns to zero after N − 1. A ring counter circulates a single 1 through a shift register, giving n states. A Johnson counter feeds back the inverted output, giving 2n states. An FSM is Mealy if its output depends on the input, Moore if it depends only on the state. State minimization merges equivalent states; state encoding assigns binary codes; excitation tables translate the desired transitions into flip-flop inputs.`,

    concepts: [
      {
        title: 'Registers and shift registers',
        body: `A parallel register loads all bits at once and is used for temporary storage, pipeline registers, and register files. A shift register moves data one position per clock. Serial-in serial-out delays a bit stream by n cycles. Serial-in parallel-out converts a serial stream into an n-bit word, which is how a UART receives bytes. Parallel-in serial-out converts a word into a stream, which is how a UART transmits. A universal shift register supports hold, shift left, shift right, and parallel load under a mode select. The cost is n flip-flops plus a multiplexer in front of each flip-flop.`,
      },
      {
        title: 'Counters: ripple, synchronous, ring, and Johnson',
        body: `A ripple counter chains toggle flip-flops, so each stage clocks the next. It is simple but the output is valid only after all stages settle, and decoding intermediate states can produce glitches. A synchronous counter clocks every flip-flop together and computes the next state with combinational logic; it is faster and easier to decode. A modulo-N counter counts from 0 to N − 1 and then wraps. A ring counter shifts a single 1 around a register, producing n one-hot states. A Johnson counter shifts the inverted last bit into the first, producing 2n states with n flip-flops.`,
      },
      {
        title: 'FSM specification and state diagrams',
        body: `Start with a word description of the required input-output behavior. Identify the states as the distinct histories the machine must remember. For a sequence detector, each state represents the longest prefix of the target sequence seen so far. Draw a circle for each state and an arrow for each transition, labeled input/output for a Mealy machine or input for a Moore machine. Check every state for every input; a missing transition is an incomplete specification. Decide whether overlapping matches are allowed, because that changes the transition targets.`,
      },
      {
        title: 'State minimization and encoding',
        body: `Two states are equivalent when, for every input, they produce the same output and go to equivalent next states. Partition refinement starts with states grouped by output, then splits groups whose transitions lead to different groups, and repeats until stable. The remaining groups are the minimal states. State encoding assigns a binary code to each state. Binary encoding uses the fewest flip-flops; one-hot encoding uses one flip-flop per state and often simplifies the next-state logic. The choice affects gate count, speed, and power.`,
      },
      {
        title: 'Excitation tables and next-state logic',
        body: `An excitation table lists the flip-flop input values needed to make a desired transition. For a D flip-flop, D is simply the next state. For a JK flip-flop, 0→0 needs J=0, K=X; 0→1 needs J=1, K=X; 1→0 needs J=X, K=1; 1→1 needs J=X, K=0. For a T flip-flop, T = current state XOR next state. After choosing the flip-flop type, write the next-state table, substitute the excitation values, and use K-maps to minimize each input equation. Finally check unused states for self-starting behavior.`,
      },
      {
        title: 'Case study: sequence detector design',
        body: `A detector for the sequence 1011 must remember how much of the pattern has been seen. The states S0, S1, S2, S3 correspond to no prefix, 1, 10, and 101. On a 1 from S3, the machine has seen 1011 and outputs 1; it also moves to S1 because the final 1 can start a new overlapping match. On a 0 from S3, the last bits are 1010, whose longest suffix that is a prefix of 1011 is 10, so the machine moves to S2. This suffix rule is the key to correct overlapping detectors.`,
      },
    ],

    worked: [
      {
        title: 'Design a modulo-6 synchronous counter with D flip-flops',
        body: `Use three D flip-flops with state Q₂Q₁Q₀ and count 000, 001, 010, 011, 100, 101, then back to 000. The next-state equations are D₀ = Q₀′, D₁ = Q₂′Q₀, and D₂ = Q₂′Q₁Q₀ + Q₂Q₁′Q₀′. Check the sequence: 000 → 001, 001 → 010, 010 → 011, 011 → 100, 100 → 101, 101 → 000. The unused states 110 and 111 both go to 000 because all three D inputs evaluate to 0, so the counter is self-starting.`,
      },
      {
        title: 'Derive the equations for a 1011 Mealy detector',
        body: `Encode S0 = 00, S1 = 01, S2 = 10, S3 = 11. From the state table, D₀ = X, because the next least-significant state bit equals the current input in every transition. D₁ = Q₀X′ + Q₁Q₀′X. The output Y = Q₁Q₀X, which is 1 only in state S3 when the input is 1. Check the overlap: from S3 with X = 1, D₁ = 0 and D₀ = 1, so the next state is S1, not S0. The equations use two D flip-flops, one inverter, and a handful of gates.`,
      },
      {
        title: 'Design a 4-bit Johnson counter',
        body: `A 4-bit Johnson counter uses four D flip-flops in a shift register, with the inverted output of the last stage fed back to the first. Starting from 0000, the sequence is 0000, 1000, 1100, 1110, 1111, 0111, 0011, 0001, and back to 0000. There are 2n = 8 states, twice the number of flip-flops. The all-zeros and all-ones states are both used, unlike a ring counter, which uses only n states and requires a single 1 to start.`,
      },
      {
        title: 'Minimize a state table',
        body: `Suppose states A and B both output 0, and for inputs 0 and 1 they go to (A, C) and (B, C) respectively. Their next states are either themselves or the same state C, so they are equivalent and can be merged. Partition refinement starts with the output partition {A, B} and {C}, then checks transitions; if both A and B go to the same blocks for every input, the partition does not split. The merged state reduces the flip-flop count or simplifies the next-state logic.`,
      },
    ],

    exam: [
      {
        question: `How many states does an n-bit ring counter have, and how many does an n-bit Johnson counter have?`,
        answer: `A ring counter circulates a single 1 through n flip-flops, so it has n states. A Johnson counter feeds back the inverted last bit, so it has 2n states. Both use n flip-flops, but the Johnson counter uses twice as many of the 2ⁿ possible patterns. A ring counter must be initialized with exactly one 1; otherwise it stays in an invalid pattern.`,
      },
      {
        question: `Why does a Mealy machine often need fewer states than a Moore machine for the same sequence?`,
        answer: `A Moore output is attached to a state, so the machine must enter a dedicated state to assert the output. A Mealy output is attached to a transition, so the machine can assert the output while moving to the next state, without storing a separate output state. The Mealy machine saves a state but its output can change immediately with the input.`,
      },
      {
        question: `What is the excitation for a JK flip-flop making the transition from 1 to 0?`,
        answer: `The transition 1→0 is a reset, so J = X (don't care) and K = 1. The K = 1 input forces the next state to 0 regardless of J. The X means the designer can choose J to simplify the surrounding logic. For 0→0, J = 0 and K = X; for 0→1, J = 1 and K = X; for 1→1, J = X and K = 0.`,
      },
      {
        question: `How do you check that an FSM with unused states is self-starting?`,
        answer: `For each unused state, apply the next-state equations and see where it goes. If every unused state eventually reaches a valid state within a finite number of clocks, the machine is self-starting. If some unused state maps only to other unused states forever, the machine has a lockout and needs additional logic to force a reset. The check is part of the design, not an optional test.`,
      },
    ],

    cheat: [
      'n-bit register: n D flip-flops. Shift register modes: hold, left, right, parallel load.',
      'Modulo-N counter needs ceil(log₂N) flip-flops; unused states must be checked for lockout.',
      'Ring counter: n states. Johnson counter: 2n states. Both use n flip-flops.',
      'Mealy output = f(state, input); Moore output = f(state).',
      'FSM design: specification → state diagram → state table → minimization → encoding → excitation → K-maps → implementation.',
      'D excitation: D = Q⁺. T excitation: T = Q ⊕ Q⁺.',
      'JK excitation: 0→0 J=0,K=X; 0→1 J=1,K=X; 1→0 J=X,K=1; 1→1 J=X,K=0.',
      'Overlapping sequence detector: on a match, fall back to the longest suffix that is a prefix.',
    ],

    recap: `Registers store, shift registers move, and counters sequence. An FSM turns a word specification into a state diagram, then into a state table, then into flip-flop inputs and combinational logic. State minimization removes redundant history, encoding trades flip-flops for logic, and excitation tables connect the desired transition to the chosen flip-flop. The final check is behavioral: simulate every valid input sequence and every unused state.`,

    code: {
      title: 'Simulate the 1011 Mealy sequence detector',
      language: 'python',
      code: `def detector(bits):
    state = 0  # 0:S0, 1:S1, 2:S2, 3:S3
    outputs = []
    for x in bits:
        if state == 0:
            state = 1 if x else 0
            outputs.append(0)
        elif state == 1:
            state = 1 if x else 2
            outputs.append(0)
        elif state == 2:
            state = 3 if x else 0
            outputs.append(0)
        else:  # state == 3
            if x:
                state = 1
                outputs.append(1)
            else:
                state = 2
                outputs.append(0)
    return outputs

print(detector([1, 0, 1, 1, 0, 1, 1]))  # [0, 0, 0, 1, 0, 0, 1]`,

      explanation: 'The simulation mirrors the state table exactly. The second 1 in the last two bits produces another output because the detector overlaps matches: the final 1 of the first 1011 is also the first 1 of the next.',
    },

    diagram: {
      title: '1011 Mealy detector state diagram',
      caption: 'A match outputs 1 and falls back to S1 so overlapping matches are detected.',
      mermaid: `stateDiagram-v2
  [*] --> S0
  S0 --> S0: 0/0
  S0 --> S1: 1/0
  S1 --> S2: 0/0
  S1 --> S1: 1/0
  S2 --> S0: 0/0
  S2 --> S3: 1/0
  S3 --> S2: 0/0
  S3 --> S1: 1/1`,
    },
  },

  'gate-cs-digital-logic-computer-arithmetic': {
    intro: `Computer arithmetic is the study of how machines add, subtract, multiply, divide, and represent real numbers. Fixed-point arithmetic is fast and exact within its range; floating-point arithmetic covers a huge range at the cost of rounding. The arithmetic logic unit combines these operations with flags for zero, sign, carry, and overflow. Multiplication and division are iterative shift-and-add or shift-and-subtract processes, and modern processors pipeline and parallelize them.`,

    foundations: `Fixed-point numbers use a fixed binary point. Signed integers use two's complement, so addition and subtraction share hardware. Overflow occurs when the exact result does not fit in the destination width. Multiplication of two n-bit unsigned numbers produces up to 2n bits; signed multiplication needs sign extension and a correction for the sign. Division produces a quotient and a remainder; restoring division conditionally subtracts the divisor, and non-restoring division uses signed partial remainders. IEEE 754 represents floating-point numbers with a sign, a biased exponent, and a normalized significand.`,

    concepts: [
      {
        title: 'Fixed-point addition, subtraction, and flags',
        body: `Two's complement addition is bitwise addition with the final carry discarded. Subtraction is addition of the two's complement of the subtrahend. The zero flag Z is 1 when the result is all zeros. The sign flag N is the most significant bit of the result. The carry flag C is the carry out of the most significant bit for unsigned arithmetic. The overflow flag V is the XOR of the carry into the sign bit and the carry out of the sign bit for signed arithmetic. For 8 bits, 127 + 1 = 10000000, which is −128: the sign is wrong, so V = 1.`,
      },
      {
        title: 'Multiplication: shift-add and array multipliers',
        body: `Unsigned multiplication is repeated shift-and-add. For each bit of the multiplier from least significant to most significant, add the multiplicand shifted by that position if the bit is 1, then move to the next bit. An array multiplier lays out partial products and adds them with a tree of carry-save adders. A carry-save adder reduces three numbers to two without propagating carries, and a final carry-lookahead adder resolves the last two. The result of multiplying two n-bit numbers needs 2n bits; truncating it to n bits can overflow.`,
      },
      {
        title: 'Booth’s algorithm for signed multiplication',
        body: `Booth's algorithm recodes the multiplier into pairs of adjacent bits. The pair 00 or 11 means no operation, 01 means add the multiplicand, and 10 means subtract the multiplicand. After each operation, the combined accumulator and multiplier register is shifted arithmetically right. The recoding handles signed numbers uniformly and skips runs of identical bits, which can reduce the number of additions. For 3 × 2 with four-bit registers: multiplier 0010 produces one add and one subtract, and the final 8-bit product is 00000110.`,
      },
      {
        title: 'Division: restoring and non-restoring',
        body: `Restoring division shifts the remainder left, subtracts the divisor, and checks the sign. If the result is nonnegative, the quotient bit is 1 and the new remainder is kept; if it is negative, the quotient bit is 0 and the previous remainder is restored by adding the divisor back. Non-restoring division avoids the restore step by keeping a signed partial remainder; if the previous remainder was negative, it adds the divisor instead of subtracting, and the quotient bits are corrected at the end. Division by zero must be detected and reported.`,
      },
      {
        title: 'IEEE 754 floating-point representation',
        body: `Single precision uses 32 bits: 1 sign bit, 8 exponent bits with bias 127, and 23 fraction bits. A normalized nonzero value is (−1)ˢ × 1.f × 2^(E−127), where f is the 23-bit fraction. Double precision uses 64 bits: 1 sign, 11 exponent, 52 fraction, bias 1023. An exponent of all zeros represents zero or a denormal number; an exponent of all ones represents infinity or NaN. The leading 1 is implicit in normalized numbers, which gives 24 significant bits of precision in single precision.`,
      },
      {
        title: 'Floating-point arithmetic, rounding, and the ALU',
        body: `To add two floating-point numbers, align the exponents by shifting the smaller significand right, add or subtract the aligned significands, normalize the result, and round. Shifting can discard bits, so guard, round, and sticky bits preserve enough information for correct rounding. Multiplication multiplies the significands and adds the exponents, then normalizes and rounds. Rounding modes include round-to-nearest-even, round-toward-zero, round-up, and round-down. The ALU combines an adder, logic unit, and shifter; carry-lookahead or carry-select adders keep the critical path short.`,
      },
    ],

    worked: [
      {
        title: 'Detect signed overflow in 8-bit addition',
        body: `Add 127 and 1 in 8-bit two's complement. 127 = 01111111, 1 = 00000001. The sum is 10000000, which is −128. The carry into the sign bit is 1 (from the lower seven bits) and the carry out of the sign bit is 0, so V = 1 ⊕ 0 = 1. Now add −128 and −1: 10000000 + 11111111 = 101111111; discard the carry, leaving 01111111 = 127, again wrong, and V = 1. Adding 1 and −1 gives 00000000 with V = 0.`,
      },
      {
        title: 'Multiply 3 by 2 with Booth’s algorithm',
        body: `Use four-bit registers: multiplicand M = 0011, multiplier Q = 0010, accumulator A = 0000, and Q₋₁ = 0. Step 1: Q₀Q₋₁ = 00, no operation; arithmetic shift right gives A = 0000, Q = 0001, Q₋₁ = 0. Step 2: Q₀Q₋₁ = 10, so A = A − M = 1101; shift right gives A = 1110, Q = 1000, Q₋₁ = 1. Step 3: Q₀Q₋₁ = 01, so A = A + M = 0001; shift right gives A = 0000, Q = 1100, Q₋₁ = 0. Step 4: Q₀Q₋₁ = 00, no operation; shift right gives A = 0000, Q = 0110. The combined AQ is 00000110 = 6.`,
      },
      {
        title: 'Represent 12.5 in IEEE 754 single precision',
        body: `12.5 in binary is 1100.1. Normalize: 1.1001 × 2³. The sign is 0. The exponent is 3 + 127 = 130 = 10000010. The fraction is 1001 followed by 19 zeros. The 32-bit pattern is 0 10000010 10010000000000000000000. Grouping into hex: 0100 0001 0100 1000 0000 0000 0000 0000 = 0x41480000. The value is exact because 12.5 has a finite binary expansion.`,
      },
      {
        title: 'Why 1.0 + 2⁻²⁴ rounds to 1.0',
        body: `Single precision has 24 significant bits, so the gap between 1.0 and the next representable number is 2⁻²³. Adding 2⁻²⁴ is exactly half a unit in the last place. Under round-to-nearest-even, the tie goes to the even significand, which is 1.0, so the result is 1.0. Adding 2⁻²³ would produce the next representable number. This example shows that floating-point addition is not associative: (1.0 + 2⁻²⁴) + 2⁻²⁴ may differ from 1.0 + (2⁻²⁴ + 2⁻²⁴).`,
      },
      {
        title: 'Divide 7 by 3 with restoring division',
        body: `Use four-bit unsigned registers: dividend 0111, divisor 0011, remainder 0000. Shift the remainder left and bring down the next dividend bit. Subtract the divisor and test the sign. For 7 ÷ 3, the quotient is 0010 and the remainder is 0001. Restoring division performs four subtract-and-restore cycles for four-bit operands. The quotient bits are shifted into the quotient register from the most significant end, and the final remainder is the value left in the remainder register.`,
      },
    ],

    exam: [
      {
        question: `What are the exponent bias and significand precision of IEEE 754 single precision?`,
        answer: `Single precision uses 8 exponent bits with bias 127, and 23 fraction bits plus an implicit leading 1, giving 24 significant bits. The exponent field ranges from 0 to 255; 0 is reserved for zero and denormals, and 255 for infinity and NaN. Double precision uses 11 exponent bits with bias 1023 and 52 fraction bits plus the implicit 1, giving 53 significant bits.`,
      },
      {
        question: `How is signed overflow detected in two’s complement addition?`,
        answer: `Overflow occurs when the carry into the sign bit differs from the carry out of the sign bit. Equivalently, it occurs when two operands with the same sign produce a result with the opposite sign. Adding a positive and a negative number can never overflow. The overflow flag is V = C_in ⊕ C_out, while the carry flag C is simply the carry out of the most significant bit.`,
      },
      {
        question: `What multiplication operation does Booth recoding perform for the bit pair 10?`,
        answer: `The pair 10 means the multiplier changes from 0 to 1 as we scan, which corresponds to subtracting the multiplicand. The pair 01 means adding the multiplicand, and 00 or 11 means no operation. Booth recoding handles signed multipliers uniformly and can reduce the number of additions when the multiplier has long runs of identical bits.`,
      },
      {
        question: `Why is floating-point addition not associative?`,
        answer: `Each addition rounds to the nearest representable value. If a small number is added to a large one, the small number may be below the precision of the large one and disappear. Grouping the small numbers together first can preserve their sum and change the final result. The order of operations therefore matters, which is why parallel reductions use compensated summation or higher precision.`,
      },
    ],

    cheat: [
      'Two’s complement: negate by flipping bits and adding 1; discard the final carry.',
      'Overflow: carry into sign bit XOR carry out of sign bit; same-sign operands, opposite-sign result.',
      'Unsigned n-bit multiplication produces 2n bits; truncation can lose the high half.',
      'Booth pairs: 00/11 no op, 01 add multiplicand, 10 subtract multiplicand; then arithmetic shift.',
      'Restoring division: subtract, keep if nonnegative, restore if negative; quotient bit 1 or 0.',
      'IEEE single: 1 sign, 8 exponent (bias 127), 23 fraction; value = 1.f × 2^(E−127).',
      'IEEE double: 1 sign, 11 exponent (bias 1023), 52 fraction; 53 significant bits.',
      'Floating-point add: align exponents, add significands, normalize, round; guard/round/sticky bits.',
    ],

    recap: `Computer arithmetic is the bridge between Boolean logic and numerical computation. Fixed-point operations are exact within a range, and two's complement makes addition and subtraction uniform. Multiplication and division are iterative shift operations, with Booth and non-restoring variants reducing work. Floating point trades exactness for range, and every operation must align, normalize, and round. The flags produced by the ALU describe the result's meaning, not just its bits.`,

    code: {
      title: 'Two’s complement, overflow, and IEEE 754 bits',
      language: 'python',
      code: `import struct

def signed_add(a, b, bits=8):
    mask = (1 << bits) - 1
    raw = (a + b) & mask
    sign = 1 << (bits - 1)
    value = raw - (1 << bits) if raw & sign else raw
    carry_in = ((a & mask) + (b & mask)) >> (bits - 1) & 1
    carry_out = ((a & mask) + (b & mask)) >> bits & 1
    overflow = bool(carry_in ^ carry_out)
    return value, overflow

print(signed_add(127, 1))    # (-128, True)
print(signed_add(-128, -1))  # (127, True)
print(signed_add(1, -1))     # (0, False)

bits = struct.unpack(">I", struct.pack(">f", 12.5))[0]
print(hex(bits))             # 0x41480000`,

      explanation: 'The signed-add function computes the mathematical sum, truncates to the word size, and detects overflow from the two carries. The struct call exposes the actual IEEE 754 bit pattern, which can be checked against the hand calculation.',
    },

    diagram: {
      title: 'IEEE 754 single-precision layout',
      caption: 'One sign bit, eight biased exponent bits, twenty-three fraction bits.',
      mermaid: `flowchart LR
  S[Sign: 1 bit] --> E[Exponent: 8 bits, bias 127]
  E --> F[Fraction: 23 bits]
  F --> V[Value = (-1)^S × 1.F × 2^(E-127)]
  E --> Z[E=0: zero or denormal]
  E --> N[E=255: infinity or NaN]`,
    },
  },
};
