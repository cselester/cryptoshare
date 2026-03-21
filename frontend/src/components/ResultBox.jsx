function ResultBox({ link, code }) {
  const copyText = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      console.log("Copy failed");
    }
  };

  return (
    <div className="result-box">
      <p className="success">Secret created successfully.</p>

      <p className="note">Share this link with the recipient:</p>
      <p>
        <a href={link}>{link}</a>
      </p>

      <button
        className="button"
        style={{ marginTop: "10px", marginRight: "10px" }}
        onClick={() => copyText(link)}
      >
        Copy Link
      </button>

      <p className="note" style={{ marginTop: "16px" }}>
        Share this 6-digit code separately:
      </p>

      <div className="code">{code}</div>

      <div style={{ marginTop: "10px" }}>
        <button className="button" onClick={() => copyText(code)}>
          Copy Code
        </button>
      </div>

      <p className="note">
        For better security, send the link and code through different channels.
      </p>

      <p className="note">
        ⚠️ This secret will self-destruct after viewing or in 10 minutes.
      </p>
    </div>
  );
}

export default ResultBox;
