"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Trade } from "@/lib/trades";
import { computeMonthlyStats, fmtUsd, fmtR } from "@/lib/monthlyStats";

type Unit = "usd" | "pct";

function fmtPct(n: number, digits = 2): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
}

function UnitToggle({ unit, onChange }: { unit: Unit; onChange: (u: Unit) => void }) {
  const baseBtn: React.CSSProperties = {
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 700,
    border: "none",
    background: "transparent",
    color: "#6B7280",
    cursor: "pointer",
    fontFamily: "system-ui, -apple-system, sans-serif",
    letterSpacing: 0.5,
    transition: "all 0.15s",
  };
  const activeBtn: React.CSSProperties = {
    ...baseBtn,
    background: "white",
    color: "#111",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
    borderRadius: 6,
  };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", padding: 3, background: "#F3F4F6", borderRadius: 8, border: "1px solid #E5E7EB" }}>
      <button type="button" onClick={() => onChange("usd")} style={unit === "usd" ? activeBtn : baseBtn}>$ Dollars</button>
      <button type="button" onClick={() => onChange("pct")} style={unit === "pct" ? activeBtn : baseBtn}>% Pourcent</button>
    </div>
  );
}

const ResponsiveLine = dynamic(() => import("@nivo/line").then((m) => m.ResponsiveLine), { ssr: false });
const ResponsiveBar = dynamic(() => import("@nivo/bar").then((m) => m.ResponsiveBar), { ssr: false });
const ResponsivePie = dynamic(() => import("@nivo/pie").then((m) => m.ResponsivePie), { ssr: false });

const GREEN = "#10B981";
const RED = "#EF4444";
const GOLD = "#C59E3A";
const BORDER = "#E5E7EB";
const MUTED = "#6B7280";
const TEXT = "#111";

