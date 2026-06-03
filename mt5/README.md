# FundedNext Stellar 2-Step MT5 EA

This folder contains an MT5 Expert Advisor for a 5k FundedNext Stellar 2-Step challenge on XAUUSD M5.

Files:

- `FundedNext_Stellar2Step_XAUUSD_M5_EA.mq5` - the Expert Advisor source file.

## Current Design

The EA uses a conservative trend/pullback setup:

- EMA 20 and EMA 50 for short-term trend.
- EMA 200 for higher trend filter.
- ADX to avoid weak/choppy conditions.
- RSI 50 reclaim/reject for momentum confirmation.
- Optional breakout entries using recent highs/lows.
- ATR-based stop loss, take profit, break-even, and trailing stop.

It avoids grid, martingale, HFT, latency arbitrage, copy trading, and all-in behavior.

## Default 5k Stellar 2-Step Risk Settings

- Initial balance: 5000
- Risk per trade: 0.5%
- Max trades per day: 3
- Internal daily stop: 2%
- FundedNext daily loss reference: 5%
- FundedNext maximum loss reference: 10%
- Phase target: 8% by default

For Phase 2, change `PhaseTargetPct` from `8.00` to `5.00`.

The default `StrategyProfile` is `FNCC_CHALLENGE`, which allows more signals than the first conservative version. In challenge mode, breakout trades do not need full EMA 200 alignment by default, but still use the EMA 20/50 filter unless `RequireFastSlowForBreakout` is disabled. Use `FNCC_BALANCED` or `FNCC_CONSERVATIVE` if drawdown is too high.

## Install In MT5

1. Open MetaTrader 5.
2. Go to `File > Open Data Folder`.
3. Open `MQL5 > Experts`.
4. Copy `FundedNext_Stellar2Step_XAUUSD_M5_EA.mq5` into that folder.
5. Open MetaEditor.
6. Open the EA file and click `Compile`.
7. In MT5, attach it to an `XAUUSD` `M5` chart.
8. Enable Algo Trading only after testing on a demo account.

## Important Before FundedNext Use

Confirm in your FundedNext dashboard that your MT5 account has EA/bot trading enabled and any required add-on has been paid or activated. Public official FundedNext pages can differ by account/platform, so dashboard rules are the final source.

Run the EA in Strategy Tester and demo first. This is not a guaranteed challenge-passing bot.
