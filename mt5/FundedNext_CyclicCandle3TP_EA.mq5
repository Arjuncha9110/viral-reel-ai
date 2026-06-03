#property copyright "Codex"
#property version   "1.00"
#property strict

#include <Trade/Trade.mqh>

CTrade trade;

enum ENUM_CYCLE_DIRECTION_MODE
{
   CYCLE_BOTH_DIRECTIONS = 0,
   CYCLE_BUY_ONLY = 1,
   CYCLE_SELL_ONLY = 2
};

input string          TradingSymbol              = "XAUUSD";
input ENUM_TIMEFRAMES ExecutionTimeframe         = PERIOD_M5;
input ENUM_TIMEFRAMES TrendTimeframe             = PERIOD_H1;
input long            MagicNumber                = 26052503;

input double          InitialBalance             = 5000.0;
input double          TotalRiskPct               = 0.50;   // Total risk across all 3 portions
input int             MaxTradesPerDay            = 3;      // Counts grouped entries, not portions
input int             MaxConsecutiveGroupLosses  = 2;
input double          InternalDailyStopPct       = 2.00;
input double          FundedNextDailyLossPct     = 5.00;
input double          FundedNextMaxLossPct       = 10.00;
input double          DailyLossSafetyBufferPct   = 0.75;
input double          MaxLossSafetyBufferPct     = 1.00;
input double          PhaseTargetPct             = 8.00;
input bool            StopAtProfitTarget         = true;
input bool            MonitorWholeAccountPnL     = true;
input bool            CloseEaPositionsOnStop     = true;
input bool            ManualPause                = false;

input ENUM_CYCLE_DIRECTION_MODE DirectionMode    = CYCLE_BOTH_DIRECTIONS;
input int             CycleMinutes               = 15;
input int             CycleOffsetMinutes         = 0;
input bool            RequireTrendAlignment      = true;
input bool            RequireM5EmaAlignment      = true;
input int             SignalLookbackBars         = 2;
input double          MinBodyToRangeRatio        = 0.45;
input double          MinSignalAtrRatio          = 0.45;
input double          MaxSignalAtrRatio          = 2.20;
input double          MinAdx                     = 13.0;
input double          BuyMinRsi                  = 51.0;
input double          SellMaxRsi                 = 49.0;

input int             FastEmaPeriod              = 20;
input int             SlowEmaPeriod              = 50;
input int             TrendFastEmaPeriod         = 50;
input int             TrendSlowEmaPeriod         = 200;
input int             RsiPeriod                  = 14;
input int             AdxPeriod                  = 14;
input int             AtrPeriod                  = 14;
input double          StopAtrMultiplier          = 1.20;
input double          SwingBufferAtr             = 0.15;
input double          TP1_R                      = 1.00;
input double          TP2_R                      = 2.00;
input double          TP3_R                      = 3.00;

input bool            TradeLondonSession         = true;
input int             LondonStartHourServer      = 7;
input int             LondonEndHourServer        = 12;
input bool            TradeNewYorkSession        = true;
input int             NewYorkStartHourServer     = 13;
input int             NewYorkEndHourServer       = 18;
input int             MaxSpreadPoints            = 350;
input bool            AvoidServerRollover        = true;
input int             MinutesBeforeMidnightBlock = 20;
input int             MinutesAfterMidnightBlock  = 20;
input int             SlippagePoints             = 30;

