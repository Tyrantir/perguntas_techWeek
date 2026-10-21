#!/usr/bin/env bash
# Testes de fumaça da API (zera o mural no início e no fim!).
# Uso: ADMIN_PIN=1234 bash scripts/api-test.sh [base_url]
B=${1:-http://localhost:3000}
D=$(mktemp -d)
A="$D/a.txt"; C="$D/b.txt"
PIN="x-admin-pin: ${ADMIN_PIN:-1234}"
J="content-type: application/json"
pass=0; fail=0

# check <descrição> <status esperado> <curl args...>
check() {
  local desc=$1 want=$2; shift 2
  local out code
  out=$(curl -s -w '\n%{http_code}' "$@")
  code=${out##*$'\n'}; BODY=${out%$'\n'*}
  if [[ $code == "$want" ]]; then pass=$((pass+1)); echo "OK   [$code] $desc -> $BODY"
  else fail=$((fail+1)); echo "FAIL [$code != $want] $desc -> $BODY"; fi
}
field() { echo "$BODY" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const o=JSON.parse(s);console.log(eval('o.'+process.argv[1]))})" "$1"; }

echo "== reset inicial"
check "reset com PIN" 200 -X POST -H "$PIN" "$B/api/admin/reset"

echo "== admin sem PIN / PIN errado"
check "board admin sem PIN" 401 "$B/api/admin/board"
check "board admin PIN errado" 401 -H "x-admin-pin: 0000" "$B/api/admin/board"
check "reset sem PIN" 401 -X POST "$B/api/admin/reset"
check "PATCH sem PIN" 401 -X PATCH -H "$J" -d '{"status":"answered"}' "$B/api/questions/00000000-0000-4000-8000-000000000000"

echo "== validação"
check "texto curto" 400 -c "$A" -b "$A" -H "$J" -d '{"text":"  oi  "}' "$B/api/questions"
check "texto longo" 400 -c "$A" -b "$A" -H "$J" -d "{\"text\":\"$(printf 'a%.0s' {1..281})\"}" "$B/api/questions"
check "autor longo" 400 -c "$A" -b "$A" -H "$J" -d "{\"text\":\"Pergunta válida?\",\"author\":\"$(printf 'b%.0s' {1..41})\"}" "$B/api/questions"
check "JSON inválido" 400 -c "$A" -b "$A" -H "$J" -d '{text' "$B/api/questions"

echo "== criar + cooldown"
check "cria pergunta A1 (com trim e autor)" 201 -c "$A" -b "$A" -H "$J" -d '{"text":"   Como funciona o deploy na Vercel?  ","author":"  Ana "}' "$B/api/questions"
Q1=$(field id)
grep -q mural_voter "$A" && echo "OK   cookie mural_voter criado" || { echo "FAIL cookie ausente"; fail=$((fail+1)); }
check "cooldown A" 429 -c "$A" -b "$A" -H "$J" -d '{"text":"Outra pergunta aqui"}' "$B/api/questions"
check "cria pergunta B1 (outro cookie, sem autor)" 201 -c "$C" -b "$C" -H "$J" -d '{"text":"Por que não usar SQLite?","author":""}' "$B/api/questions"
Q2=$(field id)

echo "== votos"
check "A vota Q2" 200 -X POST -c "$A" -b "$A" "$B/api/questions/$Q2/vote"
check "B vota Q2" 200 -X POST -c "$C" -b "$C" "$B/api/questions/$Q2/vote"
[[ $(field votes) == 2 ]] && echo "OK   Q2 tem 2 votos" || { echo "FAIL Q2 votes=$(field votes)"; fail=$((fail+1)); }
check "B desvota Q2" 200 -X POST -c "$C" -b "$C" "$B/api/questions/$Q2/vote"
[[ $(field voted) == false && $(field votes) == 1 ]] && echo "OK   desvoto -> 1" || { echo "FAIL desvoto"; fail=$((fail+1)); }
check "B vota Q1" 200 -X POST -c "$C" -b "$C" "$B/api/questions/$Q1/vote"
check "/api/me A" 200 -b "$A" "$B/api/me"
check "/api/me B" 200 -b "$C" "$B/api/me"
check "/api/me sem cookie" 200 "$B/api/me"
check "voto em id inválido" 400 -X POST -b "$A" "$B/api/questions/abc/vote"
check "voto em id inexistente" 404 -X POST -b "$A" "$B/api/questions/00000000-0000-4000-8000-000000000000/vote"

echo "== board público + cache"
curl -sI "$B/api/questions" | grep -i cache-control
check "board público" 200 "$B/api/questions"

echo "== admin com PIN"
check "spotlight Q1" 200 -X PUT -H "$PIN" -H "$J" -d "{\"id\":\"$Q1\"}" "$B/api/admin/spotlight"
check "board mostra spotlight" 200 "$B/api/questions"
[[ $(field spotlightId) == "$Q1" ]] && echo "OK   spotlightId=Q1" || { echo "FAIL spotlight"; fail=$((fail+1)); }
check "status inválido" 400 -X PATCH -H "$PIN" -H "$J" -d '{"status":"x"}' "$B/api/questions/$Q1"
check "marca Q1 respondida" 200 -X PATCH -H "$PIN" -H "$J" -d '{"status":"answered"}' "$B/api/questions/$Q1"
check "board: spotlight limpo, Q1 no fim" 200 "$B/api/questions"
[[ $(field spotlightId) == null && $(field 'questions.at(-1).id') == "$Q1" ]] && echo "OK   spotlight null, respondida no fim" || { echo "FAIL ordem/spotlight"; fail=$((fail+1)); }
check "voto em respondida" 409 -X POST -b "$A" "$B/api/questions/$Q1/vote"
check "oculta Q2" 200 -X PATCH -H "$PIN" -H "$J" -d '{"status":"hidden"}' "$B/api/questions/$Q2"
check "board público sem ocultas" 200 "$B/api/questions"
[[ $(field 'questions.length') == 1 ]] && echo "OK   1 pergunta pública" || { echo "FAIL ocultas vazaram"; fail=$((fail+1)); }
check "board admin com ocultas" 200 -H "$PIN" "$B/api/admin/board"
[[ $(field 'questions.length') == 2 ]] && echo "OK   2 no admin" || { echo "FAIL admin"; fail=$((fail+1)); }
check "spotlight em oculta" 409 -X PUT -H "$PIN" -H "$J" -d "{\"id\":\"$Q2\"}" "$B/api/admin/spotlight"
check "voto em oculta" 404 -X POST -b "$A" "$B/api/questions/$Q2/vote"
check "spotlight null" 200 -X PUT -H "$PIN" -H "$J" -d '{"id":null}' "$B/api/admin/spotlight"

echo "== reset"
check "reset" 200 -X POST -H "$PIN" "$B/api/admin/reset"
check "board vazio" 200 "$B/api/questions"
check "/api/me A após reset" 200 -b "$A" "$B/api/me"

rm -rf "$D"
echo; echo "pass=$pass fail=$fail"
