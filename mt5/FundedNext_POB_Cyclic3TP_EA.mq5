#property copyright "Codex"
#property version   "1.00"
#property strict

#include <Trade/Trade.mqh>

CTrade trade;

enum ENUM_POB_SOURCE
{
   POB_PREVIOUS_DAY = 0,
   POB_CURRENT_SESSION = 1
};

enum ENUM_POB_ENTRY_STYLE
{
   POB_BREAKOUT = 0,
   POB_REJECTION = 1,
   POB_BOTH = 2
};

input string          TradingSymbol              = "XAUUSD";
input ENUM_TIMEFRAMES ExecutionTimeframe         = PERIOD_M5;
input long            MagicNumber                = 26052504;

input double          InitialBalance             = 25000.0;
input double          TotalRiskPct               = 0.50;
input int             MaxGroupsPerDay            = 3;
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

input ENUM_POB_SOURCE POBSource                  = POB_PREVIOUS_DAY;
input ENUM_POB_ENTRY_STYLE EntryStyle            = POB_BOTH;
input double          ONMRatio                   = 0.146;
input double          DeciderRatio               = 0.236;
input int             LevelsPerSide              = 10;
input int             CycleMinutes               = 15;
input int             CycleOffsetMinutes         = 0;
input int             SignalLookbackBars         = 2;
input double          LevelTouchBufferPoints     = 80.0;
input double          LevelBreakBufferPoints     = 50.0;
input double          StopBufferPoints           = 120.0;
input bool            RequireCandleBody          = true;
input double          MinBodyToRangeRatio        = 0.50;
input bool            RequireEmaDirection        = true;
input bool            RequirePriceSideOfSlowEma  = true;
input int             FastEmaPeriod              = 20;
input int             SlowEmaPeriod              = 50;
input bool            RequireAdxFilter           = true;
input int             AdxPeriod                  = 14;
input double          MinAdx                     = 18.0;
input int             CooldownBarsAfterGroup     = 3;

input bool            UseThreePortions           = true;
input double          FallbackTP1_R              = 1.00;
input double          FallbackTP2_R              = 2.00;
input double          FallbackTP3_R              = 3.00;

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
int adxHandle = INVALID_HANDLE;
datetime lastBarTime = 0;
datetime lastEntryBarTime = 0;
string lastBlockReason = "";
int cooldownBarsRemaining = 0;

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
   adxHandle = iADX(tradeSymbol, ExecutionTimeframe, AdxPeriod);

   if(fastEmaHandle == INVALID_HANDLE || slowEmaHandle == INVALID_HANDLE || adxHandle == INVALID_HANDLE)
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
   if(adxHandle != INVALID_HANDLE) IndicatorRelease(adxHandle);
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

   if(cooldownBarsRemaining > 0)
   {
      cooldownBarsRemaining--;
      return;
   }

   if(CountOpenEaPositions() > 0)
      return;

   if(CountTodayGroupedEntries() >= MaxGroupsPerDay)
      return;

   if(!IsCycleSignalBar())
      return;

   int direction = 0;
   double entryLevel = 0.0;
   double sl = 0.0;
   double tp1 = 0.0;
   double tp2 = 0.0;
   double tp3 = 0.0;

   if(!BuildPOBSignal(direction, entryLevel, sl, tp1, tp2, tp3))
      return;

   OpenThreePortions(direction, entryLevel, sl, tp1, tp2, tp3);
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

