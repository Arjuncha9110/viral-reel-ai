#property copyright "Codex"
#property version   "1.01"
#property strict

#include <Trade/Trade.mqh>

CTrade trade;

enum ENUM_FNAC_REGIME
{
   REGIME_UNKNOWN = 0,
   REGIME_TREND_UP = 1,
   REGIME_TREND_DOWN = -1,
   REGIME_RANGE = 2
};

struct TradeSignal
{
   int direction;
   double stopDistance;
   double rewardRisk;
   double riskMultiplier;
   double score;
   string tag;
};

input string          TradingSymbol              = "XAUUSD";
input ENUM_TIMEFRAMES ExecutionTimeframe         = PERIOD_M5;
input ENUM_TIMEFRAMES RegimeTimeframe            = PERIOD_H1;
input long            MagicNumber                = 26052502;

input double          InitialBalance             = 5000.0;
input double          RiskPerTradePct            = 0.50;
input int             MaxTradesPerDay            = 3;
input int             MaxOpenEaPositions         = 1;
input int             MaxConsecutiveLosses       = 2;
input double          InternalDailyStopPct       = 2.00;
input bool            UseDailyProfitLock         = true;
input double          DailyProfitLockPct         = 1.25;
input double          FundedNextDailyLossPct     = 5.00;
input double          FundedNextMaxLossPct       = 10.00;
input double          DailyLossSafetyBufferPct   = 0.75;
input double          MaxLossSafetyBufferPct     = 1.00;
input double          PhaseTargetPct             = 8.00;
input bool            StopAtProfitTarget         = true;
input bool            CloseEaPositionsAtTarget   = true;
input bool            MonitorWholeAccountPnL     = true;
input bool            CloseEaPositionsOnStop     = true;
input bool            ManualPause                = false;

input bool            TradeLondonSession         = true;
input int             LondonStartHourServer      = 7;
input int             LondonEndHourServer        = 12;
input bool            TradeNewYorkSession        = true;
input int             NewYorkStartHourServer     = 13;
input int             NewYorkEndHourServer       = 18;
input bool            AvoidServerRollover        = true;
input int             MinutesBeforeMidnightBlock = 20;
input int             MinutesAfterMidnightBlock  = 20;
input bool            CloseBeforeServerMidnight  = false;
input int             CloseMinutesBeforeMidnight = 10;
input int             MaxSpreadPoints            = 350;
input int             SlippagePoints             = 30;

input bool            UseTrendPullback           = true;
input bool            UseOpeningRangeBreakout    = false;  // NoORB version: keep false
input bool            UseVwapReclaim             = true;
input bool            UseRangeReversion          = false;
input int             OpeningRangeMinutes        = 30;
input int             BreakoutLookbackBars       = 18;
input double          BreakoutAtrBuffer          = 0.05;
input bool            RequireRegimeForBreakout   = true;

input int             ExecFastEmaPeriod          = 20;
input int             ExecSlowEmaPeriod          = 50;
input int             RegimeFastEmaPeriod        = 50;
input int             RegimeSlowEmaPeriod        = 200;
input int             RsiPeriod                  = 14;
input int             AdxPeriod                  = 14;
input int             AtrPeriod                  = 14;
input int             BollingerPeriod            = 20;
input double          BollingerDeviation         = 2.0;
input double          TrendAdxThreshold          = 16.0;
input double          RangeAdxThreshold          = 17.0;
input double          MinAtrPoints               = 80.0;
input double          MaxAtrPoints               = 2800.0;

input double          TrendStopAtr               = 1.50;
input double          BreakoutStopAtr            = 1.25;
input double          VwapStopAtr                = 1.35;
input double          RangeStopAtr               = 1.10;
input double          TrendRewardRisk            = 1.80;
input double          BreakoutRewardRisk         = 1.55;
input double          VwapRewardRisk             = 1.50;
input double          RangeRewardRisk            = 1.05;

input bool            UseBreakEven               = true;
input double          BreakEvenAtR               = 0.95;
input int             BreakEvenPlusPoints        = 25;
input bool            UseTrailingStop            = true;
input double          TrailAtR                   = 1.25;
input double          TrailAtrMultiplier         = 1.10;

string tradeSymbol;
int execFastHandle = INVALID_HANDLE;
int execSlowHandle = INVALID_HANDLE;
int execRsiHandle = INVALID_HANDLE;
int execAdxHandle = INVALID_HANDLE;
int execAtrHandle = INVALID_HANDLE;
int execBandsHandle = INVALID_HANDLE;
int regimeFastHandle = INVALID_HANDLE;
int regimeSlowHandle = INVALID_HANDLE;
int regimeAdxHandle = INVALID_HANDLE;
datetime lastBarTime = 0;
string lastBlockReason = "";

