// 意味のない円グラフ v3 (Elements強化)
// ルール：それっぽい / 合計100% / 解説しない
// 追加：概念モード多め、たまに無機質、稀に混合
// 追加：35%で「◯◯の構成要素」モード（抽象×具体×生理×現代が同列）

/* ---------------------------
   util
---------------------------- */

function randInt(min, max) { // inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickFrom(arr) {
  return arr[randInt(0, arr.length - 1)];
}

// 合計100の整数配分を作る（端数は最後に吸収）
function makePercentages(k) {
  const raw = Array.from({ length: k }, () => Math.random() + 0.05);
  const sum = raw.reduce((a, b) => a + b, 0);
  let vals = raw.map(x => Math.round((x / sum) * 100));

  let diff = 100 - vals.reduce((a, b) => a + b, 0);
  vals[vals.length - 1] += diff;

  // 極端ケース対策
  for (let i = 0; i < vals.length; i++) {
    if (vals[i] < 0) vals[i] = 0;
    if (vals[i] > 100) vals[i] = 100;
  }

  diff = 100 - vals.reduce((a, b) => a + b, 0);
  vals[vals.length - 1] += diff;

  return vals;
}

// たまに変な回（味付け）
function maybeWeirdCase(k) {
  const r = Math.random();

  // 5%: 99/1/0/0...
  if (r < 0.05 && k >= 2) {
    const vals = Array(k).fill(0);
    vals[0] = 99;
    vals[1] = 1;
    return vals;
  }

  // 次の5%: ほぼ均等
  if (r < 0.10) {
    const base = Math.floor(100 / k);
    const vals = Array(k).fill(base);
    vals[vals.length - 1] += 100 - vals.reduce((a, b) => a + b, 0);
    return vals;
  }

  // 次の5%: 0%が混ざる（でも合計100）
  if (r < 0.15 && k >= 3) {
    const vals = makePercentages(k);
    vals[0] = 0;
    const diff = 100 - vals.reduce((a, b) => a + b, 0);
    vals[vals.length - 1] += diff;
    return vals;
  }

  return null;
}

/* ---------------------------
   v3: Elements（抽象×具体×生理×現代）
---------------------------- */

