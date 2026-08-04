package main
func h(w http.ResponseWriter) { w.Header().Set("Access-Control-Allow-Origin", "*"); w.Header().Set("Access-Control-Allow-Credentials", "true") }