int OnInit()
{
   tradeSymbol = TradingSymbol;
   if(tradeSymbol == "")
      tradeSymbol = _Symbol;

   if(!SymbolSelect(tradeSymbol, true))
   {
      Print("Could not select symbol: ", tradeSymbol);
      return INIT_FAILED;
   }

   execFastHandle = iMA(tradeSymbol, ExecutionTimeframe, ExecFastEmaPeriod, 0, MODE_EMA, PRICE_CLOSE);
   execSlowHandle = iMA(tradeSymbol, ExecutionTimeframe, ExecSlowEmaPeriod, 0, MODE_EMA, PRICE_CLOSE);
   execRsiHandle = iRSI(tradeSymbol, ExecutionTimeframe, RsiPeriod, PRICE_CLOSE);
   execAdxHandle = iADX(tradeSymbol, ExecutionTimeframe, AdxPeriod);
   execAtrHandle = iATR(tradeSymbol, ExecutionTimeframe, AtrPeriod);
   execBandsHandle = iBands(tradeSymbol, ExecutionTimeframe, BollingerPeriod, 0, BollingerDeviation, PRICE_CLOSE);
   regimeFastHandle = iMA(tradeSymbol, RegimeTimeframe, RegimeFastEmaPeriod, 0, MODE_EMA, PRICE_CLOSE);
   regimeSlowHandle = iMA(tradeSymbol, RegimeTimeframe, RegimeSlowEmaPeriod, 0, MODE_EMA, PRICE_CLOSE);
   regimeAdxHandle = iADX(tradeSymbol, RegimeTimeframe, AdxPeriod);

   if(execFastHandle == INVALID_HANDLE || execSlowHandle == INVALID_HANDLE ||
      execRsiHandle == INVALID_HANDLE || execAdxHandle == INVALID_HANDLE ||
      execAtrHandle == INVALID_HANDLE || execBandsHandle == INVALID_HANDLE ||
      regimeFastHandle == INVALID_HANDLE || regimeSlowHandle == INVALID_HANDLE ||
      regimeAdxHandle == INVALID_HANDLE)
   {
      Print("Failed to create one or more indicator handles.");
      return INIT_FAILED;
   }

   trade.SetExpertMagicNumber(MagicNumber);
   trade.SetDeviationInPoints(SlippagePoints);
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
   if(execFastHandle != INVALID_HANDLE) IndicatorRelease(execFastHandle);
   if(execSlowHandle != INVALID_HANDLE) IndicatorRelease(execSlowHandle);
   if(execRsiHandle != INVALID_HANDLE) IndicatorRelease(execRsiHandle);
   if(execAdxHandle != INVALID_HANDLE) IndicatorRelease(execAdxHandle);
   if(execAtrHandle != INVALID_HANDLE) IndicatorRelease(execAtrHandle);
   if(execBandsHandle != INVALID_HANDLE) IndicatorRelease(execBandsHandle);
   if(regimeFastHandle != INVALID_HANDLE) IndicatorRelease(regimeFastHandle);
   if(regimeSlowHandle != INVALID_HANDLE) IndicatorRelease(regimeSlowHandle);
   if(regimeAdxHandle != INVALID_HANDLE) IndicatorRelease(regimeAdxHandle);
   Comment("");
}

void OnTick()
{
   ManageOpenPositions();

   if(CloseBeforeServerMidnight && IsCloseBeforeMidnightWindow())
   {
      CloseEaPositions();
      UpdatePanel(true, "Close-before-midnight window");
      return;
   }

   string reason = "";
   bool blocked = SafetyBlocksTrading(reason);
   UpdatePanel(blocked, reason);

   if(blocked)
   {
      if(ShouldCloseForReason(reason))
         CloseEaPositions();
      return;
   }

   if(!IsNewBar())
      return;

   if(CountOpenEaPositions() >= MaxOpenEaPositions)
      return;

   if(CountTodayEaEntries() >= MaxTradesPerDay)
      return;

   TradeSignal signal;
   ResetSignal(signal);

   if(!BuildBestSignal(signal))
      return;

   PlaceTrade(signal);
}

void ResetSignal(TradeSignal &signal)
{
   signal.direction = 0;
   signal.stopDistance = 0.0;
   signal.rewardRisk = 0.0;
   signal.riskMultiplier = 1.0;
   signal.score = 0.0;
   signal.tag = "";
}

bool SafetyBlocksTrading(string &reason)
{
   reason = "";

   if(ManualPause)
   {
      reason = "ManualPause is enabled";
      return true;
   }

   if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED) ||
      !MQLInfoInteger(MQL_TRADE_ALLOWED) ||
      !AccountInfoInteger(ACCOUNT_TRADE_ALLOWED))
   {
      reason = "Trading is not allowed by terminal, EA settings, or account";
      return true;
   }

   if(!IsWithinTradeSession())
   {
      reason = "Outside London/New York session filter";
      return true;
   }

   if(IsRolloverWindow())
   {
      reason = "Server rollover protection window";
      return true;
   }

   if(CurrentSpreadPoints() > MaxSpreadPoints)
   {
      reason = "Spread is too high";
      return true;
   }

   if(CountConsecutiveEaLosses() >= MaxConsecutiveLosses)
   {
      reason = "Max consecutive losses reached";
      return true;
   }

   double dailyPnl = GetDailyPnl();
   double internalDailyLimit = InitialBalance * InternalDailyStopPct / 100.0;
   double fundedDailyLimit = InitialBalance * FundedNextDailyLossPct / 100.0;
   double fundedDailyBuffer = InitialBalance * DailyLossSafetyBufferPct / 100.0;

   if(dailyPnl <= -internalDailyLimit)
   {
      reason = "Internal daily stop reached";
      return true;
   }

   if(dailyPnl <= -(fundedDailyLimit - fundedDailyBuffer))
   {
      reason = "Too close to FundedNext daily loss limit";
      return true;
   }

   if(UseDailyProfitLock && dailyPnl >= InitialBalance * DailyProfitLockPct / 100.0)
   {
      reason = "Daily profit lock reached";
      return true;
   }

   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double maxLossFloor = InitialBalance * (1.0 - FundedNextMaxLossPct / 100.0);
   double maxLossBuffer = InitialBalance * MaxLossSafetyBufferPct / 100.0;

   if(equity <= maxLossFloor + maxLossBuffer)
   {
      reason = "Too close to FundedNext maximum loss limit";
      return true;
   }

   if(StopAtProfitTarget)
   {
      double targetEquity = InitialBalance * (1.0 + PhaseTargetPct / 100.0);
      if(equity >= targetEquity)
      {
         reason = "Phase profit target reached";
         return true;
      }
   }

   return false;
}

