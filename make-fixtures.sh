#!/bin/bash
mkdir -p tests/fixtures/xss-react-dangerouslySetInnerHTML-001
echo "<div dangerouslySetInnerHTML={{ __html: userContent }} />" > tests/fixtures/xss-react-dangerouslySetInnerHTML-001/tp.tsx
echo "<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />" > tests/fixtures/xss-react-dangerouslySetInnerHTML-001/tn.tsx

mkdir -p tests/fixtures/sql-injection-nextjs-001
echo "const query = \`SELECT * FROM users WHERE email = '\${req.body.email}'\`;" > tests/fixtures/sql-injection-nextjs-001/tp.ts
echo "const users = await prisma.user.findMany();" > tests/fixtures/sql-injection-nextjs-001/tn.ts

mkdir -p tests/fixtures/missing-nextjs-auth-001
echo "export async function POST(request: Request) { return Response.json({ success: true }); }" > tests/fixtures/missing-nextjs-auth-001/tp.ts
echo "export async function POST(request: Request) { const session = await getServerSession(authOptions); return Response.json({ success: true }); }" > tests/fixtures/missing-nextjs-auth-001/tn.ts

mkdir -p tests/fixtures/nextjs-open-redirect-001
echo "import { redirect } from 'next/navigation'; export async function GET(req) { const url = req.nextUrl.searchParams.get('url'); redirect(url); }" > tests/fixtures/nextjs-open-redirect-001/tp.ts
echo "import { redirect } from 'next/navigation'; export async function GET(req) { const url = req.nextUrl.searchParams.get('url'); if (url.startsWith('/')) redirect(url); }" > tests/fixtures/nextjs-open-redirect-001/tn.ts

mkdir -p tests/fixtures/nextjs-exposed-env-001
echo "NEXT_PUBLIC_API_SECRET=sk-live-xxx" > tests/fixtures/nextjs-exposed-env-001/tp.env
echo "API_SECRET=sk-live-xxx" > tests/fixtures/nextjs-exposed-env-001/tn.env

mkdir -p tests/fixtures/sql-injection-py-001
echo "query = f\"SELECT * FROM users WHERE username = '{request.args.get('user')}'\"" > tests/fixtures/sql-injection-py-001/tp.py
echo "query = \"SELECT * FROM users WHERE username = %s\"" > tests/fixtures/sql-injection-py-001/tn.py

mkdir -p tests/fixtures/command-injection-js-001
echo "const { exec } = require('child_process'); exec(req.query.cmd);" > tests/fixtures/command-injection-js-001/tp.ts
echo "const { execFile } = require('child_process'); execFile('ls', ['-l']);" > tests/fixtures/command-injection-js-001/tn.ts

mkdir -p tests/fixtures/command-injection-py-001
echo "import os; os.system(request.form['cmd'])" > tests/fixtures/command-injection-py-001/tp.py
echo "import subprocess; subprocess.run(['ls', '-l'])" > tests/fixtures/command-injection-py-001/tn.py

mkdir -p tests/fixtures/xss-php-001
echo "<?php echo \$_GET['x']; ?>" > tests/fixtures/xss-php-001/tp.php
echo "<?php echo htmlspecialchars(\$_GET['x']); ?>" > tests/fixtures/xss-php-001/tn.php

mkdir -p tests/fixtures/xss-reflected-py-001
echo "from flask import render_template_string, request; render_template_string(f\"Hello {request.args.get('name')}\")" > tests/fixtures/xss-reflected-py-001/tp.py
echo "from flask import render_template_string, request, escape; render_template_string(escape(f\"Hello {request.args.get('name')}\"))" > tests/fixtures/xss-reflected-py-001/tn.py

mkdir -p tests/fixtures/pii-in-logs-java-001
echo "logger.info(\"User IC: \" + user.getIc());" > tests/fixtures/pii-in-logs-java-001/tp.java
echo "logger.info(\"User logged in\");" > tests/fixtures/pii-in-logs-java-001/tn.java

mkdir -p tests/fixtures/pii-in-logs-cs-001
echo "_logger.LogInformation(\$\"User email: {email}\");" > tests/fixtures/pii-in-logs-cs-001/tp.cs
echo "_logger.LogInformation(\"Process started\");" > tests/fixtures/pii-in-logs-cs-001/tn.cs

mkdir -p tests/fixtures/ssrf-pattern-py-001
echo "import requests; requests.get(request.args.get('url'))" > tests/fixtures/ssrf-pattern-py-001/tp.py
echo "import requests; if is_allowed(url): requests.get(url)" > tests/fixtures/ssrf-pattern-py-001/tn.py

mkdir -p tests/fixtures/ssrf-pattern-go-001
echo "http.Get(r.URL.Query().Get(\"url\"))" > tests/fixtures/ssrf-pattern-go-001/tp.go
echo "if isAllowed(url) { http.Get(url) }" > tests/fixtures/ssrf-pattern-go-001/tn.go

mkdir -p tests/fixtures/weak-cipher-py-001
echo "import hashlib; hashlib.md5(b\"password\")" > tests/fixtures/weak-cipher-py-001/tp.py
echo "import hashlib; hashlib.sha256(b\"password\")" > tests/fixtures/weak-cipher-py-001/tn.py

mkdir -p tests/fixtures/insecure-random-java-001
echo "String token = String.valueOf(new Random().nextLong());" > tests/fixtures/insecure-random-java-001/tp.java
echo "String token = String.valueOf(new SecureRandom().nextLong());" > tests/fixtures/insecure-random-java-001/tn.java

mkdir -p tests/fixtures/nosql-injection-js-001
echo "db.collection('users').find(req.body)" > tests/fixtures/nosql-injection-js-001/tp.ts
echo "const validated = schema.validate(req.body); db.collection('users').find(validated)" > tests/fixtures/nosql-injection-js-001/tn.ts

mkdir -p tests/fixtures/missing-rate-limit-java-001
echo "@PostMapping(\"/login\") public void login() {}" > tests/fixtures/missing-rate-limit-java-001/tp.java
echo "@RateLimiter(name=\"login\") @PostMapping(\"/login\") public void login() {}" > tests/fixtures/missing-rate-limit-java-001/tn.java

mkdir -p tests/fixtures/missing-rate-limit-py-001
echo "@app.route(\"/login\") def login(): pass" > tests/fixtures/missing-rate-limit-py-001/tp.py
echo "@limiter.limit(\"5 per minute\") @app.route(\"/login\") def login(): pass" > tests/fixtures/missing-rate-limit-py-001/tn.py

