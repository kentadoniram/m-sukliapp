// A small offline gloss for Japanese item names on receipts, so that someone who cannot read them can still check what the reader found.
// It is a word list, not a translator: it matches the longest known word at each position and says what it could not translate.
// Plain functions, no downloads, no network.

// [Japanese, English]. Longer entries win, so a brand or a compound is matched before the characters in it.
const WORDS = [
  // shops' own and common brands
  ['午後の紅茶', 'Afternoon Tea'], ['クラフトボス', 'Craft BOSS'], ['ボス', 'BOSS'], ['サントリー', 'Suntory'], ['キリン', 'Kirin'], ['アサヒ', 'Asahi'], ['サッポロ', 'Sapporo'],
  ['明治', 'Meiji'], ['森永', 'Morinaga'], ['雪印', 'Snow Brand'], ['カルビー', 'Calbee'], ['味の素', 'Ajinomoto'], ['日清', 'Nissin'], ['ハウス', 'House'], ['キッコーマン', 'Kikkoman'],
  ['伊藤園', 'Ito En'], ['伊右衛門', 'Iemon'], ['コカ・コーラ', 'Coca-Cola'], ['コカコーラ', 'Coca-Cola'], ['ペプシ', 'Pepsi'], ['ポカリスエット', 'Pocari Sweat'], ['ヤマザキ', 'Yamazaki'], ['山崎', 'Yamazaki'],
  ['パスコ', 'Pasco'], ['日本ハム', 'Nippon Ham'], ['伊藤ハム', 'Ito Ham'], ['丸大食品', 'Marudai'], ['ネスレ', 'Nestle'], ['ライフ', 'LIFE'], ['トップバリュ', 'Topvalu'], ['スマイルライフ', 'Smile Life'], ['毎日の食卓', 'Everyday Table'],
  ['都路', 'Miyakoji'],
  // drinks
  ['レモンティー', 'lemon tea'], ['ミルクティー', 'milk tea'], ['紅茶', 'black tea'], ['緑茶', 'green tea'], ['麦茶', 'barley tea'], ['烏龍茶', 'oolong tea'], ['ウーロン茶', 'oolong tea'], ['お茶', 'tea'], ['茶', 'tea'],
  ['コーヒー', 'coffee'], ['珈琲', 'coffee'], ['カフェラテ', 'café latte'], ['カフェオレ', 'café au lait'], ['カフェ', 'café'], ['ラテ', 'latte'], ['イタリアーノ', 'Italiano'], ['ブラック', 'black'], ['微糖', 'low sugar'], ['無糖', 'unsweetened'],
  ['ミネラルウォーター', 'mineral water'], ['天然水', 'natural water'], ['炭酸水', 'sparkling water'], ['炭酸', 'carbonated'], ['ジュース', 'juice'], ['オレンジ', 'orange'], ['リンゴ', 'apple'], ['ビール', 'beer'], ['発泡酒', 'low-malt beer'],
  ['チューハイ', 'chuhai'], ['ハイボール', 'highball'], ['ワイン', 'wine'], ['日本酒', 'sake'], ['焼酎', 'shochu'], ['ウイスキー', 'whisky'], ['牛乳', 'milk'], ['豆乳', 'soy milk'], ['乳酸菌', 'lactic acid bacteria'], ['水', 'water'], ['酒', 'alcohol'],
  // meat, fish, eggs
  ['黒毛和牛', 'Japanese Black wagyu beef'], ['和牛', 'wagyu beef'], ['輸入牛', 'imported beef'], ['国産牛', 'domestic beef'], ['牛肉', 'beef'], ['牛', 'beef'], ['豚バラ', 'pork belly'], ['豚こま', 'pork scraps'], ['豚ロース', 'pork loin'], ['豚肉', 'pork'], ['豚', 'pork'],
  ['若鶏', 'young chicken'], ['鶏もも', 'chicken thigh'], ['鶏むね', 'chicken breast'], ['鶏肉', 'chicken'], ['鶏', 'chicken'], ['手羽先', 'chicken wings'], ['手羽元', 'chicken drumsticks'], ['ささみ', 'chicken tenderloin'], ['唐揚げ', 'fried chicken (karaage)'], ['から揚げ', 'fried chicken (karaage)'],
  ['ひき肉', 'minced meat'], ['合挽き', 'mixed minced meat'], ['ソーセージ', 'sausage'], ['ウインナー', 'wiener sausage'], ['ベーコン', 'bacon'], ['ロースハム', 'loin ham'], ['ハム', 'ham'], ['ステーキ', 'steak'], ['モモステ', 'round steak (cut off)'], ['モモ', 'round (thigh)'], ['カルビ', 'short rib'], ['ロース', 'loin'], ['ヒレ', 'fillet'],
  ['焼肉', 'grilled meat'], ['しゃぶしゃぶ', 'shabu-shabu'], ['すき焼き', 'sukiyaki'], ['ハンバーグ', 'hamburger steak'], ['餃子', 'gyoza'], ['シュウマイ', 'shumai'], ['コロッケ', 'croquette'], ['メンチカツ', 'minced cutlet'], ['とんかつ', 'pork cutlet'], ['カツ', 'cutlet'],
  ['目玉焼', 'fried egg'], ['玉子焼き', 'rolled omelet'], ['卵焼き', 'rolled omelet'], ['温泉卵', 'hot-spring egg'], ['ゆで卵', 'boiled egg'], ['たまご', 'egg'], ['タマゴ', 'egg'], ['卵', 'egg'], ['玉子', 'egg'],
  ['刺身', 'sashimi'], ['寿司', 'sushi'], ['鮭', 'salmon'], ['サーモン', 'salmon'], ['鯖', 'mackerel'], ['さば', 'mackerel'], ['鰯', 'sardine'], ['鯵', 'horse mackerel'], ['まぐろ', 'tuna'], ['マグロ', 'tuna'], ['ツナ', 'tuna'], ['えび', 'shrimp'], ['エビ', 'shrimp'], ['海老', 'shrimp'], ['いか', 'squid'], ['イカ', 'squid'], ['たこ', 'octopus'], ['タコ', 'octopus'], ['あさり', 'clams'], ['ほたて', 'scallops'], ['ホタテ', 'scallops'], ['かまぼこ', 'fish cake'], ['ちくわ', 'fish-paste tube'], ['魚', 'fish'], ['肉', 'meat'],
  // vegetables, fruit
  ['バナナ', 'banana'], ['りんご', 'apple'], ['みかん', 'mandarin orange'], ['いちご', 'strawberries'], ['イチゴ', 'strawberries'], ['ぶどう', 'grapes'], ['ブドウ', 'grapes'], ['もも', 'peach'], ['なし', 'pear'], ['柿', 'persimmon'], ['キウイ', 'kiwi'], ['アボカド', 'avocado'], ['レモン', 'lemon'], ['グレープフルーツ', 'grapefruit'], ['スイカ', 'watermelon'], ['メロン', 'melon'],
  ['トマト', 'tomato'], ['ミニトマト', 'cherry tomatoes'], ['きゅうり', 'cucumber'], ['キュウリ', 'cucumber'], ['キャベツ', 'cabbage'], ['レタス', 'lettuce'], ['白菜', 'napa cabbage'], ['ほうれん草', 'spinach'], ['小松菜', 'komatsuna'], ['ブロッコリー', 'broccoli'], ['玉ねぎ', 'onion'], ['たまねぎ', 'onion'], ['長ねぎ', 'leek'], ['ねぎ', 'green onion'], ['にんじん', 'carrot'], ['人参', 'carrot'], ['じゃがいも', 'potato'], ['ジャガイモ', 'potato'], ['さつまいも', 'sweet potato'], ['大根', 'daikon radish'], ['ごぼう', 'burdock'], ['なす', 'eggplant'], ['ナス', 'eggplant'], ['ピーマン', 'bell pepper'], ['かぼちゃ', 'pumpkin'], ['もやし', 'bean sprouts'], ['しいたけ', 'shiitake'], ['えのき', 'enoki'], ['しめじ', 'shimeji'], ['きのこ', 'mushrooms'], ['にんにく', 'garlic'], ['しょうが', 'ginger'], ['生姜', 'ginger'], ['サラダ', 'salad'], ['カット野菜', 'cut vegetables'], ['野菜', 'vegetables'],
  // staples, dairy, pantry
  ['食パン', 'sliced bread'], ['パン', 'bread'], ['おにぎり', 'rice ball'], ['弁当', 'lunch box (bento)'], ['お米', 'rice'], ['米', 'rice'], ['ご飯', 'cooked rice'], ['ラーメン', 'ramen'], ['うどん', 'udon'], ['そば', 'soba'], ['パスタ', 'pasta'], ['スパゲッティ', 'spaghetti'], ['カップ麺', 'instant cup noodles'], ['焼きそば', 'fried noodles'],
  ['納豆', 'natto'], ['豆腐', 'tofu'], ['油揚げ', 'fried tofu'], ['味噌', 'miso'], ['醤油', 'soy sauce'], ['砂糖', 'sugar'], ['塩', 'salt'], ['酢', 'vinegar'], ['みりん', 'mirin'], ['だし', 'dashi stock'], ['出汁', 'dashi stock'], ['油', 'oil'], ['マヨネーズ', 'mayonnaise'], ['ケチャップ', 'ketchup'], ['ソース', 'sauce'], ['ドレッシング', 'dressing'], ['カレー', 'curry'], ['シチュー', 'stew'], ['スープ', 'soup'],
  ['ヨーグルト', 'yogurt'], ['チーズ', 'cheese'], ['バター', 'butter'], ['マーガリン', 'margarine'], ['生クリーム', 'fresh cream'], ['クリーム', 'cream'], ['アイス', 'ice cream'], ['プリン', 'pudding'], ['ゼリー', 'jelly'], ['チョコレート', 'chocolate'], ['チョコ', 'chocolate'], ['クッキー', 'cookies'], ['ビスケット', 'biscuits'], ['せんべい', 'rice crackers'], ['ポテトチップス', 'potato chips'], ['スナック', 'snack'], ['お菓子', 'sweets'], ['ガム', 'gum'], ['飴', 'candy'], ['キャンディ', 'candy'],
  // household
  ['レジ袋', 'carrier bag'], ['ポリ袋', 'plastic bag'], ['ゴミ袋', 'trash bags'], ['袋', 'bag'], ['ティッシュ', 'tissues'], ['トイレットペーパー', 'toilet paper'], ['キッチンペーパー', 'paper towels'], ['洗剤', 'detergent'], ['柔軟剤', 'fabric softener'], ['シャンプー', 'shampoo'], ['リンス', 'conditioner'], ['ボディソープ', 'body soap'], ['石鹸', 'soap'], ['歯みがき', 'toothpaste'], ['歯磨き', 'toothpaste'], ['歯ブラシ', 'toothbrush'], ['マスク', 'face masks'], ['電池', 'batteries'], ['ラップ', 'plastic wrap'], ['アルミホイル', 'aluminium foil'], ['ペットボトル', 'plastic bottle'], ['ベビー', 'baby'], ['おむつ', 'diapers'], ['ペットフード', 'pet food'],
  // words that describe an item
  ['輸入', 'imported'], ['国産', 'domestic'], ['産', 'grown in'], ['無添加', 'additive-free'], ['有機', 'organic'], ['低脂肪', 'low fat'], ['大盛', 'large portion'], ['特選', 'select'], ['特大', 'extra large'], ['徳用', 'value pack'], ['業務用', 'bulk'], ['お買得', 'bargain'], ['新鮮', 'fresh'], ['冷凍', 'frozen'], ['冷蔵', 'chilled'], ['生', 'raw / fresh'],
  ['とろける', 'creamy'], ['香り', 'aroma'], ['揚げ', 'fried'], ['焼き', 'grilled'], ['焼', 'grilled'], ['蒸し', 'steamed'], ['煮', 'simmered'], ['漬け', 'pickled'], ['入り', 'with'], ['風味', 'flavor'], ['味', 'flavor'], ['カット', 'cut'], ['スライス', 'sliced'], ['白', 'white'], ['黒', 'black'], ['赤', 'red'], ['大', 'large'], ['小', 'small'], ['新', 'new'], ['使用', 'made with'], ['等級', 'grade'], ['割引', 'discount'], ['値引', 'markdown'], ['シール割引', 'sticker discount'], ['クーポン', 'coupon'], ['ポイント', 'points'], ['詰め合わせ', 'assortment'], ['セット', 'set'], ['パック', 'pack'], ['単', 'unit price'], ['個', 'pcs'], ['コ', 'pcs'], ['本', 'pcs'], ['枚', 'sheets'],
];
const DICT = new Map(WORDS.map(([j, e]) => [j, e]));
const KEYS = [...DICT.keys()].sort((a, b) => b.length - a.length);
const SKIP = /^[のとでをはがもやに]$/;                                      // particles carry no word of their own in a list of goods
const isJa = (c) => /[\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}ー]/u.test(c);