bool BuildPOBSignal(int &direction, double &entryLevel, double &sl, double &tp1, double &tp2, double &tp3)
{
   direction = 0;
   entryLevel = 0.0;
   sl = 0.0;
   tp1 = 0.0;
   tp2 = 0.0;
   tp3 = 0.0;

   MqlRates rates[];
   ArrayResize(rates, MathMax(SignalLookbackBars + 5, 12));
   ArraySetAsSeries(rates, true);
   if(CopyRates(tradeSymbol, ExecutionTimeframe, 0, ArraySize(rates), rates) < ArraySize(rates))
      return false;

   if(RequireCandleBody)
   {
      double range = rates[1].high - rates[1].low;
      double body = MathAbs(rates[1].close - rates[1].open);
      if(range <= 0.0 || body / range < MinBodyToRangeRatio)
         return false;
   }

   if(RequireAdxFilter)
   {
      double adx[];
      ArrayResize(adx, 3);
      ArraySetAsSeries(adx, true);
      if(CopyBuffer(adxHandle, 0, 0, 3, adx) < 3)
         return false;
      if(adx[1] < MinAdx)
         return false;
   }

   double levels[];
   if(!BuildPOBLevels(levels))
      return false;

   double point = SymbolInfoDouble(tradeSymbol, SYMBOL_POINT);
   double touchBuffer = LevelTouchBufferPoints * point;
   double breakBuffer = LevelBreakBufferPoints * point;

   int buyIndex = -1;
   int sellIndex = -1;

   for(int i = 1; i < ArraySize(levels) - 1; i++)
   {
      double level = levels[i];

      bool buyBreak = rates[2].close <= level && rates[1].close > level + breakBuffer && rates[1].close > rates[1].open;
      bool sellBreak = rates[2].close >= level && rates[1].close < level - breakBuffer && rates[1].close < rates[1].open;

      bool buyReject = rates[1].low <= level + touchBuffer && rates[1].close > level + breakBuffer && rates[1].close > rates[1].open;
      bool sellReject = rates[1].high >= level - touchBuffer && rates[1].close < level - breakBuffer && rates[1].close < rates[1].open;

      if((EntryStyle == POB_BREAKOUT || EntryStyle == POB_BOTH) && buyBreak)
         buyIndex = i;

      if((EntryStyle == POB_BREAKOUT || EntryStyle == POB_BOTH) && sellBreak)
         sellIndex = i;

      if((EntryStyle == POB_REJECTION || EntryStyle == POB_BOTH) && buyReject)
         buyIndex = i;

      if((EntryStyle == POB_REJECTION || EntryStyle == POB_BOTH) && sellReject)
         sellIndex = i;
   }

   if(buyIndex < 0 && sellIndex < 0)
      return false;

   if(buyIndex >= 0 && sellIndex >= 0)
      return false;

   if(buyIndex >= 0)
      direction = 1;
   else
      direction = -1;

   if(RequireEmaDirection && !EmaAllows(direction))
      return false;

   int index = direction > 0 ? buyIndex : sellIndex;
   entryLevel = levels[index];

   if(direction > 0)
   {
      sl = levels[MathMax(0, index - 1)] - StopBufferPoints * point;
      tp1 = levels[MathMin(ArraySize(levels) - 1, index + 1)];
      tp2 = levels[MathMin(ArraySize(levels) - 1, index + 2)];
      tp3 = levels[MathMin(ArraySize(levels) - 1, index + 3)];
   }
   else
   {
      sl = levels[MathMin(ArraySize(levels) - 1, index + 1)] + StopBufferPoints * point;
      tp1 = levels[MathMax(0, index - 1)];
      tp2 = levels[MathMax(0, index - 2)];
      tp3 = levels[MathMax(0, index - 3)];
   }

   double entry = direction > 0 ? SymbolInfoDouble(tradeSymbol, SYMBOL_ASK) : SymbolInfoDouble(tradeSymbol, SYMBOL_BID);
   double riskDistance = MathAbs(entry - sl);
   if(riskDistance <= 0.0)
      return false;

   if(tp1 == tp2 || tp2 == tp3 || MathAbs(tp1 - entry) < riskDistance * 0.35)
   {
      tp1 = direction > 0 ? entry + riskDistance * FallbackTP1_R : entry - riskDistance * FallbackTP1_R;
      tp2 = direction > 0 ? entry + riskDistance * FallbackTP2_R : entry - riskDistance * FallbackTP2_R;
      tp3 = direction > 0 ? entry + riskDistance * FallbackTP3_R : entry - riskDistance * FallbackTP3_R;
   }

   int digits = (int)SymbolInfoInteger(tradeSymbol, SYMBOL_DIGITS);
   sl = NormalizeDouble(sl, digits);
   tp1 = NormalizeDouble(tp1, digits);
   tp2 = NormalizeDouble(tp2, digits);
   tp3 = NormalizeDouble(tp3, digits);

   return ValidStops(direction, entry, sl, tp1, tp2, tp3);
}

bool EmaAllows(const int direction)
{
   double fast[], slow[];
   MqlRates rates[];
   ArrayResize(fast, 3);
   ArrayResize(slow, 3);
   ArrayResize(rates, 3);
   ArraySetAsSeries(fast, true);
   ArraySetAsSeries(slow, true);
   ArraySetAsSeries(rates, true);

   if(CopyBuffer(fastEmaHandle, 0, 0, 3, fast) < 3) return false;
   if(CopyBuffer(slowEmaHandle, 0, 0, 3, slow) < 3) return false;
   if(CopyRates(tradeSymbol, ExecutionTimeframe, 0, 3, rates) < 3) return false;

   if(direction > 0)
   {
      if(fast[1] < slow[1])
         return false;
      if(RequirePriceSideOfSlowEma && rates[1].close < slow[1])
         return false;
      return true;
   }

   if(fast[1] > slow[1])
      return false;
   if(RequirePriceSideOfSlowEma && rates[1].close > slow[1])
      return false;
   return true;
}

