import { formatDateMobile } from "../utils/dateHelpers";

export default function StatsPanel({
  currentActiveData,
  activeElapsedDaysValid,
  tickCount,
  duration,
  dailyAmount,
  totalPoolMax,
}) {
  const expectedAmount = activeElapsedDaysValid * dailyAmount;
  const actualAmount = tickCount * dailyAmount;

  const activeTitleText = currentActiveData
    ? `No. ${currentActiveData.no} (${formatDateMobile(currentActiveData.start)} - ${formatDateMobile(
        currentActiveData.end
      )})`
    : "Loading...";

  return (
    <div className="stats-grid">
      <div className="stat-card active-accent">
        <div className="stat-label">Current Active Cycle</div>
        <div className="stat-value">{activeTitleText}</div>
        <div className="stat-subtext">
          Should Be Saved: {expectedAmount.toLocaleString()} PKR ({activeElapsedDaysValid}/{duration} Days passed)
        </div>
        <div className="stat-subtext" style={{ color: "#bbf7d0", fontWeight: 700 }}>
          Actually Ticked: {actualAmount.toLocaleString()} PKR ({tickCount} Days Saved)
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Daily Amount</div>
        <div className="stat-value">{dailyAmount} PKR</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Total Pool Max</div>
        <div className="stat-value">{totalPoolMax.toLocaleString()} PKR</div>
      </div>
    </div>
  );
}