string tradeSymbol;
int fastEmaHandle = INVALID_HANDLE;
int slowEmaHandle = INVALID_HANDLE;
int trendFastHandle = INVALID_HANDLE;
int trendSlowHandle = INVALID_HANDLE;
int rsiHandle = INVALID_HANDLE;
int adxHandle = INVALID_HANDLE;
int atrHandle = INVALID_HANDLE;
datetime lastBarTime = 0;
string lastBlockReason = "";
datetime lastEntryBarTime = 0;

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

   fastEmaHandle = iMA(tradeSymbol, ExecutionTimeframe, FastEmaPeriod, 0, MODE_EMA, PRICE_CLOSE);
   slowEmaHandle = iMA(tradeSymbol, ExecutionTimeframe, SlowEmaPeriod, 0, MODE_EMA, PRICE_CLOSE);
   trendFastHandle = iMA(tradeSymbol, TrendTimeframe, TrendFastEmaPeriod, 0, MODE_EMA, PRICE_CLOSE);
   trendSlowHandle = iMA(tradeSymbol, TrendTimeframe, TrendSlowEmaPeriod, 0, MODE_EMA, PRICE_CLOSE);
   rsiHandle = iRSI(tradeSymbol, ExecutionTimeframe, RsiPeriod, PRICE_CLOSE);
   adxHandle = iADX(tradeSymbol, ExecutionTimeframe, AdxPeriod);
   atrHandle = iATR(tradeSymbol, ExecutionTimeframe, AtrPeriod);

   if(fastEmaHandle == INVALID_HANDLE || slowEmaHandle == INVALID_HANDLE ||
      trendFastHandle == INVALID_HANDLE || trendSlowHandle == INVALID_HANDLE ||
      rsiHandle == INVALID_HANDLE || adxHandle == INVALID_HANDLE || atrHandle == INVALID_HANDLE)
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
   if(trendFastHandle != INVALID_HANDLE) IndicatorRelease(trendFastHandle);
   if(trendSlowHandle != INVALID_HANDLE) IndicatorRelease(trendSlowHandle);
   if(rsiHandle != INVALID_HANDLE) IndicatorRelease(rsiHandle);
   if(adxHandle != INVALID_HANDLE) IndicatorRelease(adxHandle);
   if(atrHandle != INVALID_HANDLE) IndicatorRelease(atrHandle);
   Comment("");
}