// "5等級" is grade 5, "3コ" is 3 pcs
function numbers(s) { return s.replace(/(\d+)\s*等級/g, 'grade $1 ').replace(/(\d+)\s*[コ個]/g, '$1 pcs '); }

// text -> { text, known, total }: the English gloss, and how many Japanese letters were understood out of all of them
export function gloss(name) {
  let s = ''; try { s = String(name || '').normalize('NFKC'); } catch { s = String(name || ''); }
  s = numbers(s).replace(/[！!]+/g, ' ').trim();
  const out = []; let known = 0, total = 0, i = 0, unk = '';
  const flush = () => { if (unk) { out.push('[' + unk + ']'); unk = ''; } };
  while (i < s.length) {
    const c = s[i];
    if (!isJa(c)) { flush(); let j = i; while (j < s.length && !isJa(s[j])) j++; const run = s.slice(i, j).trim(); if (run && /[\p{L}\p{N}]/u.test(run)) out.push(run.replace(/\s+/g, ' ')); i = j; continue; }
    const k = KEYS.find((w) => s.startsWith(w, i));
    if (k) { flush(); out.push(DICT.get(k)); known += k.length; total += k.length; i += k.length; continue; }
    if (SKIP.test(c)) { flush(); i++; continue; }
    unk += c; total++; i++;
  }
  flush();
  const text = out.join(' ').replace(/\s+/g, ' ').trim();
  return { text: text ? text[0].toUpperCase() + text.slice(1) : '', known, total };
}

// what to show under a name: nothing when it is not Japanese or nothing could be understood
export function glossLine(name) {
  const g = gloss(name);
  if (!g.total || !g.known || !g.text) return '';
  return (g.known / g.total < 0.5 ? '≈ ' : '') + g.text;
}
