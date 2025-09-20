# FAANG+ Dynamic Valuation-Guided Investment Program

## 1. Strategy Overview (Deliverable 1)
The program is designed for investors who make systematic monthly contributions into a diversified basket of leading technology companies. It blends disciplined dollar-cost averaging with valuation-sensitive tilts so that new capital preferentially flows to attractively priced names while maintaining broad exposure to the innovation-driven technology sector. The framework can be executed inside retirement plans (401(k), IRA) and taxable accounts using brokers that support fractional shares, automated investing rules, and low transaction costs.

Key design principles include:
- **Systematic contributions:** Automate transfers on a fixed calendar date to reduce behavioral biases.
- **Valuation-aware tilts:** Score each company on multiple valuation factors and direct incremental contributions to those trading at discounts relative to their historical and sector-normalized levels.
- **Risk controls:** Apply position and sector limits, volatility adjustments, and correlation monitoring to prevent concentration risk.
- **Cost and tax efficiency:** Use fractional shares, commission-free brokers, and tax-loss harvesting to enhance after-tax returns.
- **Continuous feedback:** Reassess inputs monthly, track performance versus benchmarks, and refine rules after predefined evaluation periods.

## 2. Stock Universe and Data Inputs (Deliverable 1)
1. **Core FAANG+ constituents:** Apple (AAPL), Microsoft (MSFT), Alphabet Class A or C (GOOGL/GOOG), Amazon (AMZN), Meta (META), Tesla (TSLA), Netflix (NFLX), NVIDIA (NVDA).
2. **Emerging adjacencies (optional):** Advanced Micro Devices (AMD), Salesforce (CRM), Adobe (ADBE), Broadcom (AVGO), ServiceNow (NOW), Snowflake (SNOW), Taiwan Semiconductor ADR (TSM). Include a candidate if its market capitalization exceeds \$100B, revenue growth exceeds 15% year-over-year, and it has meaningful exposure to cloud, AI, or digital consumer ecosystems.
3. **Data sources:**
   - Fundamental data: SEC filings, company investor relations, data vendors (FactSet, Bloomberg, Capital IQ, Koyfin, Alpha Vantage premium).
   - Consensus estimates: Analyst aggregators (Refinitiv, FactSet, Seeking Alpha), or free alternatives (Yahoo Finance, Zacks).
   - Historical averages: At least 5–10 years of quarterly valuation metrics for each company.
   - Market data: Daily prices, volumes, and total returns for all tickers plus the Nasdaq 100 (QQQ) and S&P 500 (SPY) as benchmarks.

## 3. Valuation Scoring Methodology (Deliverable 2)
Each month, compute six valuation factors for every stock, normalize them relative to historical and peer values, and synthesize them into a composite score between 0 (most overvalued) and 1 (most undervalued). The scoring steps are:

1. **Calculate raw metrics:**
   - Trailing twelve-month P/E, P/S, EV/EBITDA, and P/B (if tangible book value is meaningful; otherwise substitute EV/FCF).
   - Forward 12-month P/E using consensus EPS estimates.
   - PEG ratio = (Forward P/E) / (Consensus 3–5 year EPS CAGR).
2. **Standardize versus history:** For each metric, compute the percentile rank versus the stock’s 10-year historical distribution. Lower percentiles indicate cheaper valuations. Example: a trailing P/E at the 35th percentile of history receives 0.65 attractiveness.
3. **Cross-sectional adjustment:** Compare the metric to the peer median (FAANG+ universe). Assign +0.05 bonus if the metric is at least 10% below the peer median after adjusting for growth differentials, –0.05 penalty if 10% above.
4. **Stability adjustments:** If revenue growth decelerated by more than 5 percentage points year-over-year or operating margin contracted >200 bps, cap the metric attractiveness at 0.6 to avoid value traps.
5. **Weighting scheme:**
   - Trailing P/E: 20%
   - Forward P/E: 20%
   - PEG: 15%
   - P/S: 15%
   - EV/EBITDA: 20%
   - P/B or EV/FCF substitute: 10%
6. **Composite score:** Sum(weight × adjusted attractiveness). Scores ≥0.65 imply attractive valuation; ≤0.35 imply stretched valuation.
7. **Qualitative overlay (optional):** Flag extraordinary events (e.g., antitrust fines, product launches) and adjust the score by ±0.05 at most to reflect forward-looking shifts.

