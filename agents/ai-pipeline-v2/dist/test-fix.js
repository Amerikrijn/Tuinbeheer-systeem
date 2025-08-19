"use strict";
// Test file for code fixing functionality
// This file contains various issues that should be detected and fixed
function testFunction() {
    // Missing return type
    return "test";
}
function anotherFunction() {
    // Missing return type
    console.log("Hello world"); // console.log should be removed
    return 42;
}
function thirdFunction() {
    // Missing return type
    var x = 10; // var should be const
    let y = 20;
    y = y; // Unnecessary assignment
    return x + y;
}
// TODO: Add more tests
// FIXME: This is a test file
// HACK: Temporary code
const array = [1, 2, 3, 4, 5];
for (let i = 0; i < array.length; i++) {
    // Should use for...of
    console.log(array[i]);
}
array.forEach(function (item) {
    // Should use arrow function
    console.log(item);
});
const obj = new Object(); // Should use {}
const arr = new Array(); // Should use []
// Unused variable
const unusedVar = "this is never used";
// Missing error handling
function riskyFunction() {
    const result = Math.random();
    if (result > 0.5) {
        throw new Error("Random error");
    }
    return result;
}
// Async function without await
async function asyncFunction() {
    const promise = Promise.resolve("hello");
    return promise; // Should await or return directly
}
//# sourceMappingURL=test-fix.js.map