#property copyright "Codex"
#property version   "1.00"
#property strict

#include <Trade/Trade.mqh>

CTrade trade;

enum ENUM_FNCC_PROFILE
{
   FNCC_CONSERVATIVE = 0,
   FNCC_BALANCED = 1,
   FNCC_CHALLENGE = 2
};

input string          TradingSymbol              = "XAUUSD";
input ENUM_TIMEFRAMES SignalTimeframe            = PERIOD_M5;
input long            MagicNumber                = 26052501;
input ENUM_FNCC_PROFILE StrategyProfile          = FNCC_CHALLENGE;

input double          InitialBalance             = 5000.0;
input double          RiskPerTradePct            = 0.50;
input int             MaxTradesPerDay            = 3;
input int             MaxConsecutiveLosses       = 2;
input double          InternalDailyStopPct       = 2.00;
input double          FundedNextDailyLossPct     = 5.00;
input double          FundedNextMaxLossPct       = 10.00;
input double          MaxLossSafetyBufferPct     = 1.00;
input double          DailyLossSafetyBufferPct   = 0.75;
input double          PhaseTargetPct             = 8.00;   // Phase 1: 8.00, Phase 2: 5.00
input bool            StopAtProfitTarget         = true;
input bool            CloseEaPositionsAtTarget   = true;
input bool            MonitorWholeAccountPnL     = true;
input bool            CloseEaPositionsOnStop     = true;
input bool            ManualPause                = false;

input int             StartHourServer            = 6;
input int             EndHourServer              = 22;
input bool            AvoidServerRollover        = true;
input int             MinutesBeforeMidnightBlock = 20;
input int             MinutesAfterMidnightBlock  = 20;
input int             MaxSpreadPoints            = 350;
input int             SlippagePoints             = 30;

input int             FastEmaPeriod              = 20;
input int             SlowEmaPeriod              = 50;
input int             TrendEmaPeriod             = 200;
input int             RsiPeriod                  = 14;
input int             AdxPeriod                  = 14;
input int             AtrPeriod                  = 14;
input double          MinAdx                     = 14.0;
input double          AtrStopMultiplier          = 1.80;
input double          RewardRiskRatio            = 1.60;
input double          MinAtrPoints               = 80.0;
input double          MaxAtrPoints               = 2500.0;
input bool            UsePullbackSignals         = true;
input bool            UseBreakoutSignals         = true;
input int             BreakoutLookbackBars       = 18;
input double          BreakoutAtrBuffer          = 0.04;
input bool            RequireTrendEmaForBreakout = false;
input bool            RequireFastSlowForBreakout = true;
input bool            CloseBeforeServerMidnight  = false;
input int             CloseMinutesBeforeMidnight = 10;
input bool            UseBreakEven               = true;
input double          BreakEvenAtR               = 1.00;
input int             BreakEvenPlusPoints        = 20;
input bool            UseTrailingStop            = true;
input double          TrailAtR                   = 1.25;
input double          TrailAtrMultiplier         = 1.20;

