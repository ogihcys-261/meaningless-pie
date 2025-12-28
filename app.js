// 意味のない円グラフ v2
// ルール：それっぽい / 合計100% / 解説しない
// 追加：概念モード多め、たまに無機質、たまに混合（concept推し）

function randInt(min, max) { // inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickUnique(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length > 0) {
    const i = randInt(0, copy.length - 1);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

// 合計100の整数配分を作る（端数は最後に吸収）
function makePercentages(k) {
  const raw = Array.from({ length: k }, () => Math.random() + 0.05);
  const sum = raw.reduce((a, b) => a + b, 0);
  let vals = raw.map(x => Math.round((x / sum) * 100));

  // 調整
  let diff = 100 - vals.reduce((a, b) => a + b, 0);
  vals[vals.length - 1] += diff;

  // 極端ケース対策
  for (let i = 0; i < vals.length; i++) {
    if (vals[i] < 0) vals[i] = 0;
    if (vals[i] > 100) vals[i] = 100;
  }
  // 再度合計合わせ
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
    // 0にした分を最後に足す
    const diff = 100 - vals.reduce((a, b) => a + b, 0);
    vals[vals.length - 1] += diff;
    return vals;
  }

  return null;
}

/* ---------------------------
   v2: モード辞書（概念/無機質）
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
  const a = m.subjects[randInt(0, m.subjects.length - 1)];
  const b = m.states[randInt(0, m.states.length - 1)];
  const c = m.notes[randInt(0, m.notes.length - 1)];

  const forms = [
    `今日の${a}の${b}`,
    `${a}の${b}（${c}）`,
    `${a} ${b}：${c}`,
    `${a}の${b}（参考：${c}）`,
  ];
  return forms[randInt(0, forms.length - 1)];
}

function makeLabelFrom(m) {
  const p = m.prefix[randInt(0, m.prefix.length - 1)];
  const c = m.core[randInt(0, m.core.length - 1)];
  const s = m.suffix[randInt(0, m.suffix.length - 1)];

  const forms = [
    `${c}${s}`,
    `${p}${c}${s}`,
    `${c}（${p}）`,
  ];
  return forms[randInt(0, forms.length - 1)].trim();
}

function makeUniqueLabelsFrom(m, k) {
  const set = new Set();
  while (set.size < k) set.add(makeLabelFrom(m));
  return [...set];
}

// 「概念っぽさ」を出す軽い歪み（合計は維持）
function skewConceptValues(values) {
  if (values.length < 2) return values;

  // 35%くらいで最大値を少し盛る（人生の偏り）
  if (Math.random() < 0.35) {
    const max = Math.max(...values);
    const idx = values.indexOf(max);

    // 増やす量は 4〜10
    const bump = randInt(4, 10);

    // 受け皿は最後（雑）
    const last = values.length - 1;
    if (idx !== last && values[last] >= bump) {
      values[idx] = Math.min(100, values[idx] + bump);
      values[last] -= bump;
    }
  }

  // たまに「その他（重要）」が強い
  if (Math.random() < 0.18) {
    // 「その他（重要）」に相当するラベルが居ないので、
    // 最小値のところを「吸収」した気分にする
    const min = Math.min(...values);
    const idx = values.indexOf(min);
    const take = Math.min(min, randInt(2, 6));
    const last = values.length - 1;
    if (idx !== last && take > 0) {
      values[idx] -= take;
      values[last] += take;
    }
  }

  // 最終調整（合計100）
  const diff = 100 - values.reduce((a, b) => a + b, 0);
  values[values.length - 1] += diff;

  // 0未満は戻す
  for (let i = 0; i < values.length; i++) if (values[i] < 0) values[i] = 0;
  const diff2 = 100 - values.reduce((a, b) => a + b, 0);
  values[values.length - 1] += diff2;

  return values;
}

/* ---------------------------
   生成
---------------------------- */

function generatePie() {
  const k = randInt(3, 6);

  const modePick = pickMode();

  let theme, labels, subtitle;

  if (modePick === "mixed") {
    // 混合：テーマは概念、内訳は無機質…などをランダムで入れ替え
    const a = Math.random() < 0.5 ? MODE.concept : MODE.sterile;
    const b = a === MODE.concept ? MODE.sterile : MODE.concept;

    theme = makeThemeFrom(a);
    labels = makeUniqueLabelsFrom(b, k);
    subtitle = "— mode: mixed";
  } else {
    const m = modePick;
    theme = makeThemeFrom(m);
    labels = makeUniqueLabelsFrom(m, k);
    subtitle = m.subtitle[randInt(0, m.subtitle.length - 1)];
  }

  let values = maybeWeirdCase(k);
  if (!values) values = makePercentages(k);

  // 概念モードは少し偏らせる（意味は増えない）
  if (modePick !== "mixed" && modePick.name === "concept") {
    values = skewConceptValues(values);
  }

  return { theme, subtitle, labels, values };
}

/* ---------------------------
   描画
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
   イベント
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
