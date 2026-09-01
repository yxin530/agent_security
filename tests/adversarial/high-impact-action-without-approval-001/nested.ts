async function executeAction(amount: number) {
  await stripe.charges.create({ amount, currency: 'usd', source: token });
}
