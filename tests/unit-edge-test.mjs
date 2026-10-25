// Unit tests added in v12.53: edge cases that must neither crash nor produce NaN or negative money.
import './unit-stubs.mjs';
const lc = await import('../js/loancalc.js'), tb = await import('../js/tradecalc.js'), lb = await import('../js/label.js'), rt = await import('../js/route.js'), st = await import('../js/stats.js'), core = await import('../js/core.js');
let bad = 0; const ok = (n, c, extra = '') => { console.log((c ? 'PASS ' : 'FAIL ') + n + (c ? '' : ' ' + extra)); if (!c) bad++; };
const finite = (o) => Object.values(o).every((v) => Number.isFinite(v));
// loans
const a = lc.loanCalc({ principal: 100000, rate: 12, months: 12, fees: 3000 });
ok('loan: monthly payment is right (12% a year, 12 months)', Math.abs(a.monthly - 8884.88) < 0.01, a.monthly);
ok('loan: you receive principal minus upfront fees', a.net === 97000 && a.fees === 3000);
ok('loan: cost = interest + fees', Math.abs(a.cost - (a.interest + 3000)) < 1e-6);
ok('loan: interest-free loan just divides', lc.loanCalc({ principal: 120000, rate: 0, months: 12 }).monthly === 10000);
ok('loan: zero months does not divide by zero', finite(lc.loanCalc({ principal: 50000, rate: 5, months: 0 })));
ok('loan: negative principal / rate / fees never give negative money', (() => { const x = lc.loanCalc({ principal: -1, rate: -5, months: 12, fees: -100 }); return finite(x) && x.monthly >= 0 && x.net >= 0 && x.fees >= 0; })());
ok('loan: fees larger than the loan leave net at zero, not negative', lc.loanCalc({ principal: 1000, rate: 5, months: 6, fees: 5000 }).net === 0);
ok('loan: late fee is a share of the payment', Math.abs(lc.loanCalc({ principal: 12000, rate: 0, months: 12, lateFee: 5 }).lateEach - 50) < 1e-9);
// smart labels
const k = lc.smartKind;
ok('smart labels', k('Loan') === 'loan' && k('Loan Payment') === 'loanpay' && k('Credit to Cash') === 'cash' && k('Credit Card Payment') === 'cardpay' && k('CC payment') === 'cardpay' && k('lunch') === '' && k('') === '' && k(null) === '');
ok('"Loan Payment" is not mistaken for a new loan', k('loan payment') === 'loanpay');
// labels and routes
ok('transfer label from two accounts', lb.transferLabel({ name: 'BDO' }, { name: 'CIMB' }) === 'BDO - CIMB');
ok('route parser returns null for garbage, never throws', [rt.parseRoute(''), rt.parseRoute('-'), rt.parseRoute('A - '), rt.parseRoute(null), rt.parseRoute(undefined)].every((x) => x === null));
ok('trip labels', rt.tripLabel('Bus', 'One Ayala', 'San Pedro') === 'Bus: One Ayala - San Pedro' && rt.tripLabel('Train', '', '') === 'Train Commute');
// trades
ok('tradeBook of nothing does not throw', (() => { try { tb.tradeBook([]); return true; } catch { return false; } })());
// stats and money formatting
ok('forecast of one point is null, of zeros is zero', st.forecastSeries([5]) === null && st.forecastSeries([0, 0, 0, 0, 0, 0]).value === 0);
ok('trend of too few points says "none"', st.trend([1, 2, 3]).conf === 'none');
ok('fmt never shows NaN', !/NaN/.test(core.fmt(NaN, 'JPY')) && !/NaN|undefined/.test(core.fmt(undefined, 'PHP')));
console.log(bad ? `\n${bad} FAILED` : '\nall passed'); process.exit(bad ? 1 : 0);