bool ShouldCloseForReason(const string reason)
{
   if(StringFind(reason, "profit target") >= 0)
      return CloseEaPositionsAtTarget;

   if(StringFind(reason, "daily stop") >= 0 ||
      StringFind(reason, "daily loss") >= 0 ||
      StringFind(reason, "maximum loss") >= 0)
      return CloseEaPositionsOnStop;

   return false;
}

bool BuildBestSignal(TradeSignal &best)
{
   ResetSignal(best);

   ENUM_FNAC_REGIME regime = DetectRegime();
   double atr = CurrentAtrValue();
   double point = SymbolInfoDouble(tradeSymbol, SYMBOL_POINT);
   if(atr <= 0.0 || point <= 0.0)
      return false;

   double atrPoints = atr / point;
   if(atrPoints < MinAtrPoints || atrPoints > MaxAtrPoints)
      return false;

   TradeSignal candidate;
   ResetSignal(candidate);

   if(UseOpeningRangeBreakout && OpeningRangeBreakoutSignal(candidate, regime, atr))
      PickBetterSignal(best, candidate);

   if(UseTrendPullback && TrendPullbackSignal(candidate, regime, atr))
      PickBetterSignal(best, candidate);

   if(UseVwapReclaim && VwapReclaimSignal(candidate, regime, atr))
      PickBetterSignal(best, candidate);

   if(UseRangeReversion && RangeReversionSignal(candidate, regime, atr))
      PickBetterSignal(best, candidate);

   return best.direction != 0 && best.stopDistance > 0.0;
}

void PickBetterSignal(TradeSignal &best, const TradeSignal &candidate)
{
   if(candidate.direction == 0 || candidate.stopDistance <= 0.0)
      return;

   if(best.direction == 0 || candidate.score > best.score)
      best = candidate;
}

ENUM_FNAC_REGIME DetectRegime()
{
   MqlRates rates[];
   double fast[], slow[], adx[];
   ArrayResize(rates, 3);
   ArrayResize(fast, 3);
   ArrayResize(slow, 3);
   ArrayResize(adx, 3);
   ArraySetAsSeries(rates, true);
   ArraySetAsSeries(fast, true);
   ArraySetAsSeries(slow, true);
   ArraySetAsSeries(adx, true);

   if(CopyRates(tradeSymbol, RegimeTimeframe, 0, 3, rates) < 3) return REGIME_UNKNOWN;
   if(CopyBuffer(regimeFastHandle, 0, 0, 3, fast) < 3) return REGIME_UNKNOWN;
   if(CopyBuffer(regimeSlowHandle, 0, 0, 3, slow) < 3) return REGIME_UNKNOWN;
   if(CopyBuffer(regimeAdxHandle, 0, 0, 3, adx) < 3) return REGIME_UNKNOWN;

   if(adx[1] <= RangeAdxThreshold)
      return REGIME_RANGE;

   if(rates[1].close > fast[1] && fast[1] > slow[1] && adx[1] >= TrendAdxThreshold)
      return REGIME_TREND_UP;

   if(rates[1].close < fast[1] && fast[1] < slow[1] && adx[1] >= TrendAdxThreshold)
      return REGIME_TREND_DOWN;

   return REGIME_UNKNOWN;
}

bool TrendPullbackSignal(TradeSignal &signal, const ENUM_FNAC_REGIME regime, const double atr)
{
   ResetSignal(signal);

   if(regime != REGIME_TREND_UP && regime != REGIME_TREND_DOWN)
      return false;

   MqlRates rates[];
   double fast[], slow[], rsi[], adx[];
   ArrayResize(rates, 8);
   ArrayResize(fast, 4);
   ArrayResize(slow, 4);
   ArrayResize(rsi, 4);
   ArrayResize(adx, 4);
   ArraySetAsSeries(rates, true);
   ArraySetAsSeries(fast, true);
   ArraySetAsSeries(slow, true);
   ArraySetAsSeries(rsi, true);
   ArraySetAsSeries(adx, true);

   if(CopyRates(tradeSymbol, ExecutionTimeframe, 0, 8, rates) < 8) return false;
   if(CopyBuffer(execFastHandle, 0, 0, 4, fast) < 4) return false;
   if(CopyBuffer(execSlowHandle, 0, 0, 4, slow) < 4) return false;
   if(CopyBuffer(execRsiHandle, 0, 0, 4, rsi) < 4) return false;
   if(CopyBuffer(execAdxHandle, 0, 0, 4, adx) < 4) return false;

   bool buy = regime == REGIME_TREND_UP &&
              fast[1] > slow[1] &&
              rates[1].low <= fast[1] &&
              rates[1].close > fast[1] &&
              rates[1].close > rates[1].open &&
              rsi[1] >= 48.0 && rsi[1] <= 70.0;

   bool sell = regime == REGIME_TREND_DOWN &&
               fast[1] < slow[1] &&
               rates[1].high >= fast[1] &&
               rates[1].close < fast[1] &&
               rates[1].close < rates[1].open &&
               rsi[1] <= 52.0 && rsi[1] >= 30.0;

   if(!buy && !sell)
      return false;

   int direction = buy ? 1 : -1;
   double swingStop = SwingStopDistance(direction, rates, 7, atr * 0.20);
   signal.direction = direction;
   signal.stopDistance = MathMax(atr * TrendStopAtr, swingStop);
   signal.rewardRisk = TrendRewardRisk;
   signal.riskMultiplier = 1.00;
   signal.score = 70.0 + adx[1] + MathAbs(rsi[1] - 50.0);
   signal.tag = "TrendPullback";
   return true;
}

