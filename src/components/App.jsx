import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * IG Comment Gift Tool — 35+ 皮膚反應型快速自測工具
 * - Client-side only
 * - Audience can fill in and get result instantly
 * - Provides downloadable text summary (toolkit) for saving
 */

function downloadText(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const QUESTIONS = [
  {
    id: "q1",
    title: "最近半年，你嘅皮膚狀態係：",
    options: [
      { label: "冇乜大問題，但點搽都冇感覺", bucket: "A" },
      { label: "容易紅、痕、刺痛", bucket: "B" },
      { label: "乾＋暗，同時又易焗", bucket: "C" },
    ],
  },
  {
    id: "q2",
    title: "轉季時，皮膚反應通常係：",
    options: [
      { label: "冇乜反應，但氣色差", bucket: "A" },
      { label: "即刻爆／敏感", bucket: "B" },
      { label: "一時乾，一時油", bucket: "C" },
    ],
  },
  {
    id: "q3",
    title: "搽完護膚品後：",
    options: [
      { label: "好快吸收，但冇改善", bucket: "A" },
      { label: "有刺痛／焗感", bucket: "B" },
      { label: "初期OK，之後變差", bucket: "C" },
    ],
  },
  {
    id: "q4",
    title: "你依賴粉底嘅原因係：",
    options: [
      { label: "氣色暗沉", bucket: "A" },
      { label: "膚色不均／泛紅", bucket: "B" },
      { label: "容易脫妝、卡粉", bucket: "C" },
    ],
  },
];

const RESULT_COPY = {
  A: {
    title: "皮膚反應變慢型",
    body:
      "呢類皮膚常見情況係：\n用產品唔算敏感，但改善好慢，\n氣色暗、容易依賴粉底。\n\n下一步唔係轉好多產品，\n而係調整護膚節奏同配方次序。",
    tip:
      "小提醒：你要嘅通常唔係更『猛』，而係更『啱次序』。",
  },
  B: {
    title: "過度反應型",
    body:
      "呢類皮膚通常對成份反應快，\n容易紅、焗、刺痛，\n愈勤力護膚反而愈不穩定。\n\n呢個階段，重點唔係加，\n而係減同重整。",
    tip:
      "小提醒：先穩定屏障，再談美白/抗老，會快好多。",
  },
  C: {
    title: "結構失衡型",
    body:
      "常見情況係：\n一時乾、一時油，\n轉季或者轉產品就出事。\n\n呢類皮膚需要嘅，\n唔係即時效果，\n而係穩定結構。",
    tip:
      "小提醒：你唔係『皮膚差』，係結構未穩，先由底層開始。",
  },
};

function majorityBucket(counts) {
  const entries = Object.entries(counts);
  entries.sort((a, b) => b[1] - a[1]);
  const [topKey, topVal] = entries[0];
  const secondVal = entries[1][1];
  const tie = topVal === secondVal;
  return { bucket: topKey, tie };
}

function buildToolkitText({ answers, counts, resultBucket, tie }) {
  const lines = [];
  lines.push("多謝你留言 💚");
  lines.push("呢度係【35+ 皮膚反應型快速自測工具】");
  lines.push("");
  lines.push("🔍 第一部分｜近期皮膚狀況（請選最接近）");

  for (const q of QUESTIONS) {
    const pick = answers[q.id];
    const pickedLabel = pick != null ? q.options[pick]?.label : "(未作答)";
    lines.push(`${q.title}`);
    lines.push(`你選：${pickedLabel}`);
    lines.push("");
  }

  lines.push("🧠 初步判斷指引（簡化版）");
  lines.push(`A（第一項）＝${counts.A}｜B（第二項）＝${counts.B}｜C（第三項）＝${counts.C}`);
  lines.push("");

  const result = RESULT_COPY[resultBucket];
  lines.push(`你的傾向：${resultBucket} / ${result.title}${tie ? "（分佈平均：可能同時有兩種傾向）" : ""}`);
  lines.push("");
  lines.push(result.body);
  lines.push("");
  lines.push(result.tip);
  lines.push("");
  lines.push("—");
  lines.push("如果你想我用『顧問式』幫你對位：");
  lines.push("1) 你最困擾係：暗沉 / 泛紅敏感 / 卡粉脫妝 / 暗瘡粉刺？");
  lines.push("2) 你最近 7 日用緊咩：洗面 + 精華 + 面霜 + 防曬（品牌/型號）？");
  return lines.join("\n");
}

function ProgressDots({ current, total }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">進度</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full ${i < current ? "bg-foreground" : "bg-muted"}`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{current}/{total}</span>
    </div>
  );
}

