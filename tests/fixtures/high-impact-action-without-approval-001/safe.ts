if (await approvalGate('charge', { amount, userId })) {
  await stripe.charges.create({ amount, currency: 'usd', source: token });
}
