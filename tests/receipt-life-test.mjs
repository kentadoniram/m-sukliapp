// LIFE (ライフ) Kawasaki Tsukagoshi, 2026-10-22: ¥1,021 = レジ袋 5 + 輸入牛 678 (20% sticker -136) + バナナ 100 + 白たまご 299 + 8% tax 75.
// The five fixtures are real OCR readings of the photo (different image preparations), noise and all.
import fs from 'fs';
import { parseReceipt, parseBoth } from '../js/receipt.js';
const rd = (f) => fs.readFileSync(new URL('./fixtures/' + f, import.meta.url), 'utf8').split('\n').filter((x) => x.trim()).map((text) => ({ text }));
let bad = 0; const ok = (n, c) => { console.log((c ? 'PASS ' : 'FAIL ') + n); if (!c) bad++; };
const F = { flat: rd('life-1022-flat.txt'), bin: rd('life-1022-bin.txt'), grey: rd('life-1022-grey.txt'), b1: rd('life-1022-browser-1.txt'), b2: rd('life-1022-browser-2.txt') };
const names = (r) => r.items.map((i) => i.name).join('|');
const full = (n, r) => {
  ok(n + ': total 1021', r.total && r.total.value === 1021);
  ok(n + ': shop LIFE', r.merchant && r.merchant.value === 'LIFE');
  ok(n + ': date', r.date && r.date.value === '2026-10-22' && r.date.time === '18:24');
  ok(n + ': items add up', r.check && r.check.ok && r.items.reduce((s, i) => s + i.amt, 0) === 1021);
  ok(n + ': tax 75', r.tax === 75);
};
const one = parseReceipt(F.flat, { known: [] }); full('flat alone', one);
ok('names repaired', /輸入牛/.test(names(one)) && /バナナ/.test(names(one)) && /白たまご10個/.test(names(one)) && /レジ袋/.test(names(one)));
ok('invoice number', one.ids.reg === 'T9010001060208' && one.ids.phone === '0445443721');
full('browser pair', parseBoth(F.b1, F.b2, { known: [] }));
full('flat + bin', parseBoth(F.flat, F.bin, { known: [] }));
ok('"¥1, 021" is 1021', parseReceipt([{ text: 'お買上げ' }, { text: '支払合計 ¥1, 021' }], { known: [] }).total.value === 1021);
ok('"(外10% 対象 ¥5)" is not 5 of tax', parseReceipt(F.flat, { known: [] }).tax === 75);
process.exit(bad ? 1 : 0);