bool OpeningRangeBreakoutSignal(TradeSignal &signal, const ENUM_FNAC_REGIME regime, const double atr)
{
   ResetSignal(signal);

   double rangeHigh = 0.0;
   double rangeLow = 0.0;
   string sessionTag = "";

   if(!GetActiveOpeningRange(rangeHigh, rangeLow, sessionTag))
      return false;

   MqlRates rates[];
   double rsi[], adx[];
   ArrayResize(rates, 4);
   ArrayResize(rsi, 4);
   ArrayResize(adx, 4);
   ArraySetAsSeries(rates, true);
   ArraySetAsSeries(rsi, true);
   ArraySetAsSeries(adx, true);

   if(CopyRates(tradeSymbol, ExecutionTimeframe, 0, 4, rates) < 4) return false;
   if(CopyBuffer(execRsiHandle, 0, 0, 4, rsi) < 4) return false;
   if(CopyBuffer(execAdxHandle, 0, 0, 4, adx) < 4) return false;

   if(adx[1] < 13.0)
      return false;

   double buffer = atr * BreakoutAtrBuffer;
   bool buyAllowed = !RequireRegimeForBreakout || regime == REGIME_TREND_UP || regime == REGIME_UNKNOWN;
   bool sellAllowed = !RequireRegimeForBreakout || regime == REGIME_TREND_DOWN || regime == REGIME_UNKNOWN;

   bool buy = buyAllowed &&
              rates[1].close > rangeHigh + buffer &&
              rates[1].close > rates[1].open &&
              rsi[1] >= 52.0;

   bool sell = sellAllowed &&
               rates[1].close < rangeLow - buffer &&
               rates[1].close < rates[1].open &&
               rsi[1] <= 48.0;

   if(!buy && !sell)
      return false;

   double rangeSize = MathMax(rangeHigh - rangeLow, atr);
   signal.direction = buy ? 1 : -1;
   signal.stopDistance = MathMax(atr * BreakoutStopAtr, rangeSize * 0.55);
   signal.rewardRisk = BreakoutRewardRisk;
   signal.riskMultiplier = 1.00;
   signal.score = 80.0 + adx[1] + MathAbs(rsi[1] - 50.0);
   signal.tag = sessionTag + "ORB";
   return true;
}

bool VwapReclaimSignal(TradeSignal &signal, const ENUM_FNAC_REGIME regime, const double atr)
{
   ResetSignal(signal);

   if(regime != REGIME_TREND_UP && regime != REGIME_TREND_DOWN)
      return false;

   double vwap = SessionVwap();
   if(vwap <= 0.0)
      return false;

   MqlRates rates[];
   double rsi[], fast[], slow[];
   ArrayResize(rates, 4);
   ArrayResize(rsi, 4);
   ArrayResize(fast, 4);
   ArrayResize(slow, 4);
   ArraySetAsSeries(rates, true);
   ArraySetAsSeries(rsi, true);
   ArraySetAsSeries(fast, true);
   ArraySetAsSeries(slow, true);

   if(CopyRates(tradeSymbol, ExecutionTimeframe, 0, 4, rates) < 4) return false;
   if(CopyBuffer(execRsiHandle, 0, 0, 4, rsi) < 4) return false;
   if(CopyBuffer(execFastHandle, 0, 0, 4, fast) < 4) return false;
   if(CopyBuffer(execSlowHandle, 0, 0, 4, slow) < 4) return false;

   bool buy = regime == REGIME_TREND_UP &&
              fast[1] > slow[1] &&
              rates[1].low <= vwap &&
              rates[1].close > vwap &&
              rates[1].close > rates[1].open &&
              rsi[1] > 50.0;

   bool sell = regime == REGIME_TREND_DOWN &&
               fast[1] < slow[1] &&
               rates[1].high >= vwap &&
               rates[1].close < vwap &&
               rates[1].close < rates[1].open &&
               rsi[1] < 50.0;

   if(!buy && !sell)
      return false;

   signal.direction = buy ? 1 : -1;
   signal.stopDistance = atr * VwapStopAtr;
   signal.rewardRisk = VwapRewardRisk;
   signal.riskMultiplier = 0.85;
   signal.score = 66.0 + MathAbs(rsi[1] - 50.0);
   signal.tag = "VWAPReclaim";
   return true;
}

