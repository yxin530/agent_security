const profile = await getUser({ id: userId });
const systemPrompt = [{ role: 'system', content: JSON.stringify(profile) }];
const result = await openai.chat({ messages: systemPrompt });
