#!/usr/bin/env bash
# End-to-end auth test. Assumes the dev server is running and the DB is seeded.
#   BASE=http://localhost:3000 ./scripts/test-auth.sh
set -u

BASE="${BASE:-http://localhost:3000}"
PASS=0
FAIL=0

CJAR=$(mktemp)   # customer cookie jar
AJAR=$(mktemp)   # admin cookie jar
EMAIL="test_$(date +%s)_${RANDOM}@example.com"

check() { # description  expected  actual
  if [ "$2" = "$3" ]; then
    echo "  PASS: $1 (got: $3)"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: $1 (expected: $2, got: $3)"
    FAIL=$((FAIL + 1))
  fi
}

echo "Testing against $BASE"
echo "Using throwaway email: $EMAIL"
echo

# 1. Register a new customer (also logs them in via Set-Cookie)
echo "1) Customer registration"
REG=$(curl -s -c "$CJAR" -w $'\n%{http_code}' -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"password123\"}")
check "register returns 201" 201 "$(echo "$REG" | tail -1)"

# 2. /api/auth/me with the customer cookie
echo "2) Session works (/api/auth/me)"
ME=$(curl -s -b "$CJAR" -w $'\n%{http_code}' "$BASE/api/auth/me")
check "me returns 200" 200 "$(echo "$ME" | tail -1)"
check "me role is customer" yes \
  "$(echo "$ME" | grep -q '"role":"customer"' && echo yes || echo no)"

# 3. Customer is blocked from /admin (redirect to /login)
echo "3) Customer blocked from /admin"
ACODE=$(curl -s -o /dev/null -w "%{http_code}" -b "$CJAR" "$BASE/admin")
ALOC=$(curl -s -o /dev/null -w "%{redirect_url}" -b "$CJAR" "$BASE/admin")
check "customer redirected from /admin to /login" yes \
  "$([[ "$ACODE" =~ ^30 ]] && [[ "$ALOC" == *"/login"* ]] && echo yes || echo no)"

# 4. Logout
echo "4) Logout"
LCODE=$(curl -s -o /dev/null -w "%{http_code}" -b "$CJAR" -c "$CJAR" \
  -X POST "$BASE/api/auth/logout")
check "logout returns 200" 200 "$LCODE"

# 5. me after logout is unauthorized
echo "5) Session cleared after logout"
MCODE=$(curl -s -o /dev/null -w "%{http_code}" -b "$CJAR" "$BASE/api/auth/me")
check "me returns 401 after logout" 401 "$MCODE"

# 6. Wrong admin password rejected
echo "6) Wrong password rejected"
WCODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@store.test","password":"wrongpass"}')
check "wrong password returns 401" 401 "$WCODE"

# 7. Admin login with seeded credentials
echo "7) Admin login"
AL=$(curl -s -c "$AJAR" -w $'\n%{http_code}' -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@store.test","password":"admin1234"}')
check "admin login returns 200" 200 "$(echo "$AL" | tail -1)"
check "admin role is admin" yes \
  "$(echo "$AL" | grep -q '"role":"admin"' && echo yes || echo no)"

# 8. Admin can access /admin
echo "8) Admin can access /admin"
AAC=$(curl -s -o /dev/null -w "%{http_code}" -b "$AJAR" "$BASE/admin")
check "admin gets 200 on /admin" 200 "$AAC"

# 9. Duplicate email rejected
echo "9) Duplicate registration rejected"
DCODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Dup\",\"email\":\"$EMAIL\",\"password\":\"password123\"}")
check "duplicate email returns 409" 409 "$DCODE"

# 10. Weak password rejected
echo "10) Weak password rejected"
WPC=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Weak\",\"email\":\"weak_${RANDOM}@example.com\",\"password\":\"123\"}")
check "weak password returns 400" 400 "$WPC"

rm -f "$CJAR" "$AJAR"
echo
echo "=============================="
echo "Result: $PASS passed, $FAIL failed"
echo "=============================="
[ "$FAIL" -eq 0 ]
