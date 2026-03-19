import { getQuarterLabel, formatDollars } from '../gameEngine';

function SalaryStatement({ summary, quarter, year, name, stageId }) {
  if (!summary) return null;
  const {
    quarterStartWealth, rentPaid, lifestyleCost, activityExpenses,
    gross, taxRate, taxWithheld, net,
    bonusInfo, totalDeposited, closingBalance,
    mustRepayMumRepaid,
  } = summary;

  const titleByStage = {
    analyst: 'Analyst', associate: 'Associate', vp: 'VP', director: 'Director',
  };
  const taxPct = Math.round(taxRate * 100);

  return (
    <div className="ss-wrap">
      <div className="ss-header">SWEATSHAW & CO — QUARTERLY COMPENSATION STATEMENT</div>
      <div className="ss-subheader">
        {getQuarterLabel(quarter)} {2025 + year} &nbsp;|&nbsp; {name} &nbsp;|&nbsp; {titleByStage[stageId] || stageId}
      </div>
      <div className="ss-divider" />

      <div className="ss-rows">
        <div className="ss-row">
          <span>Gross Quarterly Salary</span>
          <span>{formatDollars(gross)}</span>
        </div>
        <div className="ss-row muted">
          <span>Tax Rate</span>
          <span>{taxPct}%</span>
        </div>
        <div className="ss-row neg">
          <span>Tax Withheld</span>
          <span>-{formatDollars(taxWithheld)}</span>
        </div>
        <div className="ss-row pos">
          <span>Net Salary Deposited</span>
          <span>+{formatDollars(net)}</span>
        </div>

        {bonusInfo && (
          <>
            <div className="ss-spacer" />
            <div className="ss-row">
              <span>Annual Bonus (Gross)</span>
              <span>{formatDollars(bonusInfo.gross)}</span>
            </div>
            <div className="ss-row neg">
              <span>Tax Withheld on Bonus</span>
              <span>-{formatDollars(bonusInfo.taxWithheld)}</span>
            </div>
            <div className="ss-row pos">
              <span>Net Bonus Deposited</span>
              <span>+{formatDollars(bonusInfo.net)}</span>
            </div>
          </>
        )}

        {mustRepayMumRepaid && (
          <>
            <div className="ss-spacer" />
            <div className="ss-row neg">
              <span>Mum's Loan Repaid</span>
              <span>-{formatDollars(50_000)}</span>
            </div>
          </>
        )}
      </div>

      <div className="ss-divider" />

      <div className="ss-rows">
        <div className="ss-row muted">
          <span>Opening Balance (Q start)</span>
          <span>{formatDollars(quarterStartWealth)}</span>
        </div>
        <div className="ss-row pos">
          <span>Total Deposited This Quarter</span>
          <span>+{formatDollars(totalDeposited)}</span>
        </div>
        {(rentPaid > 0) && (
          <div className="ss-row neg">
            <span>Quarterly Rent</span>
            <span>-{formatDollars(rentPaid)}</span>
          </div>
        )}
        {(activityExpenses > 0) && (
          <div className="ss-row neg">
            <span>Activity Expenses</span>
            <span>-{formatDollars(activityExpenses)}</span>
          </div>
        )}
        {(lifestyleCost > 0) && (
          <div className="ss-row neg">
            <span>Lifestyle</span>
            <span>-{formatDollars(lifestyleCost)}</span>
          </div>
        )}
        <div className="ss-row closing">
          <span>Closing Balance</span>
          <span>{formatDollars(closingBalance)}</span>
        </div>
      </div>
    </div>
  );
}

export default function QuarterlySummary({ gameState: gs, onContinue }) {
  const { changes, riskMessage, dateFlavour } = gs.lastStatChanges || {};

  const deltas = changes
    ? Object.entries(changes).filter(([k, v]) => v !== 0 && k !== 'wealth')
    : [];

  const isEndOfQuarter = gs.currentMonth === 3;

  return (
    <div className="qs-screen">
      <div className="qs-bg" style={{ backgroundImage: 'url(/gsoffice.png)' }} />
      <div className="qs-bg-overlay" />
      <div className="qs-card">
        <div className="qs-tag">
          {getQuarterLabel(gs.currentQuarter)} {2025 + gs.currentYear} — MONTHLY RECAP
        </div>
        <h2 className="qs-title">End of Month {gs.currentMonth}</h2>

        {dateFlavour && (
          <div className="qs-flavour">
            <span className="qs-flavour-icon">💝</span>
            <p>{dateFlavour}</p>
          </div>
        )}

        {riskMessage && (
          <div className="qs-risk">⚠ {riskMessage}</div>
        )}

        {deltas.length > 0 ? (
          <div className="qs-changes">
            <div className="qs-changes-label">STAT CHANGES</div>
            <div className="qs-changes-list">
              {deltas.map(([k, v]) => (
                <div key={k} className={`qs-change ${v > 0 ? 'pos' : 'neg'}`}>
                  <span className="qs-change-stat">{k}</span>
                  <span className="qs-change-val">{v > 0 ? '+' : ''}{v}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="qs-no-change">No stat changes this month. Suspiciously quiet.</p>
        )}

        {isEndOfQuarter && gs.salarySummary && (
          <SalaryStatement
            summary={gs.salarySummary}
            quarter={gs.currentQuarter}
            year={gs.currentYear}
            name={gs.characterName}
            stageId={gs.currentStageId}
          />
        )}

        <div className="qs-current-stats">
          <div className="qs-stat-label">CURRENT STATS</div>
          <div className="qs-stat-row">
            {Object.entries(gs.stats)
              .filter(([k]) => k !== 'wealth')
              .map(([k, v]) => (
                <div key={k} className="qs-stat-item">
                  <span className="qs-stat-key">{k}</span>
                  <span className="qs-stat-val">{v}</span>
                </div>
              ))}
            <div className="qs-stat-item">
              <span className="qs-stat-key">wealth</span>
              <span className="qs-stat-val">{formatDollars(gs.stats.wealth)}</span>
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={onContinue}>
          {gs.currentMonth < 3
            ? '[ NEXT MONTH ]'
            : gs.currentQuarter < 4
              ? '[ NEXT QUARTER ]'
              : '[ YEAR-END REVIEW ]'
          }
        </button>
      </div>
    </div>
  );
}
