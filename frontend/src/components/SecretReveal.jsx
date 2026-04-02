function SecretReveal({ secret }) {
  return (
    <div className="secret-box">
      <strong>Decrypted Secret:</strong>
      <div style={{ marginTop: "10px" }}>{secret}</div>
    </div>
  );
}

export default SecretReveal;
