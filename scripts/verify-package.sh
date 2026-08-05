#!/bin/sh
set -eu
repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT
echo "Packing source artifact"
tarball=$(cd "$repo_root" && npm pack --silent)
tarball_path="$repo_root/$tarball"
cleanup_tarball() { rm -f "$tarball_path"; }
trap 'cleanup_tarball; rm -rf "$tmp_dir"' EXIT
echo "Installing into clean directory: $tmp_dir"
cd "$tmp_dir"
npm init -y >/dev/null
npm install "$tarball_path" >/dev/null
package_root="$tmp_dir/node_modules/@yxin530/agent-security-engine"
node "$package_root/dist/engine/loader.js" --validate
node "$package_root/dist/engine/test-runner.js"
source_rule_count=$(find "$repo_root/rules" -name '*.yaml' | wc -l | tr -d ' ')
installed_rule_count=$(find "$package_root/dist/rules" -name '*.yaml' | wc -l | tr -d ' ')
if [ "$source_rule_count" -ne "$installed_rule_count" ]; then
  echo "Rule bundle mismatch: source=$source_rule_count installed=$installed_rule_count" >&2
  exit 1
fi
node "$package_root/bin/agent-security.js" --version
node "$package_root/bin/agent-security.js" --help || true
node "$package_root/bin/agent-security.js" scan --target "$package_root/tests/fixtures/hardcoded-secret-001" --format json || test $? -eq 1
node "$package_root/dist/monitor/cli.js" --help
echo "Packed artifact verification passed"
