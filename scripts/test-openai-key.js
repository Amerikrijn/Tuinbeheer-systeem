// Simple script to verify the OPENAI_API_KEY by fetching the models endpoint
async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is missing');
    process.exit(1);
  }

  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      console.error(`OpenAI API request failed: ${res.status} ${res.statusText}`);
      process.exit(1);
    }

    console.log('OpenAI API key is valid');
  } catch (error) {
    console.error('Error testing OpenAI API key:', error);
    process.exit(1);
  }
}

main();