string tradeSymbol;
int fastEmaHandle = INVALID_HANDLE;
int slowEmaHandle = INVALID_HANDLE;
int trendEmaHandle = INVALID_HANDLE;
int rsiHandle = INVALID_HANDLE;
int adxHandle = INVALID_HANDLE;
int atrHandle = INVALID_HANDLE;
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

   fastEmaHandle = iMA(tradeSymbol, SignalTimeframe, FastEmaPeriod, 0, MODE_EMA, PRICE_CLOSE);
   slowEmaHandle = iMA(tradeSymbol, SignalTimeframe, SlowEmaPeriod, 0, MODE_EMA, PRICE_CLOSE);
   trendEmaHandle = iMA(tradeSymbol, SignalTimeframe, TrendEmaPeriod, 0, MODE_EMA, PRICE_CLOSE);
   rsiHandle = iRSI(tradeSymbol, SignalTimeframe, RsiPeriod, PRICE_CLOSE);
   adxHandle = iADX(tradeSymbol, SignalTimeframe, AdxPeriod);
   atrHandle = iATR(tradeSymbol, SignalTimeframe, AtrPeriod);

   if(fastEmaHandle == INVALID_HANDLE || slowEmaHandle == INVALID_HANDLE ||
      trendEmaHandle == INVALID_HANDLE || rsiHandle == INVALID_HANDLE ||
      adxHandle == INVALID_HANDLE || atrHandle == INVALID_HANDLE)
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
   if(fastEmaHandle != INVALID_HANDLE) IndicatorRelease(fastEmaHandle);
   if(slowEmaHandle != INVALID_HANDLE) IndicatorRelease(slowEmaHandle);
   if(trendEmaHandle != INVALID_HANDLE) IndicatorRelease(trendEmaHandle);
   if(rsiHandle != INVALID_HANDLE) IndicatorRelease(rsiHandle);
   if(adxHandle != INVALID_HANDLE) IndicatorRelease(adxHandle);
   if(atrHandle != INVALID_HANDLE) IndicatorRelease(atrHandle);
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

   if(HasOpenEaPosition())
      return;

   if(CountTodayEaEntries() >= MaxTradesPerDay)
      return;

   int direction = GetSignal();
   if(direction == 0)
      return;

   PlaceTrade(direction);
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

   if(!IsWithinSession())
   {
      reason = "Outside allowed server-time trading session";
      return true;
   }

   if(IsRolloverWindow())
   {
      reason = "Server rollover protection window";
      return true;
   }

   double spreadPoints = CurrentSpreadPoints();
   if(spreadPoints > MaxSpreadPoints)
   {
      reason = "Spread is too high";
      return true;
   }

   int losingStreak = CountConsecutiveEaLosses();
   if(losingStreak >= MaxConsecutiveLosses)
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

int GetSignal()
{
   MqlRates rates[];
   double fast[], slow[], trend[], rsi[], adx[], atr[];
   int barsNeeded = MathMax(BreakoutLookbackBars + 4, 30);
   ArrayResize(rates, barsNeeded);
   ArrayResize(fast, 4);
   ArrayResize(slow, 4);
   ArrayResize(trend, 4);
   ArrayResize(rsi, 4);
   ArrayResize(adx, 4);
   ArrayResize(atr, 4);
   ArraySetAsSeries(rates, true);
   ArraySetAsSeries(fast, true);
   ArraySetAsSeries(slow, true);
   ArraySetAsSeries(trend, true);
   ArraySetAsSeries(rsi, true);
   ArraySetAsSeries(adx, true);
   ArraySetAsSeries(atr, true);

   if(CopyRates(tradeSymbol, SignalTimeframe, 0, barsNeeded, rates) < barsNeeded) return 0;
   if(CopyBuffer(fastEmaHandle, 0, 0, 4, fast) < 4) return 0;
   if(CopyBuffer(slowEmaHandle, 0, 0, 4, slow) < 4) return 0;
   if(CopyBuffer(trendEmaHandle, 0, 0, 4, trend) < 4) return 0;
   if(CopyBuffer(rsiHandle, 0, 0, 4, rsi) < 4) return 0;
   if(CopyBuffer(adxHandle, 0, 0, 4, adx) < 4) return 0;
   if(CopyBuffer(atrHandle, 0, 0, 4, atr) < 4) return 0;

   double point = SymbolInfoDouble(tradeSymbol, SYMBOL_POINT);
   if(point <= 0.0) return 0;

   double atrPoints = atr[1] / point;
   if(atrPoints < MinAtrPoints || atrPoints > MaxAtrPoints)
      return 0;

   double minAdx = EffectiveMinAdx();
   bool adxOk = adx[1] >= minAdx;
   bool buyTrend = rates[1].close > trend[1] && fast[1] > slow[1];
   bool sellTrend = rates[1].close < trend[1] && fast[1] < slow[1];
   bool buyFastSlow = fast[1] >= slow[1] && rates[1].close > slow[1];
   bool sellFastSlow = fast[1] <= slow[1] && rates[1].close < slow[1];

   bool buyPullback = rates[1].low <= fast[1] &&
                      rates[1].close > fast[1] &&
                      rates[1].close > rates[1].open &&
                      rsi[1] > 50.0;

   bool sellPullback = rates[1].high >= fast[1] &&
                       rates[1].close < fast[1] &&
                       rates[1].close < rates[1].open &&
                       rsi[1] < 50.0;

   bool buyMomentum = rsi[2] < 50.0 && rsi[1] > 50.0 && rates[1].close > fast[1];
   bool sellMomentum = rsi[2] > 50.0 && rsi[1] < 50.0 && rates[1].close < fast[1];

   bool buyBreakout = false;
   bool sellBreakout = false;

   if(UseBreakoutSignals)
   {
      double priorHigh = rates[2].high;
      double priorLow = rates[2].low;
      for(int i = 3; i < BreakoutLookbackBars + 2 && i < barsNeeded; i++)
      {
         priorHigh = MathMax(priorHigh, rates[i].high);
         priorLow = MathMin(priorLow, rates[i].low);
      }

      double breakoutBuffer = atr[1] * BreakoutAtrBuffer;
      bool buyBreakoutFilter = BreakoutDirectionAllowed(1, buyTrend, buyFastSlow);
      bool sellBreakoutFilter = BreakoutDirectionAllowed(-1, sellTrend, sellFastSlow);

      buyBreakout = buyBreakoutFilter &&
                    rates[1].close > priorHigh + breakoutBuffer &&
                    rates[1].close > rates[1].open &&
                    rsi[1] > EffectiveBuyRsiThreshold();

      sellBreakout = sellBreakoutFilter &&
                     rates[1].close < priorLow - breakoutBuffer &&
                     rates[1].close < rates[1].open &&
                     rsi[1] < EffectiveSellRsiThreshold();
   }

   if(adxOk && buyTrend && ((UsePullbackSignals && (buyPullback || buyMomentum)) || buyBreakout))
      return 1;

   if(adxOk && sellTrend && ((UsePullbackSignals && (sellPullback || sellMomentum)) || sellBreakout))
      return -1;

   if(StrategyProfile == FNCC_CHALLENGE && adxOk && buyBreakout)
      return 1;

   if(StrategyProfile == FNCC_CHALLENGE && adxOk && sellBreakout)
      return -1;

   return 0;
}