void OnTick()
{
   ManageThreeTargetStops();

   string reason = "";
   bool blocked = SafetyBlocksTrading(reason);
   UpdatePanel(blocked, reason);

   if(blocked)
   {
      if(CloseEaPositionsOnStop && IsRiskStopReason(reason))
         CloseEaPositions();
      return;
   }

   if(!IsNewBar())
      return;

   if(CountOpenEaPositions() > 0)
      return;

   if(CountTodayGroupedEntries() >= MaxTradesPerDay)
      return;

   if(!IsCycleSignalBar())
      return;

   int direction = BuildCycleSignal();
   if(direction == 0)
      return;

   OpenThreePortions(direction);
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
      reason = "Trading is not allowed";
      return true;
   }

   if(!IsWithinTradeSession())
   {
      reason = "Outside session";
      return true;
   }

   if(IsRolloverWindow())
   {
      reason = "Rollover window";
      return true;
   }

   if(CurrentSpreadPoints() > MaxSpreadPoints)
   {
      reason = "Spread too high";
      return true;
   }

   if(CountConsecutiveGroupLosses() >= MaxConsecutiveGroupLosses)
   {
      reason = "Max consecutive group losses reached";
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

bool IsRiskStopReason(const string reason)
{
   return StringFind(reason, "daily") >= 0 ||
          StringFind(reason, "maximum") >= 0 ||
          StringFind(reason, "target") >= 0;
}

bool IsCycleSignalBar()
{
   datetime times[];
   ArrayResize(times, 1);
   ArraySetAsSeries(times, true);

   if(CopyTime(tradeSymbol, ExecutionTimeframe, 0, 1, times) != 1)
      return false;

   MqlDateTime dt;
   TimeToStruct(times[0], dt);
   int minuteOfDay = dt.hour * 60 + dt.min;
   int cycle = MathMax(1, CycleMinutes);
   int offset = CycleOffsetMinutes % cycle;
   if(offset < 0)
      offset += cycle;

   return (minuteOfDay % cycle) == offset;
}

int BuildCycleSignal()
{
   MqlRates rates[];
   double fast[], slow[], trendFast[], trendSlow[], rsi[], adx[], atr[];
   int bars = MathMax(SignalLookbackBars + 5, 12);

   ArrayResize(rates, bars);
   ArrayResize(fast, 4);
   ArrayResize(slow, 4);
   ArrayResize(trendFast, 3);
   ArrayResize(trendSlow, 3);
   ArrayResize(rsi, 4);
   ArrayResize(adx, 4);
   ArrayResize(atr, 4);

   ArraySetAsSeries(rates, true);
   ArraySetAsSeries(fast, true);
   ArraySetAsSeries(slow, true);
   ArraySetAsSeries(trendFast, true);
   ArraySetAsSeries(trendSlow, true);
   ArraySetAsSeries(rsi, true);
   ArraySetAsSeries(adx, true);
   ArraySetAsSeries(atr, true);

   if(CopyRates(tradeSymbol, ExecutionTimeframe, 0, bars, rates) < bars) return 0;
   if(CopyBuffer(fastEmaHandle, 0, 0, 4, fast) < 4) return 0;
   if(CopyBuffer(slowEmaHandle, 0, 0, 4, slow) < 4) return 0;
   if(CopyBuffer(trendFastHandle, 0, 0, 3, trendFast) < 3) return 0;
   if(CopyBuffer(trendSlowHandle, 0, 0, 3, trendSlow) < 3) return 0;
   if(CopyBuffer(rsiHandle, 0, 0, 4, rsi) < 4) return 0;
   if(CopyBuffer(adxHandle, 0, 0, 4, adx) < 4) return 0;
   if(CopyBuffer(atrHandle, 0, 0, 4, atr) < 4) return 0;

   double range = rates[1].high - rates[1].low;
   double body = MathAbs(rates[1].close - rates[1].open);
   if(range <= 0.0 || atr[1] <= 0.0)
      return 0;

   if(body / range < MinBodyToRangeRatio)
      return 0;

   if(range < atr[1] * MinSignalAtrRatio || range > atr[1] * MaxSignalAtrRatio)
      return 0;

   if(adx[1] < MinAdx)
      return 0;

   int direction = 0;
   if(rates[1].close > rates[1].open)
      direction = 1;
   else if(rates[1].close < rates[1].open)
      direction = -1;

   if(direction == 0)
      return 0;

   if(DirectionMode == CYCLE_BUY_ONLY && direction < 0)
      return 0;

   if(DirectionMode == CYCLE_SELL_ONLY && direction > 0)
      return 0;

   if(direction > 0 && rsi[1] < BuyMinRsi)
      return 0;

   if(direction < 0 && rsi[1] > SellMaxRsi)
      return 0;

   if(RequireTrendAlignment)
   {
      if(direction > 0 && !(trendFast[1] > trendSlow[1]))
         return 0;

      if(direction < 0 && !(trendFast[1] < trendSlow[1]))
         return 0;
   }

   if(RequireM5EmaAlignment)
   {
      if(direction > 0 && !(fast[1] >= slow[1] && rates[1].close > slow[1]))
         return 0;

      if(direction < 0 && !(fast[1] <= slow[1] && rates[1].close < slow[1]))
         return 0;
   }

   if(!BreaksRecentStructure(direction, rates, SignalLookbackBars))
      return 0;

   return direction;
}

bool BreaksRecentStructure(const int direction, const MqlRates &rates[], const int lookback)
{
   int bars = MathMax(1, lookback);
   double priorHigh = rates[2].high;
   double priorLow = rates[2].low;

   for(int i = 3; i < bars + 2; i++)
   {
      priorHigh = MathMax(priorHigh, rates[i].high);
      priorLow = MathMin(priorLow, rates[i].low);
   }

   if(direction > 0)
      return rates[1].close > priorHigh;

   return rates[1].close < priorLow;
}

void OpenThreePortions(const int direction)
{
   datetime times[];
   ArrayResize(times, 1);
   ArraySetAsSeries(times, true);
   if(CopyTime(tradeSymbol, ExecutionTimeframe, 0, 1, times) != 1)
      return;

   if(lastEntryBarTime == times[0])
      return;

   double atr = CurrentAtrValue();
   if(atr <= 0.0)
      return;

   MqlRates rates[];
   ArrayResize(rates, 8);
   ArraySetAsSeries(rates, true);
   if(CopyRates(tradeSymbol, ExecutionTimeframe, 0, 8, rates) < 8)
      return;

   double ask = SymbolInfoDouble(tradeSymbol, SYMBOL_ASK);
   double bid = SymbolInfoDouble(tradeSymbol, SYMBOL_BID);
   double point = SymbolInfoDouble(tradeSymbol, SYMBOL_POINT);
   int digits = (int)SymbolInfoInteger(tradeSymbol, SYMBOL_DIGITS);
   int stopsLevel = (int)SymbolInfoInteger(tradeSymbol, SYMBOL_TRADE_STOPS_LEVEL);
   double minStopDistance = MathMax(stopsLevel * point, point);

   double entry = direction > 0 ? ask : bid;
   double stopDistance = MathMax(atr * StopAtrMultiplier, SwingStopDistance(direction, rates, 6, atr * SwingBufferAtr));
   stopDistance = MathMax(stopDistance, minStopDistance);

   double sl = direction > 0 ? entry - stopDistance : entry + stopDistance;
   double tp1 = direction > 0 ? entry + stopDistance * TP1_R : entry - stopDistance * TP1_R;
   double tp2 = direction > 0 ? entry + stopDistance * TP2_R : entry - stopDistance * TP2_R;
   double tp3 = direction > 0 ? entry + stopDistance * TP3_R : entry - stopDistance * TP3_R;

   sl = NormalizeDouble(sl, digits);
   tp1 = NormalizeDouble(tp1, digits);
   tp2 = NormalizeDouble(tp2, digits);
   tp3 = NormalizeDouble(tp3, digits);

   ENUM_ORDER_TYPE orderType = direction > 0 ? ORDER_TYPE_BUY : ORDER_TYPE_SELL;
   double totalLots = CalculateTotalLots(orderType, entry, sl);
   if(totalLots <= 0.0)
   {
      Print("Lot calculation returned zero. Three-portion trade skipped.");
      return;
   }

   double partLots = NormalizeVolume(totalLots / 3.0);
   if(partLots <= 0.0)
   {
      Print("Portion lot is below broker minimum. Three-portion trade skipped.");
      return;
   }

   string group = IntegerToString((int)times[0]);
   bool ok1 = false;
   bool ok2 = false;
   bool ok3 = false;

   if(direction > 0)
   {
      ok1 = trade.Buy(partLots, tradeSymbol, 0.0, sl, tp1, "CYC3 " + group + " TP1");
      ok2 = trade.Buy(partLots, tradeSymbol, 0.0, sl, tp2, "CYC3 " + group + " TP2");
      ok3 = trade.Buy(partLots, tradeSymbol, 0.0, sl, tp3, "CYC3 " + group + " TP3");
   }
   else
   {
      ok1 = trade.Sell(partLots, tradeSymbol, 0.0, sl, tp1, "CYC3 " + group + " TP1");
      ok2 = trade.Sell(partLots, tradeSymbol, 0.0, sl, tp2, "CYC3 " + group + " TP2");
      ok3 = trade.Sell(partLots, tradeSymbol, 0.0, sl, tp3, "CYC3 " + group + " TP3");
   }

   if(ok1 || ok2 || ok3)
      lastEntryBarTime = times[0];

   if(!ok1 || !ok2 || !ok3)
      Print("One or more portions failed. Retcode=", trade.ResultRetcode(), " ", trade.ResultRetcodeDescription());
}

double CalculateTotalLots(const ENUM_ORDER_TYPE orderType, const double entry, const double sl)
{
   double riskMoney = AccountInfoDouble(ACCOUNT_BALANCE) * TotalRiskPct / 100.0;
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
   if(rawLots / 3.0 < minLot)
      return 0.0;

   return NormalizeVolume(rawLots);
}

double NormalizeVolume(double lots)
{
   double minLot = SymbolInfoDouble(tradeSymbol, SYMBOL_VOLUME_MIN);
   double maxLot = SymbolInfoDouble(tradeSymbol, SYMBOL_VOLUME_MAX);
   double step = SymbolInfoDouble(tradeSymbol, SYMBOL_VOLUME_STEP);

   if(step <= 0.0 || lots < minLot)
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

void ManageThreeTargetStops()
{
   int tp1Open = 0;
   int tp2Open = 0;
   int tp3Open = 0;

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0 || !PositionSelectByTicket(ticket))
         continue;

      if(!IsEaPosition())
         continue;

      string comment = PositionGetString(POSITION_COMMENT);
      if(StringFind(comment, "TP1") >= 0) tp1Open++;
      if(StringFind(comment, "TP2") >= 0) tp2Open++;
      if(StringFind(comment, "TP3") >= 0) tp3Open++;
   }

   if(tp1Open == 0 && (tp2Open > 0 || tp3Open > 0))
      MoveRemainingStopsToR(TP1_R);

   if(tp1Open == 0 && tp2Open == 0 && tp3Open > 0)
      MoveRemainingStopsToR(TP2_R);
}

