package main
func routes() { http.Handle("/login", rateLimit(loginHandler)) }