bool RangeReversionSignal(TradeSignal &signal, const ENUM_FNAC_REGIME regime, const double atr)
{
   ResetSignal(signal);

   if(regime != REGIME_RANGE)
      return false;

   MqlRates rates[];
   double rsi[], adx[], upper[], lower[], middle[];
   ArrayResize(rates, 4);
   ArrayResize(rsi, 4);
   ArrayResize(adx, 4);
   ArrayResize(upper, 4);
   ArrayResize(lower, 4);
   ArrayResize(middle, 4);
   ArraySetAsSeries(rates, true);
   ArraySetAsSeries(rsi, true);
   ArraySetAsSeries(adx, true);
   ArraySetAsSeries(upper, true);
   ArraySetAsSeries(lower, true);
   ArraySetAsSeries(middle, true);

   if(CopyRates(tradeSymbol, ExecutionTimeframe, 0, 4, rates) < 4) return false;
   if(CopyBuffer(execRsiHandle, 0, 0, 4, rsi) < 4) return false;
   if(CopyBuffer(execAdxHandle, 0, 0, 4, adx) < 4) return false;
   if(CopyBuffer(execBandsHandle, 0, 0, 4, middle) < 4) return false;
   if(CopyBuffer(execBandsHandle, 1, 0, 4, upper) < 4) return false;
   if(CopyBuffer(execBandsHandle, 2, 0, 4, lower) < 4) return false;

   if(adx[1] > RangeAdxThreshold + 3.0)
      return false;

   bool buy = rates[1].low < lower[1] &&
              rates[1].close > lower[1] &&
              rates[1].close > rates[1].open &&
              rsi[1] <= 35.0;

   bool sell = rates[1].high > upper[1] &&
               rates[1].close < upper[1] &&
               rates[1].close < rates[1].open &&
               rsi[1] >= 65.0;

   if(!buy && !sell)
      return false;

   signal.direction = buy ? 1 : -1;
   signal.stopDistance = atr * RangeStopAtr;
   signal.rewardRisk = RangeRewardRisk;
   signal.riskMultiplier = 0.55;
   signal.score = 52.0 + MathAbs(rsi[1] - 50.0);
   signal.tag = "RangeReversion";
   return true;
}

double SwingStopDistance(const int direction, const MqlRates &rates[], const int bars, const double buffer)
{
   double entry = direction > 0 ? SymbolInfoDouble(tradeSymbol, SYMBOL_ASK)
                                : SymbolInfoDouble(tradeSymbol, SYMBOL_BID);
   if(entry <= 0.0)
      return 0.0;

   double stop = direction > 0 ? rates[1].low : rates[1].high;
   for(int i = 2; i < bars; i++)
   {
      if(direction > 0)
         stop = MathMin(stop, rates[i].low);
      else
         stop = MathMax(stop, rates[i].high);
   }

   if(direction > 0)
      return MathAbs(entry - (stop - buffer));

   return MathAbs((stop + buffer) - entry);
}

bool GetActiveOpeningRange(double &rangeHigh, double &rangeLow, string &sessionTag)
{
   datetime now = TimeTradeServerSafe();
   MqlDateTime dt;
   TimeToStruct(now, dt);

   datetime todayStart = DayStart(now);

   if(TradeLondonSession)
   {
      datetime londonStart = todayStart + LondonStartHourServer * 3600;
      datetime londonRangeEnd = londonStart + OpeningRangeMinutes * 60;
      datetime londonEnd = todayStart + LondonEndHourServer * 3600;

      if(now > londonRangeEnd && now < londonEnd &&
         BuildRange(londonStart, londonRangeEnd, rangeHigh, rangeLow))
      {
         sessionTag = "London";
         return true;
      }
   }

   if(TradeNewYorkSession)
   {
      datetime nyStart = todayStart + NewYorkStartHourServer * 3600;
      datetime nyRangeEnd = nyStart + OpeningRangeMinutes * 60;
      datetime nyEnd = todayStart + NewYorkEndHourServer * 3600;

      if(now > nyRangeEnd && now < nyEnd &&
         BuildRange(nyStart, nyRangeEnd, rangeHigh, rangeLow))
      {
         sessionTag = "NY";
         return true;
      }
   }

   return false;
}

bool BuildRange(const datetime startTime, const datetime endTime, double &rangeHigh, double &rangeLow)
{
   MqlRates rates[];
   ArraySetAsSeries(rates, true);
   int copied = CopyRates(tradeSymbol, ExecutionTimeframe, startTime, endTime, rates);
   if(copied < 3)
      return false;

   rangeHigh = rates[0].high;
   rangeLow = rates[0].low;

   for(int i = 1; i < copied; i++)
   {
      rangeHigh = MathMax(rangeHigh, rates[i].high);
      rangeLow = MathMin(rangeLow, rates[i].low);
   }

   return rangeHigh > rangeLow;
}

double SessionVwap()
{
   datetime start = DayStart(TimeTradeServerSafe());
   datetime now = TimeTradeServerSafe();
   MqlRates rates[];
   ArraySetAsSeries(rates, false);
   int copied = CopyRates(tradeSymbol, ExecutionTimeframe, start, now, rates);
   if(copied < 5)
      return 0.0;

   double pv = 0.0;
   double volume = 0.0;

   for(int i = 0; i < copied; i++)
   {
      double typical = (rates[i].high + rates[i].low + rates[i].close) / 3.0;
      double v = (double)rates[i].tick_volume;
      if(v <= 0.0)
         v = 1.0;
      pv += typical * v;
      volume += v;
   }

   if(volume <= 0.0)
      return 0.0;

   return pv / volume;
}