void MoveRemainingStopsToR(const double targetR)
{
   double bid = SymbolInfoDouble(tradeSymbol, SYMBOL_BID);
   double ask = SymbolInfoDouble(tradeSymbol, SYMBOL_ASK);
   double point = SymbolInfoDouble(tradeSymbol, SYMBOL_POINT);
   int digits = (int)SymbolInfoInteger(tradeSymbol, SYMBOL_DIGITS);
   int stopsLevel = (int)SymbolInfoInteger(tradeSymbol, SYMBOL_TRADE_STOPS_LEVEL);
   double minDistance = MathMax(stopsLevel * point, point);

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0 || !PositionSelectByTicket(ticket))
         continue;

      if(!IsEaPosition())
         continue;

      string comment = PositionGetString(POSITION_COMMENT);
      if(StringFind(comment, "TP1") >= 0)
         continue;

      long type = PositionGetInteger(POSITION_TYPE);
      double entry = PositionGetDouble(POSITION_PRICE_OPEN);
      double currentSl = PositionGetDouble(POSITION_SL);
      double tp = PositionGetDouble(POSITION_TP);
      double tpR = CommentTargetR(comment);
      if(tpR <= 0.0 || tp <= 0.0)
         continue;

      double riskDistance = MathAbs(tp - entry) / tpR;
      double newSl = type == POSITION_TYPE_BUY ? entry + riskDistance * targetR
                                               : entry - riskDistance * targetR;
      newSl = NormalizeDouble(newSl, digits);

      bool improves = false;
      bool valid = false;

      if(type == POSITION_TYPE_BUY)
      {
         improves = currentSl == 0.0 || newSl > currentSl + point;
         valid = newSl < bid - minDistance;
      }
      else
      {
         improves = currentSl == 0.0 || newSl < currentSl - point;
         valid = newSl > ask + minDistance;
      }

      if(improves && valid)
      {
         if(!trade.PositionModify(ticket, newSl, tp))
            Print("Failed to move SL to previous target. Retcode=", trade.ResultRetcode(), " ", trade.ResultRetcodeDescription());
      }
   }
}

