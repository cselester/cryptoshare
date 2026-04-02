import { useState } from "react";
import { createShare } from "../utils/api";
import { encryptText, generateSecureSixDigitCode } from "../utils/crypto";

function useCreateShare() {
  const [secret, setSecret] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [code, setCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createSecret = async () => {
    setError("");
    setShareLink("");
    setCode("");
    setExpiresAt("");

    if (!secret.trim()) {
      setError("Please enter secret text.");
      return;
    }

    try {
      setLoading(true);

      const generatedCode = generateSecureSixDigitCode();
      const encrypted = await encryptText(secret, generatedCode);
      const response = await createShare(encrypted);

      const BASE_URL = import.meta.env.VITE_APP_BASE_URL || window.location.origin;
      const link = `${BASE_URL}/s/${response.id}`;

      setShareLink(link);
      setCode(generatedCode);
      setExpiresAt(response.expires_at);
      setSecret("");
    } catch (err) {
      setError(err.message || "Failed to create secret");
    } finally {
      setLoading(false);
    }
  };

  return {
    secret,
    setSecret,
    shareLink,
    code,
    expiresAt,
    loading,
    error,
    createSecret,
  };
}

export default useCreateShare;