## 4. Monthly Allocation Decision Framework (Deliverable 3)
1. **Inputs collected by the third business day**: Updated valuation scores, realized volatility (annualized daily standard deviation over prior 60 trading days), pairwise correlations (60-day lookback), tax lots, and available cash.
2. **Capital budget:** Define the monthly contribution amount (e.g., \$5,000). Reserve 5% as cash buffer for flexibility and transaction cost coverage.
3. **Baseline weights:** Set long-term strategic weights (e.g., equal-weight across core names or market-cap-weighted). These represent neutral allocations.
4. **Valuation tilts:**
   - Compute deviation factor = (composite score – 0.5) × tilt multiplier (default 0.4).
   - Adjust target weight = baseline weight × (1 + deviation factor).
   - Enforce bounds: minimum 50% of baseline weight, maximum 150% of baseline weight.
5. **Volatility adjustment:** Scale each target weight by (Target Volatility / Stock Volatility). Target volatility default: 40% annualized. Cap scaling to ±20% to prevent extreme shifts.
6. **Correlation overlay:** If two stocks exhibit >0.85 correlation and both are overweight, reduce the lower-scoring stock’s weight by 10% of its target to manage redundancy.
7. **Normalization:** Rescale all adjusted weights so they sum to 100% of deployable capital (95% of contribution).
8. **Minimum allocation rule:** Ensure each core FAANG+ stock receives at least 50% of its baseline weight after adjustments. Emerging players can drop to zero if composite scores <0.3.
9. **Execution plan:** Convert target dollar allocations into share quantities using fractional shares where available. Schedule trades for mid-month (e.g., 10th business day) to allow for any late-breaking information.

## 5. Rebalancing Rules and Triggers (Deliverable 4)
- **Monthly light rebalance:** Redirect new contributions according to the valuation-tilted targets without selling unless holdings exceed 120% of target weight.
- **Threshold rebalance:** On the monthly review date, generate sell orders if a position exceeds its maximum allocation (the lesser of 15% of portfolio value or 175% of target weight) or falls below 60% of the minimum threshold.
- **Transaction cost guardrails:** Only execute trades if the dollar amount exceeds \$250 or if failing to act would breach risk limits. Use limit orders near VWAP to avoid slippage; if broker charges per-trade fees, batch orders.
- **Tax-loss harvesting (taxable accounts):**
  - Evaluate unrealized losses each month. If a position is down more than 10% from cost basis and composite score ≤0.45, harvest loss by selling and replacing with a close substitute (e.g., sell GOOGL buy GOOG; sell NVDA buy SOXX ETF) to maintain exposure while observing wash-sale rules.
  - Track replacement holding periods and set reminders to repurchase the original stock after 31 days if valuations remain favorable.
- **Extraordinary rebalance:** Trigger ad hoc reviews upon events such as earnings surprises causing >15% price moves, regulatory actions, or material changes in growth outlook.

## 6. Risk Management Program (Deliverable 5 – part A)
- **Position limits:** Cap any single core holding at 18% of portfolio value, emerging holdings at 10%. Apply soft cap (initiate trimming) at 16% and 8%, respectively.
- **Sector exposure:** Aggregate by sub-themes (Consumer Platforms, Enterprise Cloud, Electric Vehicles, Semiconductors). Require at least three sub-themes represented and cap any at 45% of portfolio value.
- **Volatility bands:** Compute 60-day annualized volatility. If >60%, reduce weight by 20% relative to target; if <25%, allow 10% overweight (subject to other limits).
- **Liquidity checks:** Avoid holding more than 5% of average daily dollar volume; for mega-cap names this is rarely binding but ensures scalability.
- **Correlation monitoring:** Maintain rolling correlation matrix. Flag any pair with correlation >0.9 and combined allocation >25%, and consider substituting with lower-correlated alternatives (e.g., diversify with semiconductor ETF).
- **Downside protection:** Optionally allocate up to 5% of portfolio to QQQ put spreads during periods when composite scores average <0.45 and macro risk indicators (e.g., inverted yield curve, rising credit spreads) flash warnings.

## 7. Performance Measurement & Strategy Refinement (Deliverable 5 – part B)
1. **Benchmarks:** Compare total return against equal-weighted FAANG+ index, Nasdaq 100, and S&P 500.
2. **Attribution:** Decompose returns into allocation effect (valuation tilts) vs. selection effect (individual security performance). Track contribution of tax-loss harvesting.
3. **Risk metrics:** Record annualized volatility, Sharpe ratio (vs. risk-free), maximum drawdown, and information ratio vs. QQQ.
4. **Rebalancing impact:** Monitor turnover and transaction costs; aim for annual turnover <60%.
5. **Review cadence:** Conduct quarterly deep dives to reassess scoring weights, growth estimates, and inclusion of emerging names. After each calendar year, run a full post-mortem and adjust parameters only if improvements are statistically significant over 3-year rolling windows.
6. **Backtesting methodology:**
   - Historical data from 2010 onward (or earliest available for new entrants).
   - Simulate monthly contributions, valuation scoring, and rebalancing rules exactly as codified.
   - Incorporate transaction costs (e.g., \$0.005 per share or \$1 per trade) and assume fractional shares allowed.
   - Validate robustness via walk-forward analysis and sensitivity tests on weighting parameters.