export default function MonthlyDashboard({ trades }: { trades: Trade[] }) {
  const stats = useMemo(() => computeMonthlyStats(trades), [trades]);
  const [unit, setUnit] = useState<Unit>("usd");

  if (stats.totalTrades === 0) return null;

  const isPct = unit === "pct";
  const fmtVal = (v: number) => (isPct ? fmtPct(v) : fmtUsd(v));
  const fmtAxis = (v: number) => {
    if (isPct) return `${v.toFixed(1)}%`;
    const absV = Math.abs(v);
    const sign = v < 0 ? "-" : "";
    return `${sign}$${absV.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}`;
  };

  const equityData = [{
    id: "Equity",
    data: stats.equity.map((p) => ({ x: p.idx, y: isPct ? p.equityPct : p.equity })),
  }];
  const perTradeData = stats.perTrade.map((p) => ({
    idx: `#${p.idx}`,
    pnl: isPct ? p.pnlPct : p.pnl,
    color: p.isWin ? GREEN : RED,
    pair: p.pair,
    date: p.date,
    account: p.account ?? "",
  }));
  const hitRateData = [
    { id: "Wins", value: stats.pctWon, color: GREEN },
    { id: "Losses", value: stats.pctLost, color: RED },
  ];
  const profitLossData = [
    { id: "Profits", value: stats.profitLossRatio.profitPct, color: GREEN },
    { id: "Losses", value: stats.profitLossRatio.lossPct, color: RED },
  ];

  const cellsTop = [
    { label: "Return RR", value: fmtR(stats.returnRR), color: stats.returnRR >= 0 ? GREEN : RED },
    { label: "Return %", value: `${stats.returnPct >= 0 ? "+" : ""}${stats.returnPct.toFixed(2)}%`, color: stats.returnPct >= 0 ? GREEN : RED },
    { label: "Trade Expectancy", value: `${stats.tradeExpectancy.toFixed(2)}R`, color: stats.tradeExpectancy >= 0 ? GREEN : RED },
    { label: "Total Trades", value: String(stats.totalTrades), color: GOLD },
    { label: "Losses", value: String(stats.losses), color: RED },
    { label: "Wins", value: String(stats.wins), color: GREEN },
    { label: "% Lost", value: `${stats.pctLost.toFixed(0)}%`, color: RED },
    { label: "% Won", value: `${stats.pctWon.toFixed(0)}%`, color: GREEN },
  ];
  const cellsBot = [
    { label: "Total Losses ($)", value: stats.totalLosses === 0 ? "—" : fmtUsd(stats.totalLosses), color: RED },
    { label: "Total Profits ($)", value: fmtUsd(stats.totalProfits), color: GREEN },
    { label: "NET $", value: fmtUsd(stats.net), color: stats.net >= 0 ? GREEN : RED },
    { label: "Loss%", value: `${stats.lossPct.toFixed(0)}%`, color: RED },
    { label: "Profit%", value: `${stats.profitPct.toFixed(0)}%`, color: GREEN },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Toggle unit + meta */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: MUTED, textTransform: "uppercase", fontFamily: "system-ui, sans-serif" }}>
          {stats.accountsCount} compte{stats.accountsCount > 1 ? "s" : ""} · capital total ${stats.totalAccountSize.toLocaleString("fr-FR")}
        </div>
        <UnitToggle unit={unit} onChange={setUnit} />
      </div>

      {/* Top stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 12 }}>
        {cellsTop.map((c, i) => (
          <StatCell key={i} {...c} />
        ))}
      </div>

      {/* P&L curve + Hit Rate donut */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <ChartCard title="P & L">
          <div style={{ height: 280 }}>
            {equityData[0].data.length > 1 && (
              <ResponsiveLine
                data={equityData}
                margin={{ top: 20, right: 30, bottom: 40, left: 80 }}
                xScale={{ type: "linear" }}
                yScale={{ type: "linear", min: "auto", max: "auto" }}
                curve="monotoneX"
                axisBottom={{ tickSize: 0, tickPadding: 10, format: (v) => `#${v}` }}
                axisLeft={{ tickSize: 0, tickPadding: 10, format: (v) => fmtAxis(Number(v)) }}
                colors={[GREEN]}
                lineWidth={3}
                pointSize={6}
                pointColor="white"
                pointBorderWidth={2}
                pointBorderColor={GREEN}
                enableArea
                areaOpacity={0.15}
                enableGridX={false}
                theme={{
                  grid: { line: { stroke: BORDER, strokeWidth: 1 } },
                  axis: { ticks: { text: { fill: "#9CA3AF", fontSize: 11, fontWeight: 500 } } },
                }}
                motionConfig="gentle"
                useMesh
                tooltip={({ point }) => {
                  const idx = Number(point.data.x);
                  const y = Number(point.data.y);
                  const tr = stats.perTrade[idx - 1];
                  return (
                    <div style={{ background: "white", padding: "8px 12px", border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontFamily: "system-ui, sans-serif" }}>
                      <div style={{ fontWeight: 700, color: TEXT, marginBottom: 2 }}>Trade #{idx}{tr ? ` · ${tr.pair}` : ""}</div>
                      <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Equity cumulee : <span style={{ color: y >= 0 ? GREEN : RED, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmtVal(y)}</span></div>
                    </div>
                  );
                }}
              />
            )}
          </div>
        </ChartCard>

        <ChartCard title="Hit Rate">
          <div style={{ position: "relative", height: 280 }}>
            <ResponsivePie
              data={hitRateData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              innerRadius={0.65}
              padAngle={1}
              cornerRadius={3}
              colors={({ data }) => (data as { color: string }).color}
              enableArcLabels={false}
              enableArcLinkLabels={false}
              motionConfig="gentle"
            />
            <DonutCenter big={`${stats.pctWon.toFixed(0)}%`} small={`${stats.wins}W / ${stats.losses}L`} color={GREEN} />
          </div>
        </ChartCard>
      </div>

      {/* Bottom stats bar ($) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {cellsBot.map((c, i) => (
          <StatCell key={i} {...c} />
        ))}
      </div>

      {/* P&L per trade + Profit/Loss donut */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <ChartCard title="P & L per Trade">
          <div style={{ height: 280 }}>
            {perTradeData.length > 0 && (
              <ResponsiveBar
                data={perTradeData}
                keys={["pnl"]}
                indexBy="idx"
                margin={{ top: 20, right: 30, bottom: 70, left: 65 }}
                padding={0.35}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                colors={({ data }) => (data as { color: string }).color}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 0,
                  tickPadding: 12,
                  tickRotation: 0,
                  tickValues: perTradeData.map((d) => d.idx),
                }}
                axisLeft={{ tickSize: 0, tickPadding: 8, format: (v) => fmtAxis(Number(v)) }}
                enableLabel={false}
                borderRadius={4}
                role="application"
                layers={["grid", "bars", "markers", "legends", "axes"]}
                theme={{
                  grid: { line: { stroke: BORDER, strokeWidth: 1 } },
                  axis: {
                    ticks: { text: { fill: "#9CA3AF", fontSize: 11, fontWeight: 500 } },
                    domain: { line: { stroke: BORDER, strokeWidth: 1 } },
                  },
                }}
                motionConfig="gentle"
                tooltip={({ data, value }) => {
                  const d = data as { pair: string; date: string; account: string };
                  return (
                    <div style={{ background: "white", padding: "8px 12px", border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                      <strong>{d.pair}</strong> · {d.date}{d.account ? ` · ${d.account}` : ""}<br />
                      {fmtVal(Number(value))}
                    </div>
                  );
                }}
              />
            )}
          </div>
        </ChartCard>

        <ChartCard title="Profit / Loss">
          <div style={{ position: "relative", height: 280 }}>
            <ResponsivePie
              data={profitLossData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              innerRadius={0.65}
              padAngle={1}
              cornerRadius={3}
              colors={({ data }) => (data as { color: string }).color}
              enableArcLabels={false}
              enableArcLinkLabels={false}
              motionConfig="gentle"
            />
            <DonutCenter big={`${stats.profitLossRatio.profitPct.toFixed(0)}%`} small={fmtUsd(stats.net)} color={GREEN} />
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function StatCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: "white", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 12px", textAlign: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: MUTED, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "system-ui, -apple-system, sans-serif", fontVariantNumeric: "tabular-nums", color: color ?? TEXT, lineHeight: 1.1 }}>{value}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, color: "#374151", textAlign: "center", marginBottom: 10, textTransform: "uppercase", fontFamily: "system-ui, -apple-system, sans-serif" }}>{title}</div>
      {children}
    </div>
  );
}

function DonutCenter({ big, small, color }: { big: string; small: string; color: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ fontSize: 32, fontWeight: 800, color, fontFamily: "system-ui, -apple-system, sans-serif", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{big}</div>
      <div style={{ fontSize: 12, color: MUTED, marginTop: 6, fontWeight: 600, fontFamily: "system-ui, -apple-system, sans-serif", fontVariantNumeric: "tabular-nums" }}>{small}</div>
    </div>
  );
}
