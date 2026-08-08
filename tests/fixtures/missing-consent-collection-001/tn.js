const schema = new Schema({
  nric: String,
  email: String,
  phone: String,
  consentGiven: { type: Boolean, required: true }
});