bool BuildPOBLevels(double &levels[])
{
   double high = 0.0;
   double low = 0.0;
   if(!GetPOBRange(high, low))
      return false;

   double range = high - low;
   if(range <= 0.0)
      return false;

   double onm = range * ONMRatio;
   double decider = range * DeciderRatio;
   int capacity = 4 + LevelsPerSide * 4;
   ArrayResize(levels, capacity);
   int count = 0;

   AddLevel(levels, count, high);
   AddLevel(levels, count, low);
   AddLevel(levels, count, high + onm);
   AddLevel(levels, count, high + decider);
   AddLevel(levels, count, low - onm);
   AddLevel(levels, count, low - decider);

   for(int i = 2; i <= LevelsPerSide; i++)
   {
      AddLevel(levels, count, high + onm * i);
      AddLevel(levels, count, high + decider * i);
      AddLevel(levels, count, low - onm * i);
      AddLevel(levels, count, low - decider * i);
   }

   ArrayResize(levels, count);
   SortLevels(levels);
   return count >= 6;
}

void AddLevel(double &levels[], int &count, const double value)
{
   double point = SymbolInfoDouble(tradeSymbol, SYMBOL_POINT);
   double minGap = MathMax(point, 1e-8);
   for(int i = 0; i < count; i++)
   {
      if(MathAbs(levels[i] - value) <= minGap)
         return;
   }
   levels[count] = value;
   count++;
}

void SortLevels(double &levels[])
{
   int n = ArraySize(levels);
   for(int i = 0; i < n - 1; i++)
   {
      for(int j = i + 1; j < n; j++)
      {
         if(levels[j] < levels[i])
         {
            double tmp = levels[i];
            levels[i] = levels[j];
            levels[j] = tmp;
         }
      }
   }
}

bool GetPOBRange(double &high, double &low)
{
   high = 0.0;
   low = 0.0;

   if(POBSource == POB_PREVIOUS_DAY)
   {
      MqlRates d1[];
      ArrayResize(d1, 3);
      ArraySetAsSeries(d1, true);
      if(CopyRates(tradeSymbol, PERIOD_D1, 0, 3, d1) < 3)
         return false;
      high = d1[1].high;
      low = d1[1].low;
      return high > low;
   }

   datetime now = TimeTradeServerSafe();
   datetime start = DayStart(now);
   MqlRates rates[];
   ArraySetAsSeries(rates, true);
   int copied = CopyRates(tradeSymbol, ExecutionTimeframe, start, now, rates);
   if(copied < 6)
      return false;

   high = rates[0].high;
   low = rates[0].low;
   for(int i = 1; i < copied; i++)
   {
      high = MathMax(high, rates[i].high);
      low = MathMin(low, rates[i].low);
   }
   return high > low;
}

bool ValidStops(const int direction, const double entry, const double sl, const double tp1, const double tp2, const double tp3)
{
   double point = SymbolInfoDouble(tradeSymbol, SYMBOL_POINT);
   int stopsLevel = (int)SymbolInfoInteger(tradeSymbol, SYMBOL_TRADE_STOPS_LEVEL);
   double minDistance = MathMax(stopsLevel * point, point);

   if(direction > 0)
      return sl < entry - minDistance && tp1 > entry + minDistance && tp2 > tp1 && tp3 > tp2;

   return sl > entry + minDistance && tp1 < entry - minDistance && tp2 < tp1 && tp3 < tp2;
}