double CommentTargetR(const string comment)
{
   if(StringFind(comment, "TP1") >= 0) return TP1_R;
   if(StringFind(comment, "TP2") >= 0) return TP2_R;
   if(StringFind(comment, "TP3") >= 0) return TP3_R;
   return 0.0;
}

bool IsEaPosition()
{
   return PositionGetString(POSITION_SYMBOL) == tradeSymbol &&
          (long)PositionGetInteger(POSITION_MAGIC) == MagicNumber;
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

double CurrentAtrValue()
{
   double atr[];
   ArrayResize(atr, 2);
   ArraySetAsSeries(atr, true);
   if(CopyBuffer(atrHandle, 0, 0, 2, atr) < 2)
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

      if(IsEaPosition())
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

      if(!IsEaPosition())
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

   return IsEaPosition();
}

int CountTodayGroupedEntries()
{
   datetime start = DayStart(TimeTradeServerSafe());
   datetime now = TimeTradeServerSafe();
   string groups[];
   int groupCount = 0;

   if(!HistorySelect(start, now))
      return 0;

   int deals = HistoryDealsTotal();
   for(int i = 0; i < deals; i++)
   {
      ulong deal = HistoryDealGetTicket(i);
      if(deal == 0)
         continue;

      if(HistoryDealGetString(deal, DEAL_SYMBOL) != tradeSymbol)
         continue;

      if((long)HistoryDealGetInteger(deal, DEAL_MAGIC) != MagicNumber)
         continue;

      long entry = HistoryDealGetInteger(deal, DEAL_ENTRY);
      if(entry != DEAL_ENTRY_IN)
         continue;

      string group = DealGroupKey(HistoryDealGetString(deal, DEAL_COMMENT));
      if(group == "")
         continue;

      if(!GroupExists(groups, groupCount, group))
      {
         ArrayResize(groups, groupCount + 1);
         groups[groupCount] = group;
         groupCount++;
      }
   }

   return groupCount;
}

bool GroupExists(const string &groups[], const int count, const string group)
{
   for(int i = 0; i < count; i++)
   {
      if(groups[i] == group)
         return true;
   }
   return false;
}

string DealGroupKey(const string comment)
{
   int start = StringFind(comment, "CYC3 ");
   if(start < 0)
      return "";

   int tp = StringFind(comment, " TP", start);
   if(tp < 0)
      return comment;

   return StringSubstr(comment, start, tp - start);
}

int CountConsecutiveGroupLosses()
{
   datetime now = TimeTradeServerSafe();
   datetime lookback = now - 86400 * 45;

   if(!HistorySelect(lookback, now))
      return 0;

   string groups[];
   double groupPnls[];
   datetime groupTimes[];
   int groupCount = 0;

   for(int i = 0; i < HistoryDealsTotal(); i++)
   {
      ulong deal = HistoryDealGetTicket(i);
      if(deal == 0)
         continue;

      if(HistoryDealGetString(deal, DEAL_SYMBOL) != tradeSymbol)
         continue;

      if((long)HistoryDealGetInteger(deal, DEAL_MAGIC) != MagicNumber)
         continue;

      long type = HistoryDealGetInteger(deal, DEAL_TYPE);
      if(type != DEAL_TYPE_BUY && type != DEAL_TYPE_SELL)
         continue;

      string group = DealGroupKey(HistoryDealGetString(deal, DEAL_COMMENT));
      if(group == "")
         continue;

      int index = GroupIndex(groups, groupCount, group);
      if(index < 0)
      {
         index = groupCount;
         ArrayResize(groups, groupCount + 1);
         ArrayResize(groupPnls, groupCount + 1);
         ArrayResize(groupTimes, groupCount + 1);
         groups[index] = group;
         groupPnls[index] = 0.0;
         groupTimes[index] = (datetime)HistoryDealGetInteger(deal, DEAL_TIME);
         groupCount++;
      }

      long entry = HistoryDealGetInteger(deal, DEAL_ENTRY);
      if(entry == DEAL_ENTRY_OUT || entry == DEAL_ENTRY_INOUT)
      {
         groupPnls[index] += HistoryDealGetDouble(deal, DEAL_PROFIT);
         groupPnls[index] += HistoryDealGetDouble(deal, DEAL_SWAP);
         groupPnls[index] += HistoryDealGetDouble(deal, DEAL_COMMISSION);
         groupPnls[index] += HistoryDealGetDouble(deal, DEAL_FEE);
      }
   }

   int losses = 0;
   for(int pass = 0; pass < groupCount; pass++)
   {
      int latest = -1;
      datetime latestTime = 0;
      for(int i = 0; i < groupCount; i++)
      {
         if(groupTimes[i] > latestTime)
         {
            latestTime = groupTimes[i];
            latest = i;
         }
      }

      if(latest < 0)
         break;

      if(groupPnls[latest] < 0.0)
         losses++;
      else if(groupPnls[latest] > 0.0)
         break;

      groupTimes[latest] = 0;
   }

   return losses;
}

int GroupIndex(const string &groups[], const int count, const string group)
{
   for(int i = 0; i < count; i++)
   {
      if(groups[i] == group)
         return i;
   }
   return -1;
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
   double maxFloor = InitialBalance * (1.0 - FundedNextMaxLossPct / 100.0);
   double targetEquity = InitialBalance * (1.0 + PhaseTargetPct / 100.0);
   string status = blocked ? "BLOCKED: " + reason : "ACTIVE";

   Comment(
      "FundedNext Cyclic Candle 3TP EA\n",
      "Status: ", status, "\n",
      "Cycle: ", IntegerToString(CycleMinutes), " min",
      " | Open portions: ", IntegerToString(CountOpenEaPositions()),
      " | Groups today: ", IntegerToString(CountTodayGroupedEntries()), "/", IntegerToString(MaxTradesPerDay), "\n",
      "Daily PnL: ", DoubleToString(dailyPnl, 2),
      " | Equity: ", DoubleToString(equity, 2),
      " | Max floor: ", DoubleToString(maxFloor, 2),
      " | Target: ", DoubleToString(targetEquity, 2), "\n",
      "Spread points: ", DoubleToString(CurrentSpreadPoints(), 1),
      " | Consecutive group losses: ", IntegerToString(CountConsecutiveGroupLosses()), "/", IntegerToString(MaxConsecutiveGroupLosses)
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
