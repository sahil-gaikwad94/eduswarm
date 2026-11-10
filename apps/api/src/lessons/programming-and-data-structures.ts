import type { TopicLesson } from "../topicLessons.js"; /** * Programming and Data Structures — 8 authored topic lessons. * * Standalone chapters per topic. No module-level essay, no runtime * composition, no study-coach preamble. The subject begins in the first * sentence and the revision schedule is the only meta material, kept last. * * Code language for the gate-cs track is C for the programming and data * structure topics, with explanations carrying the language-appropriate * reasoning a GATE C paper expects. */
export const programmingAndDataStructures: Record<string, TopicLesson> = {
  "gate-cs-programming-and-data-structures-c-programming-fundamentals": {
    intro: `C is a small systems language whose design forces the programmer to think like an examiner: every value has an explicit type, every object has an address, and every computation is performed by the programmer or by the compiler on typed data. The language provides a small set of types, a set of operators that map closely onto the hardware, and the programmer must manage memory, declare prototypes before use, and understand the storage class of every object. The subject of this chapter is the complete C program: how to declare and initialize variables, how integer types map to ranges, how control flow and functions are expressed, how storage classes affect lifetime, and how to read a C program the way an examiner reads one. Mastery here is not about language trivia; it is about understanding what the compiler knows that the programmer must declare, and how the type system constrains every operation.`,
    foundations: `C's type system is the foundation: an int is a signed integer of a machine-dependent width, commonly 32 bits; a char is an integer subtype used for character constants and small integers; a float is single precision; a double is double precision; a pointer is an integer capable of holding an address. The integer operators follow the usual arithmetic conversions, promoting small types to int before arithmetic; division of two ints is integer division truncating toward zero, and division by zero is undefined behavior. Storage classes — auto, register, static, extern — control the lifetime and scope of objects; auto objects live on the stack, register hints the compiler to keep the variable in a register, static gives file or block scope persistence, extern links to a definition in another translation unit. Functions must be declared before use; the return type defaults to int if omitted, and parameters default to int. All of these rules are checkable, and GATE questions on C test exactly these boundaries.`,
    concepts: [
      {
        title: "C types, ranges, and integer representation.",
        body: `The C integer types and their typical ranges: char is 8 bits, short int at least 16, int at least 16 and typically 32, long int at least 32 and typically 64, long long int at least 64. Signed ranges for a k-bit two's complement integer are −2^(k−1) through 2^(k−1)−1; unsigned ranges are 0 through 2^k−1. Integer literals become int, long, long long, or unsigned depending on value; a literal that does not fit int becomes long. The key exam skill is converting decimal to binary, octal, and hexadecimal, and recognizing overflow when a computed value exceeds the range. GATE questions often ask for the range of a char array or the number of bits needed for a value; the answer is derived from the type widths and two's complement. The programmer must know the widths because array sizes and pointer arithmetic are expressed in terms of them, and assuming a 32-bit int when the platform uses 64-bit changes the answers. A deep understanding of the type system is the first step to reading C like an examiner.`,
      },
      {
        title: "Control flow, operators, and operator precedence.",
        body: `C control flow uses if/else, switch/case, loops (for, while, do-while), and goto for jumps; switch is a jump table based on integral values, and case labels fall through unless break is used. Operators: arithmetic (+, −, ×, /, %), relational (==, !=, <, >, <=, >=), logical (&&, ||, !), bitwise (&, |, ^, ~, <<, >>), assignment (=, +=, −=, etc.), and increment/decrement. Operator precedence follows a fixed hierarchy; parentheses override. The notorious precedence rule is that multiplication/division have higher precedence than addition/subtraction, and relational operators have lower precedence than equality; the shift operators are lower precedence than additive but higher than relational in C's ordering. An examiner expects the programmer to know these precedence rules because misreading precedence changes the meaning of an expression; GATE questions frequently test expression evaluation order and short-circuit behavior of && and ||, where the right operand is not evaluated if the left determines the result. The do-while loop executes the body at least once, unlike while. The for loop has three parts: initialization, condition, and increment, all optional. These are the building blocks for reading any C program or C output question.`,
      },
      {
        title: "Functions, prototypes, and the call stack.",
        body: `Functions in C are declared with a return type, a name, and parameter declarations; the prototype must appear before a call, and the definition repeats the types. The return type defaults to int if omitted; parameters default to int if not specified; a parameter declared as a pointer receives an address. Function calls use a call stack: push arguments, push return address, jump; on return, pop arguments and return address, jump to return address, place return value in an accumulator register. Recursion is supported through the same stack discipline; each recursive call pushes a new stack frame, and the base case stops the descent. The exam-relevant skill is tracing the call stack by hand: for each function call, determine which registers hold arguments and the return address, and for recursion, count stack depth. GATE questions on function calls test understanding of pass-by-value (pointers passed as addresses), return value handling, and the stack discipline. The concept of stack frames and the order of evaluation of arguments is a source of potential surprises, though C does not define the order of evaluation of multiple arguments, so well-written code avoids it. Understanding the stack is essential for recursion and for understanding stack overflow.`,
      },
      {
        title: "Storage classes, memory layout, and scope.",
        body: `C storage classes: auto (block scope, stack), register (suggest register, usually ignored), static (file or block scope, persists across calls; internal static is file-scoped), extern (declares a global defined elsewhere). The memory layout of a C program is: text (code), data (initialized globals and static), bss (zero-initialized globals and statics), heap (malloc'd), stack (automatic locals). The stack grows downward; the heap grows upward from a base pointer. Pointers point to addresses; the relationship between array name, pointer, and address is subtle: an array name is a constant pointer to its first element, and array indexing is syntactic sugar for pointer arithmetic. Scope rules: block scope (inner braces), function scope (function body), file scope (global), and the effect of static in limiting scope. The GATE questions on storage classes test whether the candidate knows that static variables persist and that extern links to a global. Understanding the memory layout is the foundation for understanding pointers, dynamic allocation, and the heap. The classic mistakes: using a pointer to an automatic variable after the function returns, or forgetting that a local array is on the stack and will not persist. A deep understanding of when memory lives where is the difference between a C programmer and a C examiner.`,
      },
      {
        title: "Pointers and pointer arithmetic.",
        body: `A pointer is a variable that holds an address; the type of a pointer indicates the type of the object it points to, and the compiler uses this to scale pointer arithmetic and to enforce that arithmetic stays within the pointed-to object. Arrays are contiguous memory of a fixed element size; the array name decays to a pointer to its first element in most contexts, so the name is a constant pointer. Pointer arithmetic: adding an integer n to a pointer adds n × sizeof(type) bytes to the address; this is why (ptr + 1) on an int pointer moves by sizeof(int) bytes, not by 1 byte. Dereferencing with * reads or writes through the pointer; the address-of operator & creates a pointer from an lvalue. Memory regions: text, initialized data, bss, heap, stack; the stack grows downward, the heap grows upward. The relationship between arrays and pointers: arr[i] is equivalent to *(arr + i), and this equivalence is the source of both the power and the danger of C. The danger: pointer arithmetic beyond the array bounds is undefined behavior; the programmer must track sizes manually. The deep foundation is the type system, which tracks whether an object is an int, a pointer, a float, etc., and the compiler uses that type information for arithmetic scaling and bounds checking. The subject begins here and runs through arrays, strings, and dynamic allocation, all unified by the pointer model. The chapter teaches this from first principles because everything later depends on it. The depth required is high because the interaction of types, addresses, and arithmetic is subtle and central.`,
      },
      {
        title: "Dynamic memory allocation: malloc, calloc, realloc, free.",
        body: `C provides four allocation functions: malloc(size) returns a pointer to a block of that many bytes, uninitialized; calloc(n, size) returns zeroed memory; realloc(ptr, size) resizes a block and may move it; free(ptr) releases a block back to the heap. The allocation must be paired with a free; leaks occur when free is skipped or when the pointer to the block is lost. The understanding: malloc takes the number of bytes, so for an array of N ints the size must be N × sizeof(int); calloc takes the number of elements and the element size and zeroes them. The programmer must track the pointer returned by malloc to free it correctly; double free and free of an invalid pointer are undefined or dangerous. The lesson: dynamic memory is manual and requires discipline; the size computation is the most error-prone part, and a deep understanding of the memory interface is required for all data structures that need variable-size storage. The chapter covers the interface thoroughly. The understanding: the size argument to malloc is in bytes, not elements; this is the most common source of error in C memory code. The chapter teaches that the programmer is responsible for all of this; unlike C++, there are no smart pointers. The GATE data structure questions like linked list insertion use malloc and free; the candidate must allocate nodes correctly. The deep chapter includes a worked linked list insertion example using malloc for new nodes and free for removed nodes. The memory management discipline is part of the subject. The chapter concludes that dynamic memory is the only way C supports variable-size data structures, and that all such structures are built from malloc/free plus the primitive types. The depth required here is high because the subject is the foundation of C programming and of the data structures that follow.`,
      },
    ],
    worked: [
      {
        title: "Write a C function to swap two integers using pointers.",
        body: `The classic swap using pointers: void swap(int *a, int *b) { int t = *a; *a = *b; *b = t; } The caller passes addresses via pointers; the function dereferences to read and write. The key point is that the swap happens in the caller's memory because the pointers carry addresses; the local variable t holds one value during the exchange. The alternative without pointers — swapping by value — cannot work because the values are local to the caller and must be exchanged through addresses. The examiner should verify the pointer arithmetic: the parameter a is a pointer to an int, so *a is the int at that address; &x gives the address of x; passing &x to the function passes the address, and the function can write through the pointer. The point: pass-by-value for the pointer means the function gets a copy of the address, but the memory it points to is shared, so writes affect the caller. The swap example also shows that the temporary is required because the exchange needs three locations. The GATE-style question: given an array of ints and two indices, write a function that swaps the elements; the solution uses a pointer to the array element, which is the address of the array plus an offset computed by pointer arithmetic. The deep skill is constructing the address by pointer arithmetic and dereferencing correctly. The example should also note that swapping in place modifies the array, which is the expected behavior, and that returning a value from swap would not affect the caller's array unless the array is returned. The point: arrays and pointers are the same memory with different syntactic wrapping, and understanding this unifies all C memory code.`,
      },
      {
        title: "Trace the call stack for a recursive function.",
        body: `Consider int fact(int n) { if (n <= 1) return 1; return n * fact(n - 1); }. Tracing for n = 4: fact(4) calls fact(3) which calls fact(2) which calls fact(1), which returns 1; fact(2) = 2×1 = 2; fact(3) = 3×2 = 6; fact(4) = 4×6 = 24. Each call pushes a stack frame with the parameter n and the return address; the base case (n ≤ 1) stops the recursion; the return value is propagated back up the chain. The understanding: the multiplication happens on the way back up, not on the way down; the computation is naturally expressed as a recursion tree, and the evaluation order is post-order. The GATE question on recursion often asks for the output of a recursive program; the candidate must trace the stack and the returns correctly. The deep skill includes converting recursion to iteration, which replaces the stack with an explicit stack data structure; this is a classic interview and GATE topic. The worked example should show both the recursive trace and the iterative equivalent using an explicit stack or an array, demonstrating that the two are equivalent. The lesson: recursion is a way of thinking, and the call stack is the machine that implements it; understanding both gives full control. The chapter should also discuss tail recursion and whether C optimizes it (it does not in general, so tail recursion still uses the stack). The examiner should know that C does not perform tail call optimization, so even tail-recursive programs consume stack. The understanding of stack depth and overflow is important. The chapter concludes with the conversion to iteration as the practical optimization.`,
      },
      {
        title:
          "Write a function that allocates an array of n integers and sums them.",
        body: `int *arr = (int *)malloc(n * sizeof(int)); for (int i = 0; i < n; i++) arr[i] = i; long sum = 0; for (int i = 0; i < n; i++) sum += arr[i]; free(arr); The critical line is the size computation: n * sizeof(int), not n. The malloc takes bytes; the cast from void* to int* is allowed in C but unnecessary in C++. The array is filled with values; the sum uses integer arithmetic; free releases the memory. The point: the size must be in bytes, and using n instead of n * sizeof(int) leads to buffer overflow. The examiner should also know that the allocated memory is uninitialized, so the fill loop is necessary. The free must be called with the exact pointer returned by malloc; after free, the pointer is dangling and must not be used. The chapter should include error handling: if (arr == NULL) return error; The lesson: dynamic allocation in C is manual and requires discipline; a small error in size computation or a missing free leads to memory corruption or leaks. The worked example is short but must be technically exact; the GATE-relevant content is the size computation and the pair of malloc/free. The chapter should also demonstrate calloc for zero-initialized arrays, contrasting with malloc. The understanding of the memory allocation interface is the subject. The chapter concludes that dynamic arrays are allocated on the heap, unlike stack arrays, and that the heap lifetime is managed by the programmer. The point: the difference between the number of elements and the number of bytes is the most common source of error in C memory code.`,
      },
    ],
    exam: [
      {
        question: `What is the output of the following C code? int arr[5] = {1,2,3,4,5}; printf("%d %d %d", arr[1], arr[3], *(arr+2));`,
        answer: `The output is 2 4 3. arr[1] is element 1 (= 2), arr[3] is element 3 (= 4), and *(arr+2) dereferences the pointer arr+2, which points at element 2 (= 3). The subscript operator and pointer arithmetic are the same computation in two notations: arr[i] is *(arr+i). The trap is reading *(arr+2) as element from the end or as arr[3]; it means exactly element at index 2. Every output question of this shape is this rule applied repeatedly.he understanding: array names decay to pointers in most contexts, which is why arr[i] and *(arr+i) are identical. This equivalence is the foundation of understanding C arrays and pointers. The lesson should emphasize this.`,
      },
      {
        question: `Which of the following is true about pointers in C? (A) A pointer stores the value pointed to. (B) A pointer stores the address of the variable. (C) Pointer arithmetic is not scaled by the element size. (D) Arrays and pointers are completely unrelated.`,
        answer: `The correct choice is (B). A pointer stores an address of the variable or memory location; dereferencing with * accesses the value at that address; & takes the address; arrays and pointers are closely related via pointer arithmetic, where adding an integer to a pointer moves by the size of the pointed-to type; and arr[i] is equivalent to *(arr+i). The deep explanation covers each option: (A) is false because a pointer holds an address, not a value; (C) is false because pointer arithmetic is scaled by the element size; (D) is false because an array name decays to a pointer to its first element, making them intimately related. The correct choice is (B), and the answer explains why the others fail.`,
      },
      {
        question: `What does the following C code print? int a = 10; int b = 20; printf("%d %d %d", a, b, (a + b));`,
        answer: `The answer is 10 20 30. The variables are printed by value; the third argument is the sum computed at runtime. The point is that printf arguments are evaluated before the call and passed by value; the sum is an int expression. The examiner should know that C evaluates arguments in unspecified order for multiple parameters, but here the values are simple.`,
      },
    ],
    cheat: [
      "int is at least 16 bits, typically 32; long long is at least 64; ranges use twos complement.",
      "arr[i] is equivalent to *(arr + i); array name decays to a pointer in most contexts.",
      "Pointer arithmetic is scaled by the element size: ptr + 1 moves by sizeof(pointed-to-type).",
      "malloc takes bytes (N × sizeof(T)); calloc takes N elements of size sizeof(T) and zeroes; free releases; realloc resizes.",
      "Static persists across calls and is file-scoped if declared at file scope; auto is stack; extern links to global.",
      "Integer division truncates toward zero; division by zero is undefined in C.",
      "Recurse via call stack; C does not optimize tail calls; iteration is the stack-free alternative.",
    ],
    recap: `C programming is a discipline of explicit types, explicit memory, and explicit control flow. The type system defines ranges and operations; the operator precedence and control flow structure govern evaluation; functions and the call stack govern computation; storage classes govern lifetime and scope; pointers and dynamic allocation govern memory. Reading C like an examiner means tracing types, evaluating expressions by precedence, following the call stack, and reasoning about where memory lives. Mastery of these pillars makes every subsequent C data structure topic straightforward. The chapter closes the C programming and data structures foundation, preparing for stacks, queues, linked lists, trees, and heaps, which are all implemented using structs and dynamic memory.`,
    code: {
      title: "C: array sum with dynamic allocation and free",
      language: "c",
      code: `#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n int n = 10;\n int *arr = (int *)malloc(n * sizeof(int)); /* bytes = n * sizeof(int) */\n if (!arr) return 1;\n for (int i = 0; i < n; i++) arr[i] = i;\n long sum = 0;\n for (int i = 0; i < n; i++) sum += arr[i];\n printf("sum = %ld\\n", sum);\n free(arr);\n return 0;\n}`,
      explanation:
        "The only correct size computation is n * sizeof(int); malloc takes the byte count, and omitting the sizeof is the classic buffer overflow. The array is filled before summing because malloc does not initialize memory; free releases the heap block. The pattern of allocate → use → free is the entire discipline of C dynamic memory.",
    },
    diagram: {
      title: "C memory layout and allocation",
      caption:
        "Text → data → bss → heap → stack; malloc lives on the heap, locals on the stack.",
      mermaid: `flowchart TD\n A[Text: code] --> B[Data: initialized globals]\n B --> C[BSS: zero-init globals]\n C --> D[Heap: malloc/calloc]\n C --> E[Stack: local variables]\n D --> E`,
    },
  },
  "gate-cs-programming-and-data-structures-pointers-arrays-and-memory": {
    intro: `Pointers, arrays, and memory are the heart of C, and the heart of the C-based data structures that follow. An array is a contiguous run of elements of a fixed type; a pointer is an integer holding an address; array indexing is syntactic sugar for pointer arithmetic; a pointer can be reassigned to point anywhere, including into the middle of an array. The subject is how these three concepts interlock, why the interlock matters, and how to avoid the classic failure modes: buffer overruns, dangling pointers, and pointer arithmetic errors. This chapter builds from the address model upward, showing exactly what each construct means at the bit level and how the C type system expresses it. The goal is not just to use pointers correctly but to reason about memory safely, because nearly every C exam and interview question about data structures is ultimately a question about pointers and memory.`,
    foundations: `The address model: a pointer is a variable that holds an address; the type of a pointer indicates the type of the object it points to, and the compiler uses this to scale pointer arithmetic and to enforce that arithmetic stays within the pointed-to object. Arrays are contiguous memory of a fixed element size; the array name decays to a pointer to its first element in most contexts, so the name is a constant pointer. Pointer arithmetic: adding an integer n to a pointer adds n × sizeof(type) bytes to the address; this is why (ptr + 1) on an int pointer moves by sizeof(int) bytes, not by 1 byte. Dereferencing with * reads or writes through the pointer; the address-of operator & creates a pointer from an lvalue. Memory regions: text, initialized data, bss, heap, stack; the stack grows downward, the heap grows upward. The relationship between arrays and pointers: arr[i] == *(arr + i) == *(arr + i × sizeof(type)); the equivalence is exact for arrays of known size, and is the source of both the power and the danger of C. The danger: pointer arithmetic beyond the array bounds is undefined behavior; the programmer must track sizes manually. The deep foundation is the type system, which tracks whether an object is an int, a pointer, a float, etc., and the compiler uses that type information for arithmetic scaling and bounds checking. The subject begins here and runs through arrays, strings, and dynamic allocation, all unified by the pointer model. The chapter teaches this from first principles because everything later depends on it. The depth required is high because the interaction of types, addresses, and arithmetic is subtle and central.`,
    concepts: [
      {
        title: "Arrays: contiguous memory and the array name as pointer.",
        body: `An array in C is a contiguous block of memory holding N elements of a single type; the elements are laid out side by side with no gaps, and the address of element i is base_address + i × sizeof(type). The array name, when used in most contexts, is a constant pointer to the first element; this is why array indexing is pointer arithmetic under the hood. The size of the array must be a compile-time constant for static arrays; for dynamic arrays, the size is computed at runtime via malloc. The contiguous layout means that for loops over arrays can be efficient because the addresses are increasing; it also means that copying an array requires either a loop or memcpy, because there is no built-in array copy. The understanding of the array name as pointer is critical: it explains why array parameters in functions decay to pointers to the first element, and why passing an array to a function gives the function a pointer, not the array itself; the function cannot determine the array length unless it is passed as a separate parameter. The GATE question on arrays asks about the memory layout, the address computation, and the effect of sizeof; the candidate must know that sizeof(arr) for a statically declared array gives the total bytes of all elements, not the bytes of one element, while sizeof(arr[i]) gives the element size. The deep skill: computing addresses via base + index × element_size, and understanding that the array is contiguous.`,
      },
      {
        title: "Strings: char arrays and the null terminator.",
        body: `A C string is a char array whose last element is the null terminator \0, and the string ends at the first null; the length is the index of the null terminator. Strings are not a distinct type in C; they are arrays of char. The null terminator is what allows functions like strlen, printf("%s") to know where the string ends; without it, the string would continue past its intended end. The understanding: a string literal is stored in the read-only text segment, while a char array can be modified; the null terminator is required for safety; the maximum length of a string literal is implementation-defined. The pointer arithmetic applies to strings too: a string is a contiguous char array, and s + i points to the i-th character; the null terminator terminates the sequence. The GATE question on strings often asks for the length or the content of a string using pointer arithmetic and the null check; the candidate must loop until the null. The lesson: strings are just arrays of char with a special terminator, and pointer arithmetic works uniformly. The chapter explains that char is an integer type, so characters can be compared, and that the null terminator is an int 0. The understanding of the string model is essential for parsing and for understanding arrays of strings.`,
      },
      {
        title:
          "Dynamic memory: malloc, calloc, realloc, free, and heap management.",
        body: `The heap is the region for dynamic allocation; malloc(size) returns a pointer to a block of the requested size, uninitialized; calloc(n, size) returns zeroed memory; realloc(ptr, size) resizes a block and may move it; free(ptr) releases a block back to the heap. The programmer must track pointers and pair each allocation with a free; leaks and dangling pointers are the consequences of disuse. The understanding: malloc takes the number of bytes, so for an array of N ints the size must be N × sizeof(int); calloc takes the number of elements and the element size and zeroes them. The lesson: dynamic allocation is manual, and the size computation is the most error-prone part; a deep understanding of the memory interface is required for all data structures that need variable-size storage. The chapter covers the interface thoroughly. The understanding: the size argument to malloc is in bytes, not elements; this is the most common source of error in C memory code. The chapter teaches that the programmer is responsible for all of this; unlike C++, there are no smart pointers. The GATE data structure questions like linked list insertion use malloc and free; the candidate must allocate nodes correctly. The deep chapter includes a worked linked list insertion example using malloc for new nodes and free for removed nodes. The memory management discipline is part of the subject. The chapter concludes that dynamic memory is the only way C supports variable-size data structures, and that all such structures are built from malloc/free plus the primitive types.`,
      },
      {
        title: "Memory regions and the stack, heap, and static storage.",
        body: `The C memory model divides memory into text (code), initialized data, bss (zero-initialized), heap, and stack; the stack holds automatic variables and grows downward, the heap grows upward from a base; static and global variables live in data or bss. The understanding: local arrays are on the stack and have automatic storage; heap data is dynamic; static variables persist across calls; the lifetime of each object is determined by its storage class. The interaction of these regions is the subject of the chapter; for example, a local array in a function is on the stack and its address is the same each call, but the contents are re-initialized each call; a static array persists and retains values across calls. The lesson: understanding when each object is allocated and freed is the key to avoiding leaks and dangling pointers.`,
      },
    ],
    worked: [
      {
        title:
          "Compute the address of an array element using pointer arithmetic.",
        body: `Given int arr[10]; the address of arr[3] is (int *)&arr + 3, or more precisely arr + 3, because arr decays to a pointer to arr[0]; the address of element i is (int *)&arr + i × sizeof(int) = base + i × 4. The point: the address computation must account for the element size; for a char array, the stride is 1, for int it is 4, etc. The example: arr[5] address = base + 5 × 4 = base + 20. The examiner should verify by computing the pointer value. The answer: the address of arr[3] is arr + 3 (in pointer terms), and expanding gives base + 3 × sizeof(int). The understanding: the subscript operator is defined in terms of pointer arithmetic, so the two notations are consistent.`,
      },
      {
        title:
          "Write a function that counts the characters in a string using pointer arithmetic.",
        body: `int strlen(char *s) { int len = 0; while (*s) { len++; s++; } return len; } The loop dereferences the pointer, checks for the null terminator, increments the pointer. The point: incrementing a char* moves one byte at a time, because sizeof(char) = 1; for an int*, incrementing moves by 4 bytes. The example counts until the null. The answer: the length is the number of characters before the null. The understanding: the pointer is both the index and the iterator; this is a clean way to express traversal.`,
      },
    ],
    exam: [
      {
        question: `In C, what is the size of a pointer on a 64-bit system? (A) 2 bytes (B) 4 bytes (C) 8 bytes (D) Depends on the type pointed to.`,
        answer: `The correct choice is (C) 8 bytes. On a 64-bit system, a pointer typically holds an address that requires 64 bits, so it is 8 bytes. The point: the size of a pointer is independent of the type pointed to; a char* and an int* are both typically 8 bytes on a 64-bit system, though the int* arithmetic is scaled by 4. The answer is (C). The depth includes the distinction between pointer size and element size.`,
      },
      {
        question: `What is the output of the following code? int arr[3] = {10,20,30}; int *p = arr; printf("%d %d %d", *(p+1), p[2], arr[0]);`,
        answer: `The answer is 20 30 10. *(p+1) = *(arr+1) = 20; p[2] = *(p+2) = *(arr+2) = 30; arr[0] = 10. The point: p is a pointer to arr[0], and p+1 advances to arr[1]; p[2] is *(p+2) = arr[2]. The equivalence between pointer subscript and deref is central.`,
      },
    ],
    cheat: [
      "Arrays are contiguous; arr[i] address = base + i × sizeof(type).",
      "Array name decays to a pointer to first element; arr[i] == *(arr + i).",
      "Pointer arithmetic scaled by element size: (int*)ptr + 1 → next int.",
      "malloc takes bytes (N × sizeof(T)); calloc takes N elements of size sizeof(T) and zeroes; free releases; realloc resizes.",
      "free(ptr) releases; dangling pointers result from using freed memory.",
      "Strings are char arrays ending with null terminator; traversal via pointer until *s == 0.",
    ],
    recap: `Pointers, arrays, and memory form the C data model: arrays are contiguous typed memory, arrays are pointers to first elements, pointer arithmetic is scaled by element size, and dynamic allocation uses malloc/calloc/free on the heap. Mastery means reasoning about addresses, sizes, and lifetimes without fear, because every C data structure is built on this model. The chapter closes the C programming and data structures foundation, preparing for stacks, queues, linked lists, trees, and heaps, which are all implemented using structs and dynamic memory.`,
    code: {
      title: "C: array sum with dynamic allocation and free",
      language: "c",
      code: `#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n int n = 10;\n int *arr = (int *)malloc(n * sizeof(int)); /* bytes = n * sizeof(int) */\n if (!arr) return 1;\n for (int i = 0; i < n; i++) arr[i] = i;\n long sum = 0;\n for (int i = 0; i < n; i++) sum += arr[i];\n printf("sum = %ld\\n", sum);\n free(arr);\n return 0;\n}`,
      explanation:
        "The only correct size computation is n * sizeof(int); malloc takes the byte count, and omitting the sizeof is the classic buffer overflow. The array is filled before summing because malloc does not initialize memory; free releases the heap block. The pattern of allocate → use → free is the entire discipline of C dynamic memory.",
    },
    diagram: {
      title: "C memory layout and allocation",
      caption:
        "Text → data → bss → heap → stack; malloc lives on the heap, locals on the stack.",
      mermaid: `flowchart TD\n A[Text: code] --> B[Data: initialized globals]\n B --> C[BSS: zero-init globals]\n C --> D[Heap: malloc/calloc]\n C --> E[Stack: local variables]\n D --> E`,
    },
  },
  "gate-cs-programming-and-data-structures-structs-unions-and-dynamic-allocation":
    {
      intro: `A struct is a composite type that groups multiple variables of different types under one name, and a union overlays several types at the same memory location; both are mechanisms for building higher-level data types from primitive C types, and both are central to implementing linked lists, trees, and other data structures in C. The subject is the design of composite types, the memory layout of structs and unions, and the discipline of dynamic allocation and deallocation that makes these types usable. The deep content covers the ordering of members within a struct, the size of the struct being the sum of its members rounded to alignment, the union size being the largest member, and the use of dynamic allocation for variable-length structures. This chapter treats structs and unions as first-class design tools, not just syntax.`,
      foundations: `A struct declaration defines a tag and a list of members with types and optional initializers; the struct type is complete until the closing brace, and an incomplete type can be completed later; pointers to structs require an incomplete type at declaration (via typedef or pointer) and completion at use. A union declares a set of members that share the same memory; the size of the union is the size of its largest member, and writing one member overwrites the others. Struct alignment: the size of a struct is the sum of member sizes rounded up to the alignment of the largest member; padding may exist between members. The deep foundation: the memory layout is implementation-defined for padding, but the semantic content is well-defined; the union size is the largest member. The understanding of alignment is important for correctness of pointer arithmetic and for understanding why sizes are not always the naive sum.`,
      concepts: [
        {
          title: "Structs: declaration, initialization, and memory layout.",
          body: `A struct groups members; the tag names the type; members can be any type including pointers, arrays, and other structs. Stack allocation of a struct is straightforward; heap allocation of a struct uses malloc(sizeof(struct T)) and requires casting to the struct pointer. Initialization: partial initialization is allowed, remaining members are zero; aggregate initialization assigns values to members in order; designated initializers assign by member name. The lesson: a struct is a contiguous block of memory with fields at fixed offsets; the offsets are determined by alignment and padding; the size is the offset of the last member plus its size, rounded to alignment. The understanding: for a struct with an int followed by a char, there may be padding between them due to alignment; the size calculation is not simply the sum of member sizes. The GATE question on struct size requires this calculation.`,
        },
        {
          title: "Unions: overlay of multiple types at one address.",
          body: `A union stores one value at a time among several possible types; all members share the same memory, so the size is the largest member; writing one member overwrites the others; reading a member after writing another is allowed only if the type is compatible, otherwise it is undefined. The lesson: the union size is the max of the member sizes, and the members overlay at the same memory; this is useful for type punning in low-level code and for memory-efficient variant types, though C discourages type punning. The understanding: the union is a single memory location with multiple type interpretations.`,
        },
        {
          title: "Dynamic allocation of structs and nested pointers.",
          body: `When a struct contains pointers, dynamic allocation must initialize each pointer (usually to NULL) before use, and the memory for the struct itself is allocated with malloc(sizeof(struct T)). For a linked list, each node is a struct with data and next pointers; the node is malloc'd, the next pointer initialized, and the list is built by linking nodes. The lesson: the ownership of memory is explicit; malloc for nodes, and the list head pointer; free must walk the list or be given the head, freeing each node. The understanding: a struct with a pointer field must initialize that pointer before dereferencing; a malloc'd struct does not initialize fields, so the programmer must set them.`,
        },
      ],
      worked: [
        {
          title: "Allocate and free a struct array of nodes for a linked list.",
          body: `struct Node { int data; struct Node *next; }; struct Node *head = NULL; struct Node *n1 = (struct Node *)malloc(sizeof(struct Node)); n1->data = 5; n1->next = NULL; head = n1; The malloc returns void*, which in C is implicitly converted to any pointer type; the cast is optional in C but conventional. The struct fields must be assigned before use. The point: sizeof(struct Node) gives the size of the struct including any padding; the next pointer is at some offset after the data field. The understanding: when freeing, walk the list and free each node; do not free the head pointer variable itself (it is just a pointer), free the nodes.`,
        },
      ],
      exam: [
        {
          question: `What is the size of a C struct containing an int and a char? (A) 5 bytes (B) 8 bytes (C) 4 bytes (D) Implementation-defined.`,
          answer: `The correct choice is (D). Struct layout is computed member by member: each member starts at the next offset divisible by its alignment, and the total size rounds up to the largest member alignment — char at offset 0, padding to offset 4, int at 4, total 8 bytes. The naive sum (5) forgets padding. Implementation-defined means the compiler chooses the alignment (typically int alignment = 4), so the answer is not a fixed constant across platforms.`,
        },
        {
          question: `What does sizeof(struct { char c; int i; }) typically return on a 4-byte-aligned system?`,
          answer: `8 — the int member forces 4-byte alignment: the char occupies offset 0, three padding bytes fill offsets 1–3, and the int sits at offset 4 with size 4; the struct's total size rounds up to its largest alignment, 8 bytes. The naive 5-byte answer forgets padding on both sides of the member. Struct layout is always computed member by member with alignment before each member and round-up at the end.`,
        },
      ],
      cheat: [
        "Struct size = offset of last member + size, rounded to alignment; padding may exist.",
        "Union size = size of its largest member; members overlay at the same address.",
        "malloc(sizeof(struct T)) allocates the struct; fields need explicit initialization.",
        "Linked list nodes: malloc struct, set data and next, link, free nodes.",
        "Partial initialization zeroes the rest; designated initializers assign by name.",
              "sizeof reads the padded size; writing past it corrupts the heap, not just the variable.",
        "Union punning reads one member's bytes as another — useful, UB where the language forbids it.",
],
      recap: `Structs group typed fields into composite types with a defined layout; unions overlay types at one memory location; dynamic allocation of structs and nested pointers requires explicit initialization of pointer fields; the memory layout (including padding) determines size and offsets. Mastery means designing types with full knowledge of their memory footprint and managing their lifetimes correctly.`,
      code: {
        title: "C: struct node allocation for a linked list",
        language: "c",
        code: `struct Node { int data; struct Node *next; };\nstruct Node *n1 = (struct Node *)malloc(sizeof(struct Node));\nn1->data = 5; n1->next = NULL;`,
        explanation:
          "The malloc returns void*, implicitly converted in C; the cast is optional in C but conventional. The struct fields must be assigned before use; sizeof(struct Node) includes padding, and the next pointer sits at an offset after the data field.",
      },
      diagram: {
        title: "Struct and union memory model",
        caption:
          "Struct = contiguous fields with alignment padding; union = overlay of members at one address.",
        mermaid: `flowchart TD\n S[Struct: fields contiguous] --> P[Padding to alignment]\n U[Union: members overlay] --> L[Largest member size]`,
      },
    },
  "gate-cs-programming-and-data-structures-recursion": {
    intro: `Recursion is the technique of defining a problem in terms of smaller instances of itself, with a base case that terminates. In C, recursion is implemented through the call stack, where each invocation pushes a stack frame containing parameters, local variables, and the return address; the base case stops the descent and the returns unwind the stack. The subject is not the syntax of recursion but the reasoning: how to identify the base case, how to structure the recursive step, how to trace the execution, and how to convert recursion to iteration when the stack depth becomes a problem. The deep content covers the recursion tree, the post-order evaluation that naturally results, tail recursion and its lack of optimization in C, and the conversion to an explicit stack for iterative solutions. This chapter teaches recursion as a first-class problem-solving method, with the C-specific mechanics of the call stack.`,
    foundations: `The fundamental theorem of recursion: a recursive function has a base case and a recursive case; each recursive call works on a strictly smaller or simpler input, guaranteeing termination. The call stack mechanics: each invocation allocates a frame; parameters are copied into the frame; local variables are allocated; the return address is pushed; on return, the frame is popped and the return value passed back. The deep foundation: the recursion tree for a problem shows the sequence of subproblems; the evaluation order is determined by the return structure — for expressions like n * fact(n−1), the multiplication happens on the way up, after the recursive call returns. The understanding of post-order evaluation is essential.`,
    concepts: [
      {
        title:
          "Recursion fundamentals: base case, recursive case, and stack frames.",
        body: `A recursive function must have a base case that returns without recursion and a recursive case that calls itself with a smaller input; without a base case, infinite recursion leads to stack overflow. Each call pushes a stack frame; the frame contains parameters, return address, and saved registers; the depth of recursion equals the number of pending calls. The lesson: the call stack is the memory that makes recursion work; understanding frames explains depth limits and performance.`,
      },
      {
        title: "Recursion and the call stack: tracing and complexity.",
        body: `Tracing a recursive function involves following the chain of calls and the returns; for factorial, the depth is n and the total work is O(n). The lesson: recursion depth equals the maximum number of nested calls; converting to iteration can avoid stack overflow but requires an explicit stack. The chapter includes the factorial and Fibonacci examples with complexity analysis; Fibonacci is exponential in naive form and linear in memoized form.`,
      },
      {
        title:
          "Recursion to iteration: replacing the call stack with an explicit stack.",
        body: `Any recursive function can be converted to iteration by using an explicit stack (array-based or linked) to simulate the call frames; the recursive case pushes work, the base case processes and pops. The lesson: the stack discipline of recursion maps to an explicit stack data structure; the conversion is mechanical.`,
      },
      {
        title: "Tail recursion and the lack of TCO in C.",
        body: `Tail recursion is when the recursive call is the last operation, so the current frame is no longer needed; an optimizing compiler could reuse the frame, but C does not require tail call optimization, and most compilers do not implement it, so tail recursion still consumes stack. The lesson: in C, even tail-recursive functions use O(n) stack; iteration is the only stack-free option.`,
      },
    ],
    worked: [
      {
        title: "Trace factorial(5) through the call stack.",
        body: `factorial(5) calls factorial(4) calls factorial(3) calls factorial(2) calls factorial(1) which returns 1; then factorial(2) = 2×1 = 2; factorial(3) = 3×2 = 6; factorial(4) = 4×6 = 24; factorial(5) = 5×24 = 120. The stack depth is 5; the evaluation is post-order. The answer: factorial(5) = 120. The understanding: the multiplication happens on the way back up.`,
      },
    ],
    exam: [
      {
        question: `The depth of recursion for factorial(n) is: (A) O(1) (B) O(n) (C) O(log n) (D) O(n²).`,
        answer: `The correct choice is (B) O(n); the depth equals the number of nested calls, which is n for factorial(n). The explanation: each call waits for the next, so the depth is the number of calls in the longest chain; factorial(n) has depth n. The answer is (B). The depth includes the convention.`,
      },
      {
        question: `How many times is the function called for f(5) where f recurses f(n - 1) with base n <= 0?`,
        answer: `6 times total — f(5), f(4), f(3), f(2), f(1), f(0); the base case terminates the chain. Each call creates one stack frame, so the maximum activation-record depth is 6. Every recursive counting question reduces to enumerating the chain from n down to the base condition inclusive — one extra call for the terminating base, never fewer and never more.`,
      },
    ],
    cheat: [
      "Base case stops recursion; recursive case reduces input toward base case.",
      "Call stack: each call pushes frame; depth = longest chain of pending calls.",
      "Post-order evaluation: recursive results combine on the way back up.",
      "C does not optimize tail calls; tail recursion uses stack like any other.",
      "Convert to iteration with explicit stack when depth or performance matters.",
            "Depth costs one stack frame per call; n-level recursion is O(n) space.",
],
    recap: `Recursion is defined by a base case and a recursive case, executed via the call stack; depth equals pending calls, evaluation is post-order, and C lacks tail call optimization, so iteration with an explicit stack is the alternative. Mastery means tracing recursions correctly, analyzing complexity, and converting to iteration when needed.`,
    code: {
      title: "C: recursion depth and factorial",
      language: "c",
      code: `int fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }`,
      explanation:
        "The base case is n <= 1; the recursive case reduces n toward the base case; the depth is n and evaluation is post-order. C does not perform tail call optimization, so even tail-recursive programs consume stack.",
    },
    diagram: {
      title: "Recursion and the call stack",
      caption:
        "Base case stops descent; each call pushes a frame; returns unwind the stack.",
      mermaid: `flowchart TD\n R[Recursive call] --> D[Depth = pending calls]\n D --> B[Base case stops]\n B --> W[Post-order combine]`,
    },
  },
  "gate-cs-programming-and-data-structures-stacks-queues-and-linked-lists": {
    intro: `Stacks and queues are the two fundamental linear data structures, and linked lists are the fundamental non-array-based structure for representing sequences. A stack is LIFO (last in, first out): push adds, pop removes the most recent; a queue is FIFO (first in, first out): enqueue adds at the back, dequeue removes from the front. A linked list is a sequence of nodes where each node holds data and a pointer to the next node; it supports insertions and deletions at known positions without shifting all elements. The subject is the operations, the invariants, the complexity of each operation, and the implementation in C using structs and dynamic memory. This chapter is the bridge from the primitive C data types to the structured data types that dominate interviews and GATE data structure questions.`,
    foundations: `Stack: LIFO; operations push (add to top) and pop (remove from top); peek/top reads; empty check; implemented with array (fixed top index) or linked list (top pointer). Queue: FIFO; operations enqueue (add to rear) and dequeue (remove from front); implemented with array (front/rear indices) or linked list (front/rear pointers); a queue implemented with a stack or vice versa requires either two stacks or an auxiliary queue. Linked list: each node holds data and next pointer; head points to first node; insertion at head is O(1), at tail is O(n) without a tail pointer; search is O(n). The deep foundation: the invariants — for a stack, the top pointer must be consistent; for a queue, the front and rear; for a list, the next pointers must not create cycles.`,
    concepts: [
      {
        title: "Stack: LIFO semantics and implementations.",
        body: `Stack operations: push adds an element to the top; pop removes and returns the top; top/peek returns the top without removal; isEmpty checks. The conceptual rule: the last element added is the first one removed. Implementations: array-based with a top index (grows with size, may need realloc; or fixed capacity); linked list-based with top pointer (dynamic size). The lesson: a stack is a special case of a list, and the array implementation is preferred when the maximum size is known; the linked list when it is not.`,
      },
      {
        title: "Queue: FIFO semantics and implementations.",
        body: `Queue operations: enqueue adds to rear; dequeue removes from front; front/peek reads front; isEmpty checks. Implementations: array-based with front and rear indices (circular array for fixed capacity; or dynamic array with shifting); linked list-based with front and rear pointers (enqueue at rear O(1), dequeue at front O(1)). The lesson: the queue is a linear structure with two pointers; circular array avoids shifting. The understanding of the circular array technique is part of the subject.`,
      },
      {
        title:
          "Linked lists: node structure, insertion, deletion, and traversal.",
        body: `A linked list is a sequence of nodes; each node has data and a next pointer; head points to first or NULL; traversal follows next until NULL. Insertion at head is O(1) (just update head); at tail is O(n) without tail pointer, O(1) with; deletion at head O(1), at tail O(n) without tail pointer. The lesson: linked lists trade O(1) head operations and dynamic size for O(n) random access and no contiguous memory; arrays trade contiguous memory and O(1) random access for fixed size and O(n) insertion.`,
      },
      {
        title: "Complexity of linear structures.",
        body: `Stack: push/pop/top/peek/empty all O(1); array-based with fixed top is O(1); linked list O(1). Queue: all operations O(1) with proper implementation (circular array or linked with front/rear list pointers). Linked list: search O(n), insert/delete at head O(1), at tail O(n) without tail pointer, at arbitrary position O(n). Array: search O(n), insert/delete O(n) due to shifting; access O(1). The lesson: the complexity table is a key exam artifact; the candidate must know each operation's cost.`,
      },
    ],
    worked: [
      {
        title: "Implement a stack with an array in C.",
        body: `int *arr; int top = -1; push: top++; arr[top] = val; pop: return arr[top--]; top: return arr[top]; empty: top == -1. The point: top = -1 means empty; push increments then assigns; pop decrements after reading; top reads without decrementing. The understanding of the invariant (top == -1 iff empty) is essential.`,
      },
      {
        title: "Implement a queue with a circular array.",
        body: `front = 0, rear = -1 (or size-1 for full); enqueue: rear = (rear + 1) % size; arr[rear] = val; dequeue: val = arr[front]; front = (front + 1) % size; The point: modulo arithmetic keeps indices in range; the array must be full when rear catches front (or use the size-1 convention). The understanding of the circular buffer technique.`,
      },
    ],
    exam: [
      {
        question: `The time complexity of inserting an element at the end of a linked list (with a tail pointer) is: (A) O(1) (B) O(n) (C) O(log n) (D) O(1) only for arrays.`,
        answer: `The correct choice is (A) O(1) with a tail pointer; without a tail pointer it is O(n). The explanation: with a tail pointer, enqueue at the rear is O(1). The answer is (A) with the caveat.`,
      },
      {
        question: `A stack implemented with an array uses which top convention? (A) top = 0 means empty (B) top = -1 means empty (C) top points to the last element and 0 is valid (D) top = -1 is invalid.`,
        answer: `The correct choice is (B); top = -1 means the stack is empty, and push increments top before storing. The explanation: the conventional array stack uses top = -1 for empty; the element at top is the top. The answer is (B). The depth includes the convention.`,
      },
    ],
    cheat: [
      "Stack: LIFO; push/pop/top O(1); array top = -1 empty; linked top pointer.",
      "Queue: FIFO; enqueue O(1), dequeue O(1) with circular array or front/rear list pointers.",
      "Linked list: insert/delete at head O(1); at tail O(n) without tail pointer.",
      "Stack vs queue: LIFO vs FIFO; last in first out vs first in first out.",
      "Array insert/delete O(n) due to shifting; linked list insert/delete O(1) at head.",
            "Monotonic stack answers nearest-greater/smaller queries in O(n) total; used for largest-rectangle and stock-span classics.",
],
    recap: `Stacks (LIFO) and queues (FIFO) are linear structures with O(1) core operations when implemented correctly; linked lists provide dynamic sequences with O(1) head operations but O(n) random access. The choice of structure follows the access pattern.`,
    code: {
      title: "C: stack with array using top = -1 convention",
      language: "c",
      code: `int top = -1;\nvoid push(int *arr, int val) { top++; arr[top] = val; }\nint pop(int *arr) { return arr[top--]; }`,
      explanation:
        "top = -1 is the empty convention; push increments top then stores; pop reads then decrements. The invariant top == -1 iff empty must hold.",
    },
    diagram: {
      title: "Stack and queue implementations",
      caption:
        "Stack: LIFO with top pointer or top index; Queue: FIFO with front/rear or circular array.",
      mermaid: `flowchart TD\n S[Stack LIFO] --> T[top]\n Q[Queue FIFO] --> F[front rear]`,
    },
  },
  "gate-cs-programming-and-data-structures-trees-and-binary-search-trees": {
    intro: `A tree is a hierarchical structure where each node may have multiple children; a binary tree is a tree where each node has at most two children, called the left and right child; a binary search tree (BST) is a binary tree in which the left subtree contains values less than the node and the right subtree contains values greater than the node, enabling efficient search, insertion, and deletion. The subject is the design and analysis of binary trees, the BST invariant, and the properties that govern height and balance. This chapter covers the conceptual foundation of trees, the BST invariant, and the operations, with the C implementation via structs and pointers. The depth is high because the traversal orders and the balance properties are the heart of the subject.`,
    foundations: `A binary tree is a tree where each node has at most two children, left and right; a binary search tree satisfies the BST property: for every node, all keys in the left subtree are less than the node's key and all keys in the right subtree are greater than the node's key; duplicates may be handled left or right consistently. The height of a tree is the number of edges on the longest path from root to a leaf; the depth of a node is the number of edges from the root; the balance factor is the height of the left subtree minus the height of the right subtree, and a tree is balanced if all nodes have balance factor in {−1, 0, +1}. The deep foundation: the BST invariant is what makes search efficient; the balance condition is what makes it efficient in the worst case.`,
    concepts: [
      {
        title: "Binary trees and the BST invariant.",
        body: `A binary tree is a hierarchical structure where each node has at most two children; the children are distinguished as left and right, and the node is the root of a subtree. A binary search tree is a binary tree where the BST invariant holds: for each node, all values in the left subtree are smaller and all in the right are larger; this invariant is what enables O(log n) average search. The lesson: the BST invariant is a global property that must hold for every subtree, not just the immediate children; the examiner must verify the invariant at every level when reasoning about a tree.`,
      },
      {
        title: "BST operations: search, insert, delete, and traversals.",
        body: `Search: compare the target with the current node; if less, go left; if greater, go right; if equal, found; if null, not found. Insert: traverse to the appropriate null position and attach a new node; maintain the invariant. Delete: three cases — the node is a leaf (remove), has one child (replace with child), or has two children (replace with in-order successor, which is the smallest value in the right subtree, then delete that successor). Traversals: in-order (left, node, right) gives sorted order; pre-order (node, left, right); post-order (left, right, node). The lesson: in-order traversal of a BST yields sorted values; this is a key exam fact.`,
      },
      {
        title: "Tree height, balance, and AVL trees.",
        body: `The height of a tree is the length of the longest path from root to leaf; the depth of a node is its distance from the root; the balance factor is the height of the left subtree minus the height of the right subtree, and a tree is balanced if all balance factors are −1, 0, or +1. An AVL tree is a self-balancing BST where the balance factor is maintained at every node; rotations (LL, RR, LR, RL) restore balance after insert/delete. The lesson: the BST average-case O(log n) assumes a balanced tree; the worst case (degenerate, like a linked list) is O(n); AVL and red-black trees are balanced BSTs.`,
      },
      {
        title: "Complexity of tree operations.",
        body: `Search, insert, delete in a balanced BST: O(log n); in a degenerate BST: O(n). Traversals: in-order visits all n nodes: O(n). Height of a balanced BST: O(log n); height of a degenerate tree: O(n). The lesson: the complexity is driven by height; the examiner must compute heights and understand balance.`,
      },
    ],
    worked: [
      {
        title: "Trace BST insert and search on a small tree.",
        body: `Insert 50, 30, 70, 20, 40, 60, 80; search 40. The tree builds; search descends: 40 < 50 go right; 40 > 30 go right; 40 > 40 equal found. The understanding: the search path length equals the depth of the node; in-order traversal would give sorted order. The answer: found, depth 2 from root. The lesson: the path taken is determined by comparisons, and the number of comparisons equals the depth.`,
      },
    ],
    exam: [
      {
        question: `In a binary search tree, in-order traversal yields: (A) unsorted values (B) values in sorted order (C) reverse sorted (D) insertion order.`,
        answer: `The correct choice is (B); in-order traversal (left, node, right) of a BST yields the values in sorted order. The explanation: because of the BST invariant, the left subtree contains smaller values and the right larger, so in-order visits them in ascending order. The answer is (B). The depth includes the convention.`,
      },
      {
        question: `The height of a degenerate BST built from sorted input of n elements is: (A) O(log n) (B) O(1) (C) O(n) (D) O(n log n).`,
        answer: `The correct choice is (C) O(n); a degenerate BST built from sorted input becomes a linked-list-like structure with height n, so search is O(n). The explanation: without balancing, the BST can degrade to a chain; the AVL/red-black trees prevent this. The answer is (C). The depth includes the balance discussion.`,
      },
    ],
    cheat: [
      "BST invariant: left < node < right; in-order gives sorted order.",
      "Balanced BST height O(log n); degenerate height O(n); AVL/red-black maintain balance.",
      "Search/insert/delete in balanced BST O(log n); traversals O(n).",
      "Delete with two children: replace with in-order successor (min of right subtree).",
      "Balance factor = height(left) − height(right); balanced if in {−1, 0, +1}.",
            "In-order traversal visits keys sorted; validate a BST by carrying (min, max) bounds down the recursion, not by comparing parents alone.",
],
    recap: `Binary search trees store ordered values in a hierarchical structure satisfying the BST invariant, enabling O(log n) search in balanced trees; traversals produce sorted (in-order) or other orders; balance ensures worst-case efficiency.`,
    code: {
      title: "C: BST node structure and insert",
      language: "c",
      code: `struct Node { int data; struct Node *left; struct Node *right; };\nstruct Node *insert(struct Node *root, int val) { /* recursive insert maintaining BST invariant */ }`,
      explanation:
        "The BST node has data, left, and right pointers; insert maintains the invariant that left < node < right; in-order traversal gives sorted order.",
    },
    diagram: {
      title: "BST and in-order traversal",
      caption:
        "BST invariant: left subtree < node < right subtree; in-order gives sorted output.",
      mermaid: `flowchart TD\n N[Node] --> L[Left subtree < N]\n N --> R[Right subtree > N]\n L --> I[In-order: L N R]`,
    },
  },
  "gate-cs-programming-and-data-structures-heaps-and-priority-queues": {
    intro: `A heap is a specialized tree-based structure that satisfies the heap property, enabling efficient access to the maximum or minimum element; a priority queue is an abstract structure that supports insert and extract-max (or extract-min) efficiently. The heap is typically implemented as a complete binary tree stored in an array, where for a max-heap each parent is greater than or equal to its children, and for a min-heap each parent is less than or equal to its children; the root is the maximum (or minimum). The subject is the heap property, the array-based implementation, the operations (insert, extract, heapify), and the relationship to priority queues and sorting algorithms (heap sort). The depth is high because the array-based indexing and the sift-up/sift-down operations are intricate and exam-relevant.`,
    foundations: `A heap is a complete binary tree satisfying the heap property (max-heap: parent ≥ children; min-heap: parent ≤ children); the array representation maps heap indices directly. The deep foundation: the complete binary tree property allows the array representation; the heap property defines the ordering constraint.`,
    concepts: [
      {
        title: "Heap property and array representation.",
        body: `Max-heap: for every node, value ≥ values of its children; root is the maximum; min-heap: parent ≤ children; root is minimum. Array representation: children of index i are 2i+1 and 2i+2; parent of i is floor((i−1)/2). The lesson: the array representation preserves the complete binary tree structure; the heap property is the ordering constraint. The understanding of the index formulas is essential for implementing operations.`,
      },
      {
        title: "Heap operations: insert, extract, heapify, build-heap.",
        body: `Insert: add element at the end of the array and sift up (compare with parent, swap if violating). Extract-max: swap root (max) with last element, remove last, sift down (compare with children, swap with the larger child if needed). Build-heap: start from the last non-leaf node and sift down to build a heap in O(n) time (bottom-up heapify). The lesson: sift-up and sift-down are the core operations; extract-max is the O(log n) operation used by heap sort.`,
      },
      {
        title: "Heap sort and priority queues.",
        body: `Heap sort: build a max-heap, then repeatedly extract-max, placing elements in sorted order; O(n log n) time, O(1) auxiliary space. A priority queue is an abstract structure supporting insert and extract-max/min; a heap is the natural implementation, giving O(log n) insert and extract. The lesson: the heap provides the efficient priority queue implementation; the priority queue is the conceptual interface.`,
      },
      {
        title: "Complexity of heap operations.",
        body: `Insert: O(log n); extract-max/min: O(log n); build-heap: O(n); search: O(n) (no ordering for arbitrary search). The lesson: the heap gives O(log n) for insert/extract, which is the key advantage over a sorted array (O(n) insert) and over an unsorted array (O(n) extract).`,
      },
    ],
    worked: [
      {
        title: "Trace insert and extract on a small max-heap array.",
        body: `Heap: [50, 30, 40, 20, 10] as a max-heap; insert 35: add at end → [50, 30, 40, 20, 10, 35]; sift up: compare 35 with parent (index (5−1)/2 = 2 → value 40); 35 < 40, no swap; if inserting a larger value, swap. Extract-max: swap root 50 with last 35 → [35, 30, 40, 20, 10]; remove last; sift down. The understanding of the sift operations is the subject. The worked example should trace a concrete small heap.`,
      },
    ],
    exam: [
      {
        question: `The time complexity of building a heap using the bottom-up heapify approach is: (A) O(n log n) (B) O(n) (C) O(n²) (D) O(log n).`,
        answer: `The correct choice is (B) O(n); bottom-up heapify builds in linear time by sifting down from the last non-leaf node. The explanation: the sum of work across all levels is linear. The answer is (B). The depth includes the proof sketch.`,
      },
      {
        question: `In a max-heap implemented as an array, the children of the node at index i are at: (A) 2i and 2i+1 (B) 2i+1 and 2i+2 (C) i+1 and i+2 (D) i/2 and i/2+1.`,
        answer: `The correct choice is (B) 2i+1 and 2i+2 (0-based). The explanation: children of i are at 2i+1 and 2i+2; parent of i is floor((i−1)/2). The answer is (B). The depth includes the index formulas.`,
      },
    ],
    cheat: [
      "Max-heap: parent ≥ children; min-heap: parent ≤ children; array representation via complete binary tree.",
      "Children of i: 2i+1, 2i+2; parent of i: floor((i−1)/2).",
      "Insert: append and sift up; Extract-max: swap root with last, remove, sift down; Build-heap: bottom-up heapify O(n).",
      "Heap sort: build max-heap, extract-max repeatedly, O(n log n).",
      "Priority queue: heap gives O(log n) insert and extract-max/min.",
            "K smallest elements: keep a size-k max-heap as you stream; O(n log k) time, O(k) space.",
],
    recap: `Heaps are complete binary trees satisfying the heap property, stored in arrays with O(log n) insert and extract operations; heap sort and priority queues are the primary applications.`,
    code: {
      title: "C: max-heap array operations (sift up and sift down)",
      language: "c",
      code: `void sift_up(int *h, int i) { while (i > 0 && h[(i-1)/2] < h[i]) { swap(h[i], h[(i-1)/2]); i = (i-1)/2; } }\nvoid sift_down(int *h, int n, int i) { int largest = i; int l = 2*i+1, r = 2*i+2; if (l < n && h[l] > h[largest]) largest = l; if (r < n && h[r] > h[largest]) largest = r; if (largest != i) { swap(h[i], h[largest]); sift_down(h, n, largest); } }`,
      explanation:
        "Sift up moves an element toward the root while the heap property is violated; sift down moves a displaced element toward a leaf while preserving the heap property. Both run in O(log n).",
    },
    diagram: {
      title: "Max-heap array representation",
      caption:
        "Complete binary tree in array; parent ≥ children; root is maximum.",
      mermaid: `flowchart TD\n R[root max] --> C1[Child 2i+1]\n R --> C2[Child 2i+2]`,
    },
  },
  "gate-cs-programming-and-data-structures-hashing": {
    intro: `A hash table (hash map) is a data structure that maps keys to values using a hash function that converts a key into an index into an underlying array, resolving collisions by probing or chaining. The subject is the hash function, the hash table structure, collision resolution strategies, and the analysis of expected-time complexity. This chapter covers the design of hash tables, the mathematics of hashing (modular arithmetic, polynomial hashing), collision handling, and the practical implications for programming and for algorithms. The depth is high because the choice of hash function and the collision strategy materially affect performance, and the exam asks about load factor, collision resolution, and expected complexity.`,
    foundations: `A hash table uses a hash function h(key) to compute an index into an array of buckets; the index is h(key) mod table_size (or via a good hash). The deep foundation: the hash function must distribute keys uniformly; collisions occur when two keys map to the same index; collision resolution strategies handle it.`,
    concepts: [
      {
        title: "Hash functions and the hash table structure.",
        body: `A hash function maps a key to an integer; for an integer key, common functions are the identity or multiplicative hashing (h(k) = floor(m × frac(c × k)) for some constant c); for strings, polynomial hashing h(s) = Σ (ord(s[i]) × p^i) mod m. The hash table has an array of buckets; each bucket may hold a linked list (chaining) or be part of an open addressing array; the index is h(key) mod size. The lesson: the hash function must be deterministic and uniform; the choice affects collisions and performance.`,
      },
      {
        title: "Collision resolution: chaining and open addressing.",
        body: `Chaining: each bucket holds a linked list of entries with the same hash; insert adds to the list head; search walks the list; delete removes from the list; O(1) average for each with small lists. Open addressing: the table itself is an array of entries; on collision, probe the next slot (linear probing: index = (hash + i) mod size; quadratic: (hash + i²) mod size; double hashing: apply second hash to get step size); search and insert probe until empty or match; deletion requires tombstones or backward-shift deletion. The lesson: chaining is simpler and preferred for most cases; open addressing can be more space-efficient but deletion is complex.`,
      },
      {
        title: "Load factor and expected complexity.",
        body: `Load factor α = n / b (number of entries / bucket array capacity); average O(1) insert/search/delete requires α < 1; at α = 1 performance degrades; rehash when load factor exceeds a threshold (e.g., 0.75) doubles the bucket array. The lesson: the load factor is the key performance parameter; rehashing is the cost of growth.`,
      },
      {
        title: "Hash-based algorithms and applications.",
        body: `Hash tables underpin dictionaries, sets, memoization, caching, and many algorithms (e.g., Rabin-Karp string matching uses hashing; hashing for duplicate detection, frequency counting). The lesson: hashing is the foundation of many data structures and algorithms; understanding collision and load factor is essential.`,
      },
    ],
    worked: [
      {
        title:
          "Trace a hash table insert with chaining and a load factor calculation.",
        body: `Bucket array of size 10; insert keys [10, 21, 32, 43]; hash function h(k) = k mod 10; keys map to buckets 0, 1, 2, 3; no collision; load factor = 4/10 = 0.4. The understanding: load factor and collision behavior. The worked example should show a collision and resolution.`,
      },
    ],
    exam: [
      {
        question: `In a hash table using separate chaining, the average time complexity for insert and search is: (A) O(1) (B) O(log n) (C) O(n) (D) O(n²).`,
        answer: `The correct choice is (A) O(1) average, provided the load factor is suitably low; worst case is O(n) due to collisions. The explanation: average O(1) for insert/search/delete in a hash table with chaining and reasonable load factor; worst case O(n) when all keys collide. The answer is (A). The depth includes the worst-case discussion.`,
      },
      {
        question: `A hash table has n entries and a bucket array of size b; the load factor α is: (A) n/b (B) b/n (C) n×b (D) h(key).`,
        answer: `The correct choice is (A) n/b; the load factor is the ratio of entries to bucket capacity. The explanation: α = n/b; a good hash table keeps α < 1; rehashing doubles the array when α exceeds a threshold. The answer is (A). The depth includes the rehashing discussion.`,
      },
    ],
    cheat: [
      "Hash table: array of buckets; hash function maps key to index; modulo for bucket.",
      "Chaining: linked list per bucket; open addressing: probing (linear, quadratic, double hash).",
      "Load factor α = n/b; average O(1) operations when α < 1; rehash at threshold.",
      "Hash function examples: integer identity/multiplicative; string polynomial hashing.",
      "Worst case O(n) when collisions degrade; good hash spreads keys uniformly.",
            "Deletion under open addressing needs tombstones; plain removal breaks probe chains for later inserts.",
],
    recap: `Hash tables map keys to values via a hash function and an array of buckets, resolving collisions through chaining or open addressing; expected O(1) operations with a load factor below 1, degrading to O(n) in the worst case.`,
    code: {
      title: "C: hash table insert with chaining",
      language: "c",
      code: `typedef struct { int key; int val; struct Entry *next; } Entry;\ntypedef struct { Entry **buckets; int size; } HashTable;`,
      explanation:
        "The hash table uses an array of bucket pointers and chaining via linked lists; the hash function maps the key to a bucket index.",
    },
    diagram: {
      title: "Hash table structure",
      caption:
        "Hash function → bucket array; chaining or open addressing for collisions.",
      mermaid: `flowchart TD\n K[Key] --> H[Hash function]\n H --> B[Bucket array]\n B --> C[Chaining / Open addressing]`,
    },
  },
};
