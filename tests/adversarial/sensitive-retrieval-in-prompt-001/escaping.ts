const profile = await getUser({ email: userEmail });
const systemPrompt = [{ role: 'system', content: JSON.stringify(profile) }];
const result = await openai.chat({ messages: systemPrompt });
