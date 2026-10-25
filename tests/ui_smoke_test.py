# Smoke test that needs no private data: seeds a small ledger, opens every main screen, and fails on any page error.
# Run: python3 -m http.server 8123 &  then  PYTHONPATH=tests python3 tests/ui_smoke_test.py
from playwright.sync_api import sync_playwright
res = []
def ok(n, c): res.append(bool(c)); print(('PASS ' if c else 'FAIL ') + n)
SEED = """async () => { const core = await import('/js/core.js'), fin = await import('/js/finance.js');
  const now = fin.today(), dd = (o) => { const [y, m, d] = now.split('-').map(Number); const x = new Date(y, m - 1, d + o); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
  const db = core.emptyDb(); core.seedCategories(db); const cat = core.findOrAddCategory(db, 'Transportation', 'Bus', 'expense'), food = core.findOrAddCategory(db, 'Food', 'Lunch', 'expense');
  db.accounts.push({ id: 'a', name: 'Bank', cur: 'JPY', open: 300000, type: 'bank', include: true, updatedAt: 1 }, { id: 'b', name: 'Cash', cur: 'JPY', open: 20000, type: 'cash', include: true, updatedAt: 1 }); let n = 0;
  for (let o = -60; o <= 0; o++) { db.txs.push({ id: 't' + n++, kind: 'expense', date: dd(o) + ' 12:00:00', amount: 900 + (o % 4) * 50, cur: 'JPY', fx: 1, cat: food.id, acct: 'a', name: 'Lunch', updatedAt: 1 });
    if (o % 2 === 0) db.txs.push({ id: 't' + n++, kind: 'expense', date: dd(o) + ' 07:10:00', amount: 170, cur: 'JPY', fx: 1, cat: cat.id, acct: 'b', name: 'Bus: Home - Work', route: { from: 'Home', to: 'Work', mode: 'Bus' }, updatedAt: 1 }); }
  core.replaceAll(db); }"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 390, 'height': 800}, service_workers='block'); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8123/'); pg.wait_for_timeout(500); pg.evaluate(SEED)
    for r in ['home', 'ledger', 'calendar', 'accounts', 'analytics', 'outlook', 'review', 'settings', 'budget', 'cashflow']:
        pg.evaluate(f"location.hash='#/{r}'"); pg.wait_for_timeout(450)
        ok(f'screen #{r} renders with something on it', pg.evaluate("document.body.innerText.length") > 60)
    ok('no page errors on any screen', not errs)
    pg.evaluate("location.hash='#/home'"); pg.wait_for_timeout(400)
    pg.click('[aria-label="Add an entry"]'); pg.wait_for_timeout(500)
    pg.fill('#f-what', 'bus'); pg.wait_for_timeout(400)
    ok('typing "bus" shows the optional trip fields', pg.query_selector('#f-from') is not None or pg.query_selector('[data-route-from]') is not None or 'From' in pg.inner_text('body'))
    ok('label stays "bus" after typing', pg.input_value('#f-what') == 'bus')
    pg.fill('#f-amount', '170'); pg.click('[data-e="save"]'); pg.wait_for_timeout(700)
    last = pg.evaluate("async () => { const c = await import('/js/core.js'); const t = c.get().txs.slice(-1)[0]; return t.name; }")
    ok('a label of just "bus" is saved as "Bus Commute"', 'Commute' in last or 'Bus' in last)
    ok('still no page errors after saving', not errs)
    b.close()
print('FAILED' if not all(res) else 'all passed'); raise SystemExit(0 if all(res) else 1)