void PlaceTrade(const TradeSignal &signal)
{
   double ask = SymbolInfoDouble(tradeSymbol, SYMBOL_ASK);
   double bid = SymbolInfoDouble(tradeSymbol, SYMBOL_BID);
   double point = SymbolInfoDouble(tradeSymbol, SYMBOL_POINT);
   int digits = (int)SymbolInfoInteger(tradeSymbol, SYMBOL_DIGITS);
   int stopsLevel = (int)SymbolInfoInteger(tradeSymbol, SYMBOL_TRADE_STOPS_LEVEL);
   double minStopDistance = MathMax(stopsLevel * point, point);

   ENUM_ORDER_TYPE orderType = signal.direction > 0 ? ORDER_TYPE_BUY : ORDER_TYPE_SELL;
   double entry = signal.direction > 0 ? ask : bid;
   double stopDistance = MathMax(signal.stopDistance, minStopDistance);
   double sl = signal.direction > 0 ? entry - stopDistance : entry + stopDistance;
   double tp = signal.direction > 0 ? entry + stopDistance * signal.rewardRisk
                                    : entry - stopDistance * signal.rewardRisk;

   sl = NormalizeDouble(sl, digits);
   tp = NormalizeDouble(tp, digits);

   double lots = CalculateLots(orderType, entry, sl, signal.riskMultiplier);
   if(lots <= 0.0)
   {
      Print("Lot calculation returned zero. Trade skipped. Signal=", signal.tag);
      return;
   }

   bool ok = false;
   string comment = "FNAC " + signal.tag;

   if(signal.direction > 0)
      ok = trade.Buy(lots, tradeSymbol, 0.0, sl, tp, comment);
   else
      ok = trade.Sell(lots, tradeSymbol, 0.0, sl, tp, comment);

   if(!ok)
      Print("Order failed. Signal=", signal.tag, " Retcode=", trade.ResultRetcode(), " ", trade.ResultRetcodeDescription());
}

double CalculateLots(const ENUM_ORDER_TYPE orderType, const double entry, const double sl, const double riskMultiplier)
{
   double riskPct = RiskPerTradePct * MathMax(0.10, MathMin(1.25, riskMultiplier));
   double riskMoney = AccountInfoDouble(ACCOUNT_BALANCE) * riskPct / 100.0;
   double dailyRemaining = MathMax(0.0, InitialBalance * InternalDailyStopPct / 100.0 + GetDailyPnl());
   riskMoney = MathMin(riskMoney, dailyRemaining * 0.45);

   double profitForOneLot = 0.0;
   if(!OrderCalcProfit(orderType, tradeSymbol, 1.0, entry, sl, profitForOneLot))
      return 0.0;

   double riskPerLot = MathAbs(profitForOneLot);
   if(riskPerLot <= 0.0)
      return 0.0;

   double rawLots = riskMoney / riskPerLot;
   double minLot = SymbolInfoDouble(tradeSymbol, SYMBOL_VOLUME_MIN);
   if(rawLots < minLot)
      return 0.0;

   return NormalizeVolume(rawLots);
}

double NormalizeVolume(double lots)
{
   double minLot = SymbolInfoDouble(tradeSymbol, SYMBOL_VOLUME_MIN);
   double maxLot = SymbolInfoDouble(tradeSymbol, SYMBOL_VOLUME_MAX);
   double step = SymbolInfoDouble(tradeSymbol, SYMBOL_VOLUME_STEP);

   if(step <= 0.0)
      return 0.0;

   if(lots < minLot)
      return 0.0;

   lots = MathFloor(lots / step) * step;
   lots = MathMin(maxLot, lots);

   int volumeDigits = 0;
   double probe = step;
   while(probe < 1.0 && volumeDigits < 8)
   {
      probe *= 10.0;
      volumeDigits++;
   }

   double normalized = NormalizeDouble(lots, volumeDigits);
   if(normalized < minLot)
      return 0.0;

   return normalized;
}

void ManageOpenPositions()
{
   if(!UseBreakEven && !UseTrailingStop)
      return;

   double atr = CurrentAtrValue();
   if(atr <= 0.0)
      return;

   double point = SymbolInfoDouble(tradeSymbol, SYMBOL_POINT);
   int digits = (int)SymbolInfoInteger(tradeSymbol, SYMBOL_DIGITS);
   double bid = SymbolInfoDouble(tradeSymbol, SYMBOL_BID);
   double ask = SymbolInfoDouble(tradeSymbol, SYMBOL_ASK);
   double baseRiskDistance = atr * TrendStopAtr;

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0 || !PositionSelectByTicket(ticket))
         continue;

      if(PositionGetString(POSITION_SYMBOL) != tradeSymbol)
         continue;

      if((long)PositionGetInteger(POSITION_MAGIC) != MagicNumber)
         continue;

      long type = PositionGetInteger(POSITION_TYPE);
      double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
      double sl = PositionGetDouble(POSITION_SL);
      double tp = PositionGetDouble(POSITION_TP);
      double current = type == POSITION_TYPE_BUY ? bid : ask;
      double profitDistance = type == POSITION_TYPE_BUY ? current - openPrice : openPrice - current;

      if(profitDistance <= 0.0)
         continue;

      double newSl = sl;

      if(UseBreakEven && profitDistance >= baseRiskDistance * BreakEvenAtR)
      {
         double be = type == POSITION_TYPE_BUY ? openPrice + BreakEvenPlusPoints * point
                                               : openPrice - BreakEvenPlusPoints * point;
         if(type == POSITION_TYPE_BUY && (sl == 0.0 || be > sl))
            newSl = be;
         if(type == POSITION_TYPE_SELL && (sl == 0.0 || be < sl))
            newSl = be;
      }

      if(UseTrailingStop && profitDistance >= baseRiskDistance * TrailAtR)
      {
         double trail = type == POSITION_TYPE_BUY ? current - atr * TrailAtrMultiplier
                                                  : current + atr * TrailAtrMultiplier;
         if(type == POSITION_TYPE_BUY && trail > newSl)
            newSl = trail;
         if(type == POSITION_TYPE_SELL && (newSl == 0.0 || trail < newSl))
            newSl = trail;
      }

      newSl = NormalizeDouble(newSl, digits);
      if(newSl > 0.0 && MathAbs(newSl - sl) >= point)
      {
         if(!trade.PositionModify(ticket, newSl, tp))
            Print("PositionModify failed. Retcode=", trade.ResultRetcode(), " ", trade.ResultRetcodeDescription());
      }
   }
}