bool BreakoutDirectionAllowed(const int direction, const bool trendOk, const bool fastSlowOk)
{
   if(RequireTrendEmaForBreakout)
      return trendOk;

   if(RequireFastSlowForBreakout)
      return fastSlowOk;

   return true;
}

double EffectiveMinAdx()
{
   if(StrategyProfile == FNCC_CONSERVATIVE)
      return MathMax(MinAdx, 18.0);

   if(StrategyProfile == FNCC_CHALLENGE)
      return MathMax(10.0, MinAdx - 2.0);

   return MinAdx;
}

double EffectiveBuyRsiThreshold()
{
   if(StrategyProfile == FNCC_CONSERVATIVE)
      return 55.0;

   if(StrategyProfile == FNCC_CHALLENGE)
      return 50.0;

   return 52.0;
}

double EffectiveSellRsiThreshold()
{
   if(StrategyProfile == FNCC_CONSERVATIVE)
      return 45.0;

   if(StrategyProfile == FNCC_CHALLENGE)
      return 50.0;

   return 48.0;
}

void PlaceTrade(const int direction)
{
   double atrValue = CurrentAtrValue();
   if(atrValue <= 0.0)
      return;

   double ask = SymbolInfoDouble(tradeSymbol, SYMBOL_ASK);
   double bid = SymbolInfoDouble(tradeSymbol, SYMBOL_BID);
   double point = SymbolInfoDouble(tradeSymbol, SYMBOL_POINT);
   int digits = (int)SymbolInfoInteger(tradeSymbol, SYMBOL_DIGITS);
   int stopsLevel = (int)SymbolInfoInteger(tradeSymbol, SYMBOL_TRADE_STOPS_LEVEL);
   double minStopDistance = MathMax(stopsLevel * point, point);

   ENUM_ORDER_TYPE orderType = direction > 0 ? ORDER_TYPE_BUY : ORDER_TYPE_SELL;
   double entry = direction > 0 ? ask : bid;
   double stopDistance = atrValue * EffectiveStopMultiplier();

   if(stopDistance < minStopDistance)
      stopDistance = minStopDistance;

   double sl = direction > 0 ? entry - stopDistance : entry + stopDistance;
   double tp = direction > 0 ? entry + stopDistance * EffectiveRewardRiskRatio()
                             : entry - stopDistance * EffectiveRewardRiskRatio();

   sl = NormalizeDouble(sl, digits);
   tp = NormalizeDouble(tp, digits);

   double lots = CalculateLots(orderType, entry, sl);
   if(lots <= 0.0)
   {
      Print("Lot calculation returned zero. Trade skipped.");
      return;
   }

   bool ok = false;
   if(direction > 0)
      ok = trade.Buy(lots, tradeSymbol, 0.0, sl, tp, "FNCC");
   else
      ok = trade.Sell(lots, tradeSymbol, 0.0, sl, tp, "FNCC");

   if(!ok)
      Print("Order failed. Retcode=", trade.ResultRetcode(), " ", trade.ResultRetcodeDescription());
}

