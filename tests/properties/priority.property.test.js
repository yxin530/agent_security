const fc = require('fast-check'); const assert = require('node:assert/strict'); const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path'); const test = require('node:test'); const { scan } = require('../../dist/engine/scan');
function check(rule, extension, vulnerable, safe) { const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-security-property-')); fs.writeFileSync(path.join(root, `v.${extension}`), vulnerable); fs.writeFileSync(path.join(root, `s.${extension}`), safe); const findings = scan(path.resolve(__dirname, '../../rules'), root); assert.ok(findings.some(f => f.ruleId === rule && f.file.startsWith('v.'))); assert.ok(!findings.some(f => f.ruleId === rule && f.file.startsWith('s.'))); }
test('hardcoded secret generated prefixes', () => fc.assert(fc.property(fc.integer(), value => check('hardcoded-secret-001', 'ts', `const password = "sk_live_A1b2C3d4${Math.abs(value)}";`, 'const password = process.env.PASSWORD;')), { numRuns: 20 }));
test('SQL injection generated identifiers', () => fc.assert(fc.property(fc.integer({ min: 1, max: 99999 }), value => check('sql-injection-js-001', 'ts', `db.query(\`SELECT * FROM users WHERE id = \${user${value}}\`);`, 'db.query("SELECT * FROM users WHERE id = ?", [id]);')), { numRuns: 20 }));
test('unrestricted code execution generated input', () => fc.assert(fc.property(fc.stringMatching(/[A-Za-z]{2,10}/), value => check('unrestricted-code-exec-001', 'json', JSON.stringify({ shell: true, code: value }), JSON.stringify({ shell: false, allowlist: ['git status'] }))), { numRuns: 20 }));

test('SQL injection PHP generated cases', () => fc.assert(fc.property(
  fc.constantFrom('raw', 'whereRaw', 'selectRaw'),
  fc.stringMatching(/^[a-z_]{2,8}$/),
  (method, varName) => {
    // 1. Laravel
    check('sql-injection-php-001', 'php', 
      `DB::${method}("SELECT * FROM users WHERE id = $${varName}");`, 
      `DB::${method}("SELECT * FROM users WHERE id = ?", [$${varName}]);`);
    check('sql-injection-php-001', 'php', 
      `DB::${method}('SELECT * FROM users WHERE id = '.$${varName});`, 
      `DB::${method}('SELECT * FROM users WHERE id = ?', [$${varName}]);`);
      
    // 2. Heredoc
    check('sql-injection-php-001', 'php', 
      `$sql = <<<SQL\nSELECT * FROM users WHERE id = {$${varName}}\nSQL;\n$db->query($sql);`, 
      `$sql = <<<SQL\nSELECT * FROM users WHERE id = :id\nSQL;\n$db->prepare($sql);`);

    // 3. wpdb
    check('sql-injection-php-001', 'php', 
      `$wpdb->query("SELECT * FROM users WHERE id = $${varName}");`, 
      `$wpdb->query($wpdb->prepare("SELECT * FROM users WHERE id = %d", $${varName}));`);

    // 4. mysqli_query
    check('sql-injection-php-001', 'php', 
      `mysqli_query($conn, "SELECT * FROM users WHERE id = $${varName}");`, 
      `$stmt = mysqli_prepare($conn, "SELECT * FROM users WHERE id = ?");`);
  }
), { numRuns: 20 }));

test('SQL injection Go generated cases', () => fc.assert(fc.property(
  fc.constantFrom('Query', 'Exec'),
  fc.stringMatching(/^[a-z_]{2,8}$/),
  (method, varName) => {
    // 1. Sprintf
    check('sql-injection-go-001', 'go', 
      `db.${method}(fmt.Sprintf("SELECT * FROM users WHERE id = %s", ${varName}))`, 
      `db.${method}("SELECT * FROM users WHERE id = ?", ${varName})`);

    // 2. String concatenation
    check('sql-injection-go-001', 'go', 
      `query += " AND col = '" + ${varName} + "'" \n db.${method}(query)`, 
      `query += " AND col = ?" \n db.${method}(query, ${varName})`);

    // 3. GORM Raw / Where
    check('sql-injection-go-001', 'go', 
      `db.Raw(fmt.Sprintf("SELECT * FROM users WHERE id = %s", ${varName}))`, 
      `db.Raw("SELECT * FROM users WHERE id = ?", ${varName})`);

    check('sql-injection-go-001', 'go', 
      `db.Where("id = " + ${varName})`, 
      `db.Where("id = ?", ${varName})`);

    // 4. sqlx
    check('sql-injection-go-001', 'go', 
      `sqlx.NamedQuery(fmt.Sprintf("SELECT * FROM users WHERE id = %s", ${varName}), arg)`, 
      `sqlx.NamedQuery("SELECT * FROM users WHERE id = :id", arg)`);
  }
), { numRuns: 20 }));