double CurrentAtrValue()
{
   double atr[];
   ArrayResize(atr, 2);
   ArraySetAsSeries(atr, true);
   if(CopyBuffer(execAtrHandle, 0, 0, 2, atr) < 2)
      return 0.0;
   return atr[1];
}

int CountOpenEaPositions()
{
   int count = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0 || !PositionSelectByTicket(ticket))
         continue;

      if(PositionGetString(POSITION_SYMBOL) == tradeSymbol &&
         (long)PositionGetInteger(POSITION_MAGIC) == MagicNumber)
         count++;
   }
   return count;
}

void CloseEaPositions()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0 || !PositionSelectByTicket(ticket))
         continue;

      if(PositionGetString(POSITION_SYMBOL) != tradeSymbol)
         continue;

      if((long)PositionGetInteger(POSITION_MAGIC) != MagicNumber)
         continue;

      if(!trade.PositionClose(ticket))
         Print("PositionClose failed. Retcode=", trade.ResultRetcode(), " ", trade.ResultRetcodeDescription());
   }
}

double GetDailyPnl()
{
   datetime start = DayStart(TimeTradeServerSafe());
   datetime now = TimeTradeServerSafe();
   double pnl = 0.0;

   if(HistorySelect(start, now))
   {
      int deals = HistoryDealsTotal();
      for(int i = 0; i < deals; i++)
      {
         ulong deal = HistoryDealGetTicket(i);
         if(deal == 0)
            continue;

         long type = HistoryDealGetInteger(deal, DEAL_TYPE);
         if(type != DEAL_TYPE_BUY && type != DEAL_TYPE_SELL)
            continue;

         if(!DealPassesMonitorFilter(deal))
            continue;

         pnl += HistoryDealGetDouble(deal, DEAL_PROFIT);
         pnl += HistoryDealGetDouble(deal, DEAL_SWAP);
         pnl += HistoryDealGetDouble(deal, DEAL_COMMISSION);
         pnl += HistoryDealGetDouble(deal, DEAL_FEE);
      }
   }

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0 || !PositionSelectByTicket(ticket))
         continue;

      if(!PositionPassesMonitorFilter())
         continue;

      pnl += PositionGetDouble(POSITION_PROFIT);
      pnl += PositionGetDouble(POSITION_SWAP);
   }

   return pnl;
}

bool DealPassesMonitorFilter(const ulong deal)
{
   if(MonitorWholeAccountPnL)
      return true;

   if(HistoryDealGetString(deal, DEAL_SYMBOL) != tradeSymbol)
      return false;

   return (long)HistoryDealGetInteger(deal, DEAL_MAGIC) == MagicNumber;
}

bool PositionPassesMonitorFilter()
{
   if(MonitorWholeAccountPnL)
      return true;

   if(PositionGetString(POSITION_SYMBOL) != tradeSymbol)
      return false;

   return (long)PositionGetInteger(POSITION_MAGIC) == MagicNumber;
}

int CountTodayEaEntries()
{
   datetime start = DayStart(TimeTradeServerSafe());
   datetime now = TimeTradeServerSafe();
   int count = 0;

   if(!HistorySelect(start, now))
      return 0;

   int deals = HistoryDealsTotal();
   for(int i = 0; i < deals; i++)
   {
      ulong deal = HistoryDealGetTicket(i);
      if(deal == 0)
         continue;

      long type = HistoryDealGetInteger(deal, DEAL_TYPE);
      if(type != DEAL_TYPE_BUY && type != DEAL_TYPE_SELL)
         continue;

      if(HistoryDealGetString(deal, DEAL_SYMBOL) != tradeSymbol)
         continue;

      if((long)HistoryDealGetInteger(deal, DEAL_MAGIC) != MagicNumber)
         continue;

      long entry = HistoryDealGetInteger(deal, DEAL_ENTRY);
      if(entry == DEAL_ENTRY_IN)
         count++;
   }

   return count;
}

int CountConsecutiveEaLosses()
{
   datetime now = TimeTradeServerSafe();
   datetime lookback = now - 86400 * 45;
   int losses = 0;

   if(!HistorySelect(lookback, now))
      return 0;

   for(int i = HistoryDealsTotal() - 1; i >= 0; i--)
   {
      ulong deal = HistoryDealGetTicket(i);
      if(deal == 0)
         continue;

      long type = HistoryDealGetInteger(deal, DEAL_TYPE);
      if(type != DEAL_TYPE_BUY && type != DEAL_TYPE_SELL)
         continue;

      if(HistoryDealGetString(deal, DEAL_SYMBOL) != tradeSymbol)
         continue;

      if((long)HistoryDealGetInteger(deal, DEAL_MAGIC) != MagicNumber)
         continue;

      long entry = HistoryDealGetInteger(deal, DEAL_ENTRY);
      if(entry != DEAL_ENTRY_OUT && entry != DEAL_ENTRY_INOUT)
         continue;

      double result = HistoryDealGetDouble(deal, DEAL_PROFIT) +
                      HistoryDealGetDouble(deal, DEAL_SWAP) +
                      HistoryDealGetDouble(deal, DEAL_COMMISSION) +
                      HistoryDealGetDouble(deal, DEAL_FEE);

      if(result < 0.0)
         losses++;
      else if(result > 0.0)
         break;
   }

   return losses;
}