// 「構成要素」用：抽象×具体を同列に並べるための素材
const ELEMENT = {
  // 感情・概念
  abstract: [
    "優しさ", "憎しみ", "不安", "余白", "期待", "諦め", "矛盾", "静けさ", "焦り", "無",
    "気のせい", "不可抗力", "未定義", "ノイズ", "安心(仮)", "罪悪感", "衝動", "透明", "強がり", "やさしい嘘"
  ],
  // 身体・欲求・生理
  bodily: [
    "眠気", "食欲", "肩こり", "心拍", "体温", "だるさ", "呼吸", "のどの渇き", "カフェイン", "二度寝",
    "目の乾き", "頭痛", "胃の気配", "背中", "足の重さ", "睡眠の質", "集中(欠損)", "テンション(未確定)"
  ],
  // 物体・物質・自然科学っぽい（爆発的に増量）
  concrete: [
    // 食べ物・台所
    "トマト", "塩", "砂糖", "米", "パン", "水", "油", "氷", "湯気", "醤油", "味噌", "レモン", "コーヒー豆",
    "マグカップ", "スプーン", "箸", "皿", "鍋", "フライパン", "スポンジ", "洗剤", "ラップ", "冷蔵庫の音",
    "コンロの火", "シンク", "食器の山",

    // 物質・理科
    "窒素", "酸素", "二酸化炭素", "水素", "鉄", "銅", "アルミ", "炭素", "塩素", "ナトリウム", "カルシウム",
    "重力", "摩擦", "光", "影", "静電気", "磁力", "熱", "温度差", "気圧", "湿度", "粒子", "分子(仮)", "波",
    "放射(気分)", "スペクトル(雰囲気)",

    // 天気・外
    "雨", "風", "曇り", "日差し", "夕焼け", "夜気", "朝の冷たさ", "水たまり", "濡れた地面", "乾いた空気",
    "落ち葉", "砂ぼこり", "花粉", "雪の気配", "雲", "霧", "雷(遠い)", "日陰", "駅前の風",

    // 部屋・生活用品
    "布団", "枕", "毛布", "カーテン", "床", "壁", "天井", "電球", "蛍光灯", "机", "椅子", "クッション",
    "タオル", "洗濯物", "ハンガー", "クリップ", "ゴミ袋", "段ボール", "ガムテープ", "封筒", "紙", "ノート",
    "ペン", "消しゴム", "付箋", "ホチキス", "クリアファイル", "本棚", "引き出し", "鍵", "小銭", "領収書",
    "ティッシュ", "マスク", "薬箱", "体温計(記憶)", "時計", "電池", "充電器", "延長コード", "ケーブル",
    "コンセント", "USB", "HDMI", "リモコン", "扇風機", "暖房", "加湿器(空)",

    // 街の物
    "信号", "横断歩道", "段差", "踏切", "自販機", "コンビニの光", "レジ袋", "自転車", "車の音", "電車",
    "駅のアナウンス", "改札", "エスカレーター", "階段", "ベンチ", "歩道", "看板", "街灯", "ポスト",
    "マンホール", "工事の柵", "ガードレール", "バス停", "道路の白線",

    // PC・デスク周り
    "キーボード", "マウス", "モニター", "ウィンドウ", "カーソル", "ファンの音", "クリック音", "通知音(幻)",
    "ショートカット", "ターミナル", "ログ", "エラーメッセージ", "スクロールバー", "タブ", "ブラウザの戻る",
    "保存ボタン", "クラッシュ(気分)", "キャッシュ", "更新", "読み込み中…", "進捗バー(嘘)",

    // 身の回り小物
    "靴ひも", "靴", "バッグ", "ポケット", "イヤホン", "充電残量", "ハンドクリーム", "消毒液", "スマホケース",
    "メガネ", "目薬", "傘", "定期券", "レシート", "小さな石", "ビニール", "ホコリ", "髪の毛(一本)"
  ],
  // インターネット・生活の固有名詞っぽい
  modern: [
    "通知", "タイムライン", "Wi-Fi", "バッテリー", "検索", "ログ", "ミュート", "既読", "スクショ", "深夜",
    "未読", "更新", "トレンド", "おすすめ", "広告", "キャッシュ", "同期", "クラウド", "パスワード(忘却)",
    "タブ増殖", "バックグラウンド", "省電力", "サイレントモード"
  ],
};

// 「必ず抽象と具体が混ざる」ように作る（ここがキモ）
function makeElements(k) {
  const out = new Set();

  // 最低保証：抽象×生理×具体
  out.add(pickFrom(ELEMENT.abstract));
  out.add(pickFrom(ELEMENT.bodily));
  out.add(pickFrom(ELEMENT.concrete));

  // 残りをランダムで埋める（modernも混ぜる）
  const pools = [ELEMENT.abstract, ELEMENT.bodily, ELEMENT.concrete, ELEMENT.modern];
  while (out.size < k) {
    out.add(pickFrom(pools[randInt(0, pools.length - 1)]));
  }
  return [...out];
}

/* ---------------------------
   v3: モード辞書（概念/無機質）
---------------------------- */

