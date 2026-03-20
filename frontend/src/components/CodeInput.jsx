function CodeInput({ code, setCode, decryptSecret, loading }) {
  return (
    <>
      <label className="label">6-digit code</label>

      <input
        className="input"
        type="text"
        maxLength="6"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        placeholder="Enter code"
      />

      <button className="button" onClick={decryptSecret} disabled={loading}>
        {loading ? "Decrypting..." : "Decrypt Secret"}
      </button>
    </>
  );
}

export default CodeInput;
