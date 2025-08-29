const fs = require('fs');
const path = require('path');

module.exports = function(results) {
  // Ensure the test-results directory exists
  const testResultsDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }

  // Create a Jest-compatible results object
  const jestResults = {
    numTotalTests: results.numTotalTests,
    numPassedTests: results.numPassedTests,
    numFailedTests: results.numFailedTests,
    numPendingTests: results.numPendingTests,
    numTotalTestSuites: results.numTotalTestSuites,
    numPassedTestSuites: results.numPassedTestSuites,
    numFailedTestSuites: results.numFailedTestSuites,
    testResults: results.testResults.map(suite => ({
      name: suite.name,
      status: suite.status,
      message: suite.message,
      assertionResults: suite.assertionResults?.map(test => ({
        name: test.title,
        status: test.status,
        failureMessages: test.failureMessages || [],
        duration: test.duration
      })) || []
    }))
  };

  // Save the results to a JSON file
  const outputPath = path.join(testResultsDir, 'jest-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(jestResults, null, 2));

  console.log(`✅ Test results saved to: ${outputPath}`);
  console.log(`📊 Total tests: ${jestResults.numTotalTests}`);
  console.log(`✅ Passed: ${jestResults.numPassedTests}`);
  console.log(`❌ Failed: ${jestResults.numFailedTests}`);
  console.log(`⏸️ Pending: ${jestResults.numPendingTests}`);

  // Return the original results so Jest continues normally
  return results;
};