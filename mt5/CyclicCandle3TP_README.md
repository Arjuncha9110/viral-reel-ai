# Cyclic Candle 3TP EA

`FundedNext_CyclicCandle3TP_EA.mq5` tests a cyclic candle timing idea for XAUUSD M5.

The EA waits for a cycle close, such as every 15 minutes, then checks whether the last closed M5 candle has enough body, volatility, RSI/ADX confirmation, EMA alignment, and a small structure break. If valid, it opens three equal portions:

- TP1 at 1R
- TP2 at 2R
- TP3 at 3R

When TP1 closes, the EA moves remaining stops to TP1 when the broker allows it. When TP2 closes, it moves TP3 stop to TP2.

Default risk is 0.5% total across all three portions, not 0.5% each.

## First Backtest Inputs

- `InitialBalance = 5000`
- `TotalRiskPct = 0.50`
- `CycleMinutes = 15`
- `CycleOffsetMinutes = 0`
- `DirectionMode = CYCLE_BOTH_DIRECTIONS`
- `RequireTrendAlignment = true`
- `RequireM5EmaAlignment = true`
- `MaxTradesPerDay = 3`
- `InternalDailyStopPct = 2.00`
- `PhaseTargetPct = 8.00`

If the test produces too few trades, try only one change at a time:

- `CycleMinutes = 10`
- or `SignalLookbackBars = 1`
- or `RequireM5EmaAlignment = false`

If it loses too much, try:

- `CycleMinutes = 30`
- or `MinBodyToRangeRatio = 0.55`
- or `MinAdx = 18`
