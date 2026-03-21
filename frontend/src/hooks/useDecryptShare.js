import { useEffect, useState } from "react";
import { getShare, consumeShare, registerFailedAttempt } from "../utils/api";
import { decryptText } from "../utils/crypto";

function useDecryptShare(id) {
  const [code, setCode] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);

  useEffect(() => {
    const loadShareMeta = async () => {
      try {
        const payload = await getShare(id);
        setExpiresAt(payload.expires_at);
      } catch (err) {
        setError(err.message || "Unable to load secret.");
      }
    };

    if (id) {
      loadShareMeta();
    }
  }, [id]);

  const decryptSecret = async () => {
    setError("");
    setSecret("");

    if (!code.trim() || code.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    try {
      setLoading(true);

      const payload = await getShare(id);
      setExpiresAt(payload.expires_at);

      try {
        const plainText = await decryptText(
          payload.ciphertext,
          code,
          payload.salt,
          payload.iv
        );

        setSecret(plainText);
        await consumeShare(id);
      } catch {
        try {
          await registerFailedAttempt(id);
        } catch {}

        setError("Invalid code, expired secret, or already viewed.");
      }
    } catch (err) {
      setError(err.message || "Unable to retrieve secret.");
    } finally {
      setLoading(false);
    }
  };

    return {
    code,
    setCode,
    secret,
    error,
    loading,
    decryptSecret,
    expiresAt,
    };
}

export default useDecryptShare;