const MODE = {
  concept: {
    name: "concept",
    subjects: ["心", "世界", "生活", "空気", "沈黙", "余白", "現実", "夢", "インターネット", "体調", "夜", "距離感"],
    states: ["内訳", "配分", "濃度", "透明度", "ゆらぎ", "密度", "静けさ", "ざわつき", "質量(仮)", "摩擦"],
    notes: ["根拠なし", "推定", "雰囲気", "未検証", "たぶん", "そのまま", "説明不能", "観測者依存"],
    prefix: ["うっすら", "だいたい", "なんとなく", "不可抗力により", "静かに", "ひっそり", "無意識に", "とりあえず"],
    core: [
      "無", "余白", "誤差", "ノイズ", "ため息", "保留", "後回し", "気のせい", "不可抗力", "未定義",
      "ぬくもり", "諦め力", "眠気", "静けさ", "焦り(仮)", "期待値(低)", "透明", "まだ"
    ],
    suffix: ["（重要）", "みたいなもの", "のはず", "っぽい", "（未確定）", "（あとで）", ""],
    subtitle: [
      "— 解釈は各自でお願いします",
      "— なぜか納得してしまう",
      "— ここに意味を置かないでください",
      "— 参考：あなたの気分",
      "— 本日の結論：特にありません",
      "— だいたいこう",
    ],
  },

  sterile: {
    name: "sterile",
    subjects: ["状態", "系", "プロセス", "入力", "出力", "帯域", "リソース", "観測", "環境", "セッション", "スレッド"],
    states: ["内訳", "分布", "指標", "ログ", "係数", "スコア", "偏差", "ノイズ", "密度", "負荷", "未定"],
    notes: ["N/A", "estimated", "unverified", "ref", "tmp", "legacy", "beta", "as-is"],
    prefix: ["pre", "post", "pseudo", "internal", "external", "low", "high", "semi"],
    core: ["noise", "error", "undefined", "misc", "exception", "pending", "queue", "missing", "unknown", "other"],
    suffix: ["(ref)", "(tmp)", "(legacy)", "(beta)", "(?)", ""],
    subtitle: [
      "— reference only",
      "— estimated (no warranty)",
      "— signal: unknown",
      "— processed without meaning",
      "— OK (probably)",
    ],
  }
};

// 概念推し：概念 70% / 無機質 25% / 混合 5%
function pickMode() {
  const r = Math.random();
  if (r < 0.70) return MODE.concept;
  if (r < 0.95) return MODE.sterile;
  return "mixed";
}

function makeThemeFrom(m) {
  const a = pickFrom(m.subjects);
  const b = pickFrom(m.states);
  const c = pickFrom(m.notes);

  const forms = [
    `今日の${a}の${b}`,
    `${a}の${b}（${c}）`,
    `${a} ${b}：${c}`,
    `${a}の${b}（参考：${c}）`,
  ];
  return pickFrom(forms);
}

function makeLabelFrom(m) {
  const p = pickFrom(m.prefix);
  const c = pickFrom(m.core);
  const s = pickFrom(m.suffix);

  const forms = [
    `${c}${s}`,
    `${p}${c}${s}`,
    `${c}（${p}）`,
  ];
  return pickFrom(forms).trim();
}

function makeUniqueLabelsFrom(m, k) {
  const set = new Set();
  while (set.size < k) set.add(makeLabelFrom(m));
  return [...set];
}

// 「概念っぽさ」を出す軽い歪み（合計は維持）
function skewConceptValues(values) {
  if (values.length < 2) return values;

  // 35%: 最大値を少し盛る（人生の偏り）
  if (Math.random() < 0.35) {
    const max = Math.max(...values);
    const idx = values.indexOf(max);
    const bump = randInt(4, 10);
    const last = values.length - 1;

    if (idx !== last && values[last] >= bump) {
      values[idx] = Math.min(100, values[idx] + bump);
      values[last] -= bump;
    }
  }

  // 18%: 最小値をちょい吸収（「その他」が強くなった気分）
  if (Math.random() < 0.18) {
    const min = Math.min(...values);
    const idx = values.indexOf(min);
    const take = Math.min(min, randInt(2, 6));
    const last = values.length - 1;
    if (idx !== last && take > 0) {
      values[idx] -= take;
      values[last] += take;
    }
  }

  // 合計100に戻す
  const diff = 100 - values.reduce((a, b) => a + b, 0);
  values[values.length - 1] += diff;

  // 0未満ケア
  for (let i = 0; i < values.length; i++) if (values[i] < 0) values[i] = 0;
  const diff2 = 100 - values.reduce((a, b) => a + b, 0);
  values[values.length - 1] += diff2;

  return values;
}

/* ---------------------------
   generate
---------------------------- */

