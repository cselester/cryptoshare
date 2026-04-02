import { useEffect, useState } from "react";
import { formatExpiryTimestamp, getCountdownLabel } from "../utils/dateTime";

function ShareCountdown({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState(() => getCountdownLabel(expiresAt));

  useEffect(() => {
    setTimeLeft(getCountdownLabel(expiresAt));

    const interval = setInterval(() => {
      const nextValue = getCountdownLabel(expiresAt);
      setTimeLeft(nextValue);

      if (nextValue === "Expired") {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!timeLeft) {
    return null;
  }

  const formattedExpiry = formatExpiryTimestamp(expiresAt);

  return (
    <div className="timer">
      <strong>Expires in:</strong> {timeLeft}
      {formattedExpiry && (
        <span className="timer-meta">Ends at {formattedExpiry}</span>
      )}
    </div>
  );
}

export default ShareCountdown;