void OpenThreePortions(const int direction, const double entryLevel, const double sl, const double tp1, const double tp2, const double tp3)
{
   datetime times[];
   ArrayResize(times, 1);
   ArraySetAsSeries(times, true);
   if(CopyTime(tradeSymbol, ExecutionTimeframe, 0, 1, times) != 1)
      return;

   if(lastEntryBarTime == times[0])
      return;

   double entry = direction > 0 ? SymbolInfoDouble(tradeSymbol, SYMBOL_ASK) : SymbolInfoDouble(tradeSymbol, SYMBOL_BID);
   ENUM_ORDER_TYPE orderType = direction > 0 ? ORDER_TYPE_BUY : ORDER_TYPE_SELL;
   double totalLots = CalculateTotalLots(orderType, entry, sl);
   if(totalLots <= 0.0)
   {
      Print("Lot calculation returned zero. POB 3TP skipped.");
      return;
   }

   int portions = UseThreePortions ? 3 : 1;
   double partLots = NormalizeVolume(totalLots / portions);
   if(partLots <= 0.0)
   {
      Print("Portion lot below broker minimum. POB 3TP skipped.");
      return;
   }

   string group = IntegerToString((int)times[0]);
   bool ok1 = false;
   bool ok2 = false;
   bool ok3 = false;
   string baseComment = "POB3 " + group + " L" + DoubleToString(entryLevel, 2);

   if(direction > 0)
   {
      ok1 = trade.Buy(partLots, tradeSymbol, 0.0, sl, tp1, baseComment + " TP1");
      if(UseThreePortions) ok2 = trade.Buy(partLots, tradeSymbol, 0.0, sl, tp2, baseComment + " TP2");
      if(UseThreePortions) ok3 = trade.Buy(partLots, tradeSymbol, 0.0, sl, tp3, baseComment + " TP3");
   }
   else
   {
      ok1 = trade.Sell(partLots, tradeSymbol, 0.0, sl, tp1, baseComment + " TP1");
      if(UseThreePortions) ok2 = trade.Sell(partLots, tradeSymbol, 0.0, sl, tp2, baseComment + " TP2");
      if(UseThreePortions) ok3 = trade.Sell(partLots, tradeSymbol, 0.0, sl, tp3, baseComment + " TP3");
   }

   if(ok1 || ok2 || ok3)
   {
      lastEntryBarTime = times[0];
      cooldownBarsRemaining = CooldownBarsAfterGroup;
   }

   if(!ok1 || (UseThreePortions && (!ok2 || !ok3)))
      Print("One or more POB portions failed. Retcode=", trade.ResultRetcode(), " ", trade.ResultRetcodeDescription());
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
   int portions = UseThreePortions ? 3 : 1;

   if(rawLots / portions < minLot)
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
      MoveRemainingStopsToTarget(1);

   if(tp1Open == 0 && tp2Open == 0 && tp3Open > 0)
      MoveRemainingStopsToTarget(2);
}

void MoveRemainingStopsToTarget(const int targetNumber)
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
      double tp = PositionGetDouble(POSITION_TP);
      double currentSl = PositionGetDouble(POSITION_SL);
      double targetR = CommentTargetR(comment);
      if(targetR <= 0.0 || tp <= 0.0)
         continue;

      double riskDistance = MathAbs(tp - entry) / targetR;
      double moveR = targetNumber == 1 ? FallbackTP1_R : FallbackTP2_R;
      double newSl = type == POSITION_TYPE_BUY ? entry + riskDistance * moveR
                                               : entry - riskDistance * moveR;
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
            Print("Failed to move POB SL. Retcode=", trade.ResultRetcode(), " ", trade.ResultRetcodeDescription());
      }
   }
}

double CommentTargetR(const string comment)
{
   if(StringFind(comment, "TP1") >= 0) return FallbackTP1_R;
   if(StringFind(comment, "TP2") >= 0) return FallbackTP2_R;
   if(StringFind(comment, "TP3") >= 0) return FallbackTP3_R;
   return 0.0;
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

bool IsEaPosition()
{
   return PositionGetString(POSITION_SYMBOL) == tradeSymbol &&
          (long)PositionGetInteger(POSITION_MAGIC) == MagicNumber;
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
   int start = StringFind(comment, "POB3 ");
   if(start < 0)
      return "";

   int levelPos = StringFind(comment, " L", start);
   if(levelPos < 0)
      return comment;

   return StringSubstr(comment, start, levelPos - start);
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
   double high = 0.0;
   double low = 0.0;
   GetPOBRange(high, low);

   Comment(
      "FundedNext POB Cyclic 3TP EA\n",
      "Status: ", status, "\n",
      "POB high/low: ", DoubleToString(high, 2), " / ", DoubleToString(low, 2),
      " | Cycle: ", IntegerToString(CycleMinutes), " min",
      " | Groups: ", IntegerToString(CountTodayGroupedEntries()), "/", IntegerToString(MaxGroupsPerDay), "\n",
      "Daily PnL: ", DoubleToString(dailyPnl, 2),
      " | Equity: ", DoubleToString(equity, 2),
      " | Max floor: ", DoubleToString(maxFloor, 2),
      " | Target: ", DoubleToString(targetEquity, 2), "\n",
      "Open portions: ", IntegerToString(CountOpenEaPositions()),
      " | Spread: ", DoubleToString(CurrentSpreadPoints(), 1),
      " | Group losses: ", IntegerToString(CountConsecutiveGroupLosses()), "/", IntegerToString(MaxConsecutiveGroupLosses)
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