double EffectiveStopMultiplier()
{
   if(StrategyProfile == FNCC_CONSERVATIVE)
      return MathMax(AtrStopMultiplier, 2.0);

   if(StrategyProfile == FNCC_CHALLENGE)
      return MathMax(1.2, AtrStopMultiplier - 0.25);

   return AtrStopMultiplier;
}

double EffectiveRewardRiskRatio()
{
   if(StrategyProfile == FNCC_CONSERVATIVE)
      return MathMax(RewardRiskRatio, 1.8);

   if(StrategyProfile == FNCC_CHALLENGE)
      return MathMax(1.35, RewardRiskRatio);

   return RewardRiskRatio;
}

double CalculateLots(const ENUM_ORDER_TYPE orderType, const double entry, const double sl)
{
   double riskMoney = AccountInfoDouble(ACCOUNT_BALANCE) * RiskPerTradePct / 100.0;
   double dailyRemaining = MathMax(0.0, InitialBalance * InternalDailyStopPct / 100.0 + GetDailyPnl());
   riskMoney = MathMin(riskMoney, dailyRemaining * 0.50);

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

   double atrValue = CurrentAtrValue();
   if(atrValue <= 0.0)
      return;

   double point = SymbolInfoDouble(tradeSymbol, SYMBOL_POINT);
   int digits = (int)SymbolInfoInteger(tradeSymbol, SYMBOL_DIGITS);
   double bid = SymbolInfoDouble(tradeSymbol, SYMBOL_BID);
   double ask = SymbolInfoDouble(tradeSymbol, SYMBOL_ASK);
   double baseRiskDistance = atrValue * EffectiveStopMultiplier();

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
         double trail = type == POSITION_TYPE_BUY ? current - atrValue * TrailAtrMultiplier
                                                  : current + atrValue * TrailAtrMultiplier;
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
   if(CopyBuffer(atrHandle, 0, 0, 2, atr) < 2)
      return 0.0;
   return atr[1];
}

bool HasOpenEaPosition()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0 || !PositionSelectByTicket(ticket))
         continue;

      if(PositionGetString(POSITION_SYMBOL) == tradeSymbol &&
         (long)PositionGetInteger(POSITION_MAGIC) == MagicNumber)
         return true;
   }
   return false;
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
   datetime lookback = now - 86400 * 30;
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

   if(CopyTime(tradeSymbol, SignalTimeframe, 0, 1, times) != 1)
      return false;

   if(times[0] != lastBarTime)
   {
      lastBarTime = times[0];
      return true;
   }

   return false;
}

bool IsWithinSession()
{
   MqlDateTime dt;
   TimeToStruct(TimeTradeServerSafe(), dt);

   if(StartHourServer == EndHourServer)
      return true;

   if(StartHourServer < EndHourServer)
      return dt.hour >= StartHourServer && dt.hour < EndHourServer;

   return dt.hour >= StartHourServer || dt.hour < EndHourServer;
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

   string status = blocked ? "BLOCKED: " + reason : "ACTIVE";
   Comment(
      "FundedNext Stellar 2-Step EA\n",
      "Status: ", status, "\n",
      "Symbol/TF: ", tradeSymbol, " / ", EnumToString(SignalTimeframe), "\n",
      "Daily PnL: ", DoubleToString(dailyPnl, 2),
      " | Internal stop: -", DoubleToString(internalStop, 2),
      " | FN daily: -", DoubleToString(fundedDaily, 2), "\n",
      "Equity: ", DoubleToString(equity, 2),
      " | Max loss floor: ", DoubleToString(maxFloor, 2),
      " | Target equity: ", DoubleToString(targetEquity, 2), "\n",
      "Trades today: ", IntegerToString(CountTodayEaEntries()), "/", IntegerToString(MaxTradesPerDay),
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
