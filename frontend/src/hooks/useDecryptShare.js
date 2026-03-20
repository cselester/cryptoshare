import { useState } from "react";
import { getShare, consumeShare, registerFailedAttempt } from "../utils/api";
import { decryptText } from "../utils/crypto";

function useDecryptShare(id) {
  const [code, setCode] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
  };
}

export default useDecryptShare;