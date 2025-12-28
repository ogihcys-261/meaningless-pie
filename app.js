// 意味のない円グラフ v1
// ルール：それっぽい / 合計100% / 解説しない

const THEMES = [
  "今日の内訳",
  "今の自分（推定）",
  "今日がこうなった理由",
  "世界のコンディション",
  "生活のノイズ",
  "体調の雰囲気",
  "インターネットの密度",
  "心の帯域幅",
  "やる気の分布（参考値）",
];

const LABEL_POOL = [
  "なんとなく",
  "よくわからない",
  "不可抗力",
  "未定義",
  "形式上",
  "その他（重要）",
  "気のせい",
  "誤差",
  "余白",
  "たぶん",
  "そういう日",
  "まだ",
  "とりあえず",
  "空気",
  "ノイズ",
  "うっすら",
  "保留",
  "後回し",
  "無",
];

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
  // ベース乱数
  const raw = Array.from({ length: k }, () => Math.random() + 0.05);
  const sum = raw.reduce((a, b) => a + b, 0);
  let vals = raw.map(x => Math.round((x / sum) * 100));

  // 調整
  let diff = 100 - vals.reduce((a, b) => a + b, 0);
  vals[vals.length - 1] += diff;

  // 負や100超えが出たら雑に修正（極端ケース対策）
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
  if (r < 0.05 && k >= 2) {
    // 99/1/0/0...
    const vals = Array(k).fill(0);
    vals[0] = 99;
    vals[1] = 1;
    return vals;
  }
  if (r < 0.10) {
    // ほぼ均等
    const base = Math.floor(100 / k);
    const vals = Array(k).fill(base);
    vals[vals.length - 1] += 100 - vals.reduce((a, b) => a + b, 0);
    return vals;
  }
  return null;
}

function generatePie() {
  const theme = THEMES[randInt(0, THEMES.length - 1)];

  const k = randInt(3, 6);
  const labels = pickUnique(LABEL_POOL, k);

  let values = maybeWeirdCase(k);
  if (!values) values = makePercentages(k);

  // UI用の「それっぽい副題」
  const subtitlePool = [
    "— 本日の結論：特にありません",
    "— 参考値（根拠なし）",
    "— 検出された傾向：不明",
    "— 解釈は各自でお願いします",
    "— なぜか納得してしまう",
  ];
  const subtitle = subtitlePool[randInt(0, subtitlePool.length - 1)];

  return { theme, subtitle, labels, values };
}

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
            // ツールチップも淡々と
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
    // クリップボードが使えない環境向けのフォールバック
    prompt("コピーして使ってください", text);
  }
});