7. **Ongoing monitoring:** Automate dashboards (e.g., using Python/Streamlit) that display current scores, allocations, drift, realized gains/losses, and compliance with risk limits.

## 8. Implementation Checklist and Timeline (Deliverable 6)
| Timeline | Task | Details |
| --- | --- | --- |
| Week 0 | Select brokerage platform | Requirements: fractional shares, automatic investments, tax-loss harvesting tools, API access (e.g., Fidelity, Schwab, Interactive Brokers, M1 Finance). |
| Week 0 | Data pipeline setup | Subscribe to data feeds; configure scripts to pull prices and fundamentals (Python packages: `pandas`, `yfinance`, `alpha_vantage`). |
| Week 1 | Build valuation engine | Implement metric calculations, historical percentile mapping, and composite scoring. Validate against manual samples. |
| Week 1 | Define baseline weights | Choose equal-weight (12.5% per core) or risk-weighted baseline. Document rationale. |
| Week 2 | Configure allocation model | Code tilt formulas, volatility scaling, correlation overlay, and normalization. Backtest over at least 5 years. |
| Week 2 | Implement order routing | Integrate with broker API or automation platform (e.g., Tradier, Alpaca). Set trade date automation and compliance alerts. |
| Week 3 | Set up performance tracker | Build dashboard/spreadsheet for return, risk, and attribution tracking. |
| Week 3 | Draft tax management SOP | Document tax-loss harvesting steps, wash-sale checks, and annual tax filing process. |
| Ongoing | Monthly process | Execute data refresh → scoring → allocation → trade execution → performance logging. |
| Quarterly | Strategy review | Evaluate factor efficacy, adjust scoring weights if needed, confirm compliance with risk limits. |
| Annually | Comprehensive audit | Reassess universe, benchmark, tax records, and update long-term assumptions. |

## 9. Practical Execution Guidelines (Deliverable 1 & 6)
- **Minimum investment & fractional shares:** Platforms like M1 Finance, Fidelity, and Schwab support dollar-based investing, enabling participation even with \$500 monthly contributions.
- **Transaction costs:** Prioritize zero-commission brokers. If unavoidable, bundle trades and use thresholds to prevent fee drag.
- **Tax management:** Maintain detailed lot-level records. In taxable accounts, consider charitable gifting of highly appreciated shares to reset basis. In IRAs/401(k)s, focus solely on rebalancing efficiency since taxes are deferred.
- **Account integration:**
  - *401(k)/IRA:* Limited tickers may require ETF proxies (e.g., QQQM, VGT). Use the same scoring system to choose overweighted ETFs if individual stocks unavailable.
  - *Taxable:* Enable automated loss harvesting if broker offers (e.g., Betterment). Ensure replacement securities track similar exposures without breaching wash-sale rules.
- **Automation:** Schedule Python scripts (via cron or cloud functions) to pull data, recalculate scores, and send trade instructions. Use workflow tools (Zapier, IFTTT) for reminders and documentation storage (Notion, Google Drive).
- **Documentation:** Maintain an investment policy statement (IPS) summarizing objectives, constraints, scoring methodology, and governance. Archive monthly reports for audit trail.

## 10. Appendix – Key Formulas & Pseudocode
- **Historical percentile:** `percentile = rank(value, historical_values) / (n - 1)`
- **Adjusted attractiveness:** `attractiveness = 1 - percentile` (bounded 0–1) ± peer adjustment, capped 0–1.
- **Composite score:** `score = Σ(weight_i × attractiveness_i)`
- **Deviation factor:** `deviation = (score - 0.5) × 0.4`
- **Volatility scaling factor:** `scale = clip(TargetVol / StockVol, 0.8, 1.2)`
- **Normalized target weight:** `weight = normalize(baseline × (1 + deviation) × scale × correlation_adjustment)`
- **Backtesting loop pseudocode:**
```python
for month in months:
    update_fundamental_data()
    for stock in universe:
        metrics = compute_metrics(stock, month)
        score[stock] = composite_score(metrics)
    target_weights = apply_tilts(baseline_weights, score, volatilities, correlations)
    portfolio = rebalance(portfolio, target_weights, contribution, costs)
    log_performance(portfolio, benchmarks)
```
- **Tax-loss trigger:** `if unrealized_return <= -0.10 and score <= 0.45: execute_tax_loss_harvest(stock)`

---
This document provides all required deliverables: a comprehensive strategy description, explicit valuation scoring system, monthly allocation decision rules, rebalancing triggers, performance tracking approach, and an implementation checklist.
