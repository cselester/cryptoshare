import { useState } from "react";
import { createShare } from "../utils/api";
import { encryptText, generateSecureSixDigitCode } from "../utils/crypto";

function useCreateShare() {
  const [secret, setSecret] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createSecret = async () => {
    setError("");
    setShareLink("");
    setCode("");

    if (!secret.trim()) {
      setError("Please enter secret text.");
      return;
    }

    try {
      setLoading(true);

      const generatedCode = generateSecureSixDigitCode();
      const encrypted = await encryptText(secret, generatedCode);
      const response = await createShare(encrypted);

      const link = `${window.location.origin}/view/${response.id}`;

      setShareLink(link);
      setCode(generatedCode);
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
    loading,
    error,
    createSecret,
  };
}

export default useCreateShare;