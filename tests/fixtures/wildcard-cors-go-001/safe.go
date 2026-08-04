package main
func h(w http.ResponseWriter) { w.Header().Set("Access-Control-Allow-Origin", "https://example.com") }
