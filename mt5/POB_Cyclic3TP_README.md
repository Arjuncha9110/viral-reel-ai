# POB Cyclic 3TP EA

`FundedNext_POB_Cyclic3TP_EA.mq5` converts the workbook's POB ladder idea into an MT5 EA.

The workbook logic found in `POB` and `POB MONTHLY OPTIONS` uses:

- Range = high - low
- ONM = range * 0.146
- Decider = range * 0.236
- Price ladders above the high and below the low using repeated ONM/Decider steps

This EA:

- Builds POB levels from previous day's high/low by default
- Trades only on cycle bars, default every 15 minutes
- Looks for level breakouts or rejections
- Opens three portions
- Sets TP1/TP2/TP3 to next POB ladder levels where possible
- Moves remaining stops after TP1/TP2 closes
- Keeps FundedNext-style daily and max-loss protections

## First Backtest

Use a bigger account first because three portions need lot-size flexibility:

- Deposit: 25000
- InitialBalance: 25000
- Symbol: XAUUSD
- Timeframe: M5
- TotalRiskPct: 0.50
- POBSource: POB_PREVIOUS_DAY
- EntryStyle: POB_BOTH
- CycleMinutes: 15
- RequireEmaDirection: true
- RequireAdxFilter: false

If it gives too few trades, change one setting at a time:

- CycleMinutes = 10
- EntryStyle = POB_BREAKOUT
- RequireEmaDirection = false

If it loses too much:

- EntryStyle = POB_REJECTION
- MinBodyToRangeRatio = 0.50
- MaxGroupsPerDay = 2
