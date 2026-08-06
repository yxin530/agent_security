export class RateLimiter {
  private timestamps: Map<string, number[]> = new Map();

  constructor(private limitPerMinute: number) {}

  checkLimit(clientId: string): boolean {
    const now = Date.now();
    const windowStart = now - 60000;
    
    let userTimestamps = this.timestamps.get(clientId) || [];
    userTimestamps = userTimestamps.filter(t => t > windowStart);
    
    if (userTimestamps.length >= this.limitPerMinute) {
      this.timestamps.set(clientId, userTimestamps);
      return false;
    }
    
    userTimestamps.push(now);
    this.timestamps.set(clientId, userTimestamps);
    return true;
  }
}
