// Test script for letter code generation

function generateNextLetterCode(existingCodes) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Try single letters first (A, B, C, etc.)
  for (const letter of alphabet) {
    if (!existingCodes.includes(letter)) {
      return letter;
    }
  }
  
  // If all single letters are used, try double letters (AA, AB, AC, etc.)
  for (const firstLetter of alphabet) {
    for (const secondLetter of alphabet) {
      const code = `${firstLetter}${secondLetter}`;
      if (!existingCodes.includes(code)) {
        return code;
      }
    }
  }
  
  // If all double letters are also used (very unlikely), start with AAA, AAB, etc.
  // But limit to prevent infinite loops
  for (let i = 0; i < 1000; i++) {
    const code = `A${i + 1}`;
    if (!existingCodes.includes(code)) {
      return code;
    }
  }
  
  // Fallback - should never reach here
  return `X${Date.now()}`;
}

// Test cases
console.log('Testing letter code generation:\n');

// Test 1: Empty list
console.log('Test 1 - Empty list:');
console.log('Next code:', generateNextLetterCode([]));
console.log('Expected: A\n');

// Test 2: Some letters used
console.log('Test 2 - A, B, C used:');
console.log('Next code:', generateNextLetterCode(['A', 'B', 'C']));
console.log('Expected: D\n');

// Test 3: All single letters used
console.log('Test 3 - All single letters (A-Z) used:');
const allSingleLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
console.log('Next code:', generateNextLetterCode(allSingleLetters));
console.log('Expected: AA\n');

// Test 4: Some double letters used
console.log('Test 4 - A-Z and AA, AB used:');
const withSomeDouble = [...allSingleLetters, 'AA', 'AB'];
console.log('Next code:', generateNextLetterCode(withSomeDouble));
console.log('Expected: AC\n');

// Test 5: Skip to AZ
console.log('Test 5 - A-Z and AA-AY used:');
const upToAY = [...allSingleLetters];
for (let i = 0; i < 25; i++) {
  upToAY.push('A' + String.fromCharCode(65 + i));
}
console.log('Next code:', generateNextLetterCode(upToAY));
console.log('Expected: AZ\n');

// Test 6: After AZ, should be BA
console.log('Test 6 - A-Z and AA-AZ used:');
const upToAZ = [...allSingleLetters];
for (let i = 0; i < 26; i++) {
  upToAZ.push('A' + String.fromCharCode(65 + i));
}
console.log('Next code:', generateNextLetterCode(upToAZ));
console.log('Expected: BA\n');

// Test performance - no infinite loop
console.log('Test 7 - Performance test (should complete quickly):');
const start = Date.now();
const manyUsed = [];
// Add A-Z
for (let i = 0; i < 26; i++) {
  manyUsed.push(String.fromCharCode(65 + i));
}
// Add AA-ZZ (676 codes)
for (let i = 0; i < 26; i++) {
  for (let j = 0; j < 26; j++) {
    manyUsed.push(String.fromCharCode(65 + i) + String.fromCharCode(65 + j));
  }
}
console.log(`Testing with ${manyUsed.length} existing codes...`);
const nextCode = generateNextLetterCode(manyUsed);
const elapsed = Date.now() - start;
console.log('Next code:', nextCode);
console.log(`Time taken: ${elapsed}ms`);
console.log(elapsed < 100 ? '✅ PASS - No infinite loop detected' : '❌ FAIL - Too slow');