function generatePie() {
  const k = randInt(3, 6);
  const modePick = pickMode();

  // 35%くらいで「構成要素」テーマにする（あなたの欲しい方向）
  const doElements = Math.random() < 0.35;

  let theme, labels, subtitle;

  if (modePick === "mixed") {
    // 混合：テーマは概念、内訳は無機質…などをランダムで入れ替え
    const a = Math.random() < 0.5 ? MODE.concept : MODE.sterile;
    const b = a === MODE.concept ? MODE.sterile : MODE.concept;

    theme = doElements
      ? `${pickFrom(["あなた", "世界", "今日", "現実", "心", "生活", "インターネット", "部屋", "夜"])}の構成要素`
      : makeThemeFrom(a);

    labels = doElements
      ? makeElements(k)
      : makeUniqueLabelsFrom(b, k);

    subtitle = doElements ? "— 構成は未検証（根拠なし）" : "— mode: mixed";
  } else {
    const m = modePick;

    theme = doElements
      ? `${pickFrom(["あなた", "世界", "今日", "現実", "心", "生活", "体調", "空気", "夜"])}の構成要素`
      : makeThemeFrom(m);

    labels = doElements
      ? makeElements(k)
      : makeUniqueLabelsFrom(m, k);

    subtitle = doElements
      ? pickFrom(["— 構成は未検証", "— 解釈禁止", "— 参考：雰囲気", "— 根拠なし", "— たぶんこう"])
      : pickFrom(m.subtitle);
  }

  let values = maybeWeirdCase(k);
  if (!values) values = makePercentages(k);

  // 概念モードは少し偏らせる（意味は増えない）
  if (!doElements && modePick !== "mixed" && modePick.name === "concept") {
    values = skewConceptValues(values);
  }

  // 構成要素モードは「具体が強い日」が来てもいい
  if (doElements && Math.random() < 0.25) {
    // 最大値をさらにちょい盛り（雑）
    const idx = values.indexOf(Math.max(...values));
    const bump = randInt(3, 8);
    const last = values.length - 1;
    if (idx !== last && values[last] >= bump) {
      values[idx] += bump;
      values[last] -= bump;
    }
    const diff = 100 - values.reduce((a, b) => a + b, 0);
    values[last] += diff;
  }

  return { theme, subtitle, labels, values };
}

/* ---------------------------
   render
---------------------------- */

let chart = null;

function renderLegend(labels, values) {
  const ul = document.getElementById("legend");
  ul.innerHTML = "";
  labels.forEach((lab, i) => {
    const li = document.createElement("li");
    li.textContent = `${lab}：${values[i]}%`;
    ul.appendChild(li);
  });
}

function render(pieData) {
  document.getElementById("subtitle").textContent = `${pieData.theme} ${pieData.subtitle}`;
  renderLegend(pieData.labels, pieData.values);

  const ctx = document.getElementById("pie").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: pieData.labels,
      datasets: [{
        data: pieData.values,
        borderWidth: 1,
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => `${item.label}: ${item.formattedValue}%`
          }
        }
      }
    }
  });
}

function toShareText(pieData) {
  const lines = pieData.labels.map((l, i) => `- ${l}: ${pieData.values[i]}%`).join("\n");
  return `【意味のない円グラフ】\n${pieData.theme}\n${lines}\n(根拠なし)`;
}

/* ---------------------------
   events
---------------------------- */

let current = generatePie();
render(current);

document.getElementById("btnNew").addEventListener("click", () => {
  current = generatePie();
  render(current);
});

document.getElementById("btnSave").addEventListener("click", () => {
  if (!chart) return;
  const a = document.createElement("a");
  a.href = chart.toBase64Image("image/png", 1);
  a.download = "meaningless-pie.png";
  a.click();
});

document.getElementById("btnCopy").addEventListener("click", async () => {
  const text = toShareText(current);
  try {
    await navigator.clipboard.writeText(text);
    alert("共有文をコピーしました");
  } catch {
    prompt("コピーして使ってください", text);
  }
});