export default function App() {
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const totalSteps = QUESTIONS.length;

  const counts = useMemo(() => {
    const c = { A: 0, B: 0, C: 0 };
    for (const q of QUESTIONS) {
      const pick = answers[q.id];
      if (pick == null) continue;
      const bucket = q.options[pick]?.bucket;
      if (bucket) c[bucket] += 1;
    }
    return c;
  }, [answers]);

  const completed = useMemo(() => Object.keys(answers).length === QUESTIONS.length, [answers]);

  const { bucket: resultBucket, tie } = useMemo(() => majorityBucket(counts), [counts]);

  const result = RESULT_COPY[resultBucket];

  const currentQuestion = QUESTIONS[step];

  const selectOption = (idx) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: idx }));
  };

  const canNext = answers[currentQuestion?.id] != null;

  const next = () => {
    if (step < totalSteps - 1) setStep((s) => s + 1);
  };

  const prev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const reset = () => {
    setAnswers({});
    setStep(0);
  };

  const toolkitText = useMemo(() => {
    return buildToolkitText({ answers, counts, resultBucket, tie });
  }, [answers, counts, resultBucket, tie]);

  const downloadToolkit = () => {
    const ts = new Date().toISOString().slice(0, 10);
    downloadText(`35plus_skin_reaction_toolkit_${ts}.txt`, toolkitText);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(toolkitText);
      alert("已複製到剪貼簿 ✅");
    } catch {
      alert("複製失敗：你可以手動選取文字複製。");
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto max-w-3xl p-4 md:p-8 space-y-5">
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl md:text-2xl">多謝你留言 💚</CardTitle>
                <div className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{"我已經準備好【35+ 皮膚反應型快速自測工具】\n你入去做完 4 題，會自動出結果：\nA 反應變慢型 / B 過度反應型 / C 結構失衡型\n做完再回覆我『你係A/B/C』，我會畀你下一步方向✨"}</div>
              </div>
              <Badge variant="secondary">IG 留言贈送版</Badge>
            </div>
            <div className="text-xs text-muted-foreground">（相片／答案只會留喺你自己裝置上，不會公開）</div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-5">
          <Card className="md:col-span-3">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">🔍 第一部分｜近期皮膚狀況</div>
                <ProgressDots current={Math.min(Object.keys(answers).length + 1, totalSteps)} total={totalSteps} />
              </div>
              <div className="text-sm text-muted-foreground">請選最接近（每題 1 個答案）</div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!currentQuestion ? null : (
                <div className="space-y-3">
                  <div className="text-base md:text-lg font-medium">{step + 1}️⃣ {currentQuestion.title}</div>
                  <div className="grid gap-2">
                    {currentQuestion.options.map((opt, idx) => {
                      const selected = answers[currentQuestion.id] === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectOption(idx)}
                          className={`rounded-2xl border p-3 text-left transition shadow-sm ${selected ? "border-foreground" : "border-border hover:border-muted-foreground"}`}
                        >
                          <div className="text-sm font-medium">{opt.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">點選以作答</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <Button variant="outline" onClick={prev} disabled={step === 0}>上一步</Button>
                    <Button onClick={next} disabled={!canNext || step === totalSteps - 1}>下一步</Button>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="text-sm font-medium">🧠 即時計分（簡化版）</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">A：{counts.A}</Badge>
                  <Badge variant="secondary">B：{counts.B}</Badge>
                  <Badge variant="secondary">C：{counts.C}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">完成 4 題會自動出結果。</div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>結果預覽</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!completed ? (
                <Alert>
                  <AlertTitle>未完成</AlertTitle>
                  <AlertDescription>答晒 4 題，就會顯示你嘅「皮膚反應型」傾向。</AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="text-lg md:text-xl font-semibold">{resultBucket} / {result.title}</div>
                  {tie ? (
                    <div className="text-xs text-muted-foreground">分佈比較平均：你可能同時有兩種傾向（尤其轉季/轉產品時）。</div>
                  ) : null}
                  <div className="text-sm whitespace-pre-line text-muted-foreground">{result.body}</div>
                  <div className="text-sm font-medium">{result.tip}</div>

                  <Separator />

                  <div className="space-y-2">
                    <Button className="w-full" onClick={downloadToolkit}>下載工具包（TXT）</Button>
                    <Button className="w-full" variant="outline" onClick={copyToClipboard}>複製工具包文字</Button>
                    <Button className="w-full" variant="secondary" onClick={reset}>重新自測</Button>
                  </div>

                  <div className="text-xs text-muted-foreground">（下載內容包含你每題答案＋對應判斷指引）</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