bool IsNewBar()
{
   datetime times[];
   ArrayResize(times, 1);
   ArraySetAsSeries(times, true);

   if(CopyTime(tradeSymbol, ExecutionTimeframe, 0, 1, times) != 1)
      return false;

   if(times[0] != lastBarTime)
   {
      lastBarTime = times[0];
      return true;
   }

   return false;
}

bool IsWithinTradeSession()
{
   MqlDateTime dt;
   TimeToStruct(TimeTradeServerSafe(), dt);
   int minuteOfDay = dt.hour * 60 + dt.min;

   bool london = TradeLondonSession && IsMinuteInWindow(minuteOfDay, LondonStartHourServer * 60, LondonEndHourServer * 60);
   bool ny = TradeNewYorkSession && IsMinuteInWindow(minuteOfDay, NewYorkStartHourServer * 60, NewYorkEndHourServer * 60);

   return london || ny;
}

bool IsMinuteInWindow(const int value, const int start, const int end)
{
   if(start == end)
      return true;

   if(start < end)
      return value >= start && value < end;

   return value >= start || value < end;
}

bool IsRolloverWindow()
{
   if(!AvoidServerRollover)
      return false;

   MqlDateTime dt;
   TimeToStruct(TimeTradeServerSafe(), dt);
   int minutes = dt.hour * 60 + dt.min;

   if(minutes >= 1440 - MinutesBeforeMidnightBlock)
      return true;

   if(minutes <= MinutesAfterMidnightBlock)
      return true;

   return false;
}

bool IsCloseBeforeMidnightWindow()
{
   MqlDateTime dt;
   TimeToStruct(TimeTradeServerSafe(), dt);
   int minutes = dt.hour * 60 + dt.min;
   return minutes >= 1440 - CloseMinutesBeforeMidnight;
}

double CurrentSpreadPoints()
{
   double ask = SymbolInfoDouble(tradeSymbol, SYMBOL_ASK);
   double bid = SymbolInfoDouble(tradeSymbol, SYMBOL_BID);
   double point = SymbolInfoDouble(tradeSymbol, SYMBOL_POINT);
   if(point <= 0.0)
      return 999999.0;
   return (ask - bid) / point;
}

datetime TimeTradeServerSafe()
{
   datetime now = TimeTradeServer();
   if(now <= 0)
      now = TimeCurrent();
   return now;
}

datetime DayStart(const datetime value)
{
   MqlDateTime dt;
   TimeToStruct(value, dt);
   dt.hour = 0;
   dt.min = 0;
   dt.sec = 0;
   return StructToTime(dt);
}

void UpdatePanel(const bool blocked, const string reason)
{
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double dailyPnl = GetDailyPnl();
   double internalStop = InitialBalance * InternalDailyStopPct / 100.0;
   double fundedDaily = InitialBalance * FundedNextDailyLossPct / 100.0;
   double maxFloor = InitialBalance * (1.0 - FundedNextMaxLossPct / 100.0);
   double targetEquity = InitialBalance * (1.0 + PhaseTargetPct / 100.0);

   string regimeName = RegimeName(DetectRegime());
   string status = blocked ? "BLOCKED: " + reason : "ACTIVE";

   Comment(
      "FundedNext Adaptive Gold Challenge EA\n",
      "Status: ", status, "\n",
      "Symbol/TF: ", tradeSymbol, " / ", EnumToString(ExecutionTimeframe),
      " | Regime: ", regimeName, "\n",
      "Daily PnL: ", DoubleToString(dailyPnl, 2),
      " | Internal stop: -", DoubleToString(internalStop, 2),
      " | Daily lock: ", DoubleToString(InitialBalance * DailyProfitLockPct / 100.0, 2),
      " | FN daily: -", DoubleToString(fundedDaily, 2), "\n",
      "Equity: ", DoubleToString(equity, 2),
      " | Max loss floor: ", DoubleToString(maxFloor, 2),
      " | Target equity: ", DoubleToString(targetEquity, 2), "\n",
      "Trades today: ", IntegerToString(CountTodayEaEntries()), "/", IntegerToString(MaxTradesPerDay),
      " | Open EA positions: ", IntegerToString(CountOpenEaPositions()), "/", IntegerToString(MaxOpenEaPositions),
      " | Losing streak: ", IntegerToString(CountConsecutiveEaLosses()), "/", IntegerToString(MaxConsecutiveLosses), "\n",
      "Spread points: ", DoubleToString(CurrentSpreadPoints(), 1)
   );

   if(blocked && reason != lastBlockReason)
   {
      Print("Trading blocked: ", reason);
      lastBlockReason = reason;
   }
   else if(!blocked)
   {
      lastBlockReason = "";
   }
}

string RegimeName(const ENUM_FNAC_REGIME regime)
{
   if(regime == REGIME_TREND_UP) return "TREND_UP";
   if(regime == REGIME_TREND_DOWN) return "TREND_DOWN";
   if(regime == REGIME_RANGE) return "RANGE";
   return "UNKNOWN";
}
