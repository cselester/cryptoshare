function SecretForm({ secret, setSecret, createSecret, loading }) {
  return (
    <>
      <label className="label">Enter secret text</label>

      <textarea
        className="textarea"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        placeholder="Paste password, API key, token, or confidential text..."
      />

      <button className="button" onClick={createSecret} disabled={loading}>
        {loading ? "Creating..." : "Create Secure Share"}
      </button>
    </>
  );
}

export default SecretForm;
