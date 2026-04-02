import { useParams } from "react-router-dom";
import CodeInput from "../components/CodeInput";
import SecretReveal from "../components/SecretReveal";
import useDecryptShare from "../hooks/useDecryptShare";
import ShareCountdown from "../components/ShareCountdown";

function ViewShare() {
  const { id } = useParams();

  const { code, setCode, secret, error, loading, decryptSecret, expiresAt } =
    useDecryptShare(id);

  return (
    <div className="page-container">
      <div className="card">
        <h1 className="title">View Secret</h1>
        <p className="subtitle">
          Enter the 6-digit code to decrypt the secret. It will be destroyed
          after viewing.
        </p>

        {expiresAt && <ShareCountdown expiresAt={expiresAt} />}

        <CodeInput
          code={code}
          setCode={setCode}
          decryptSecret={decryptSecret}
          loading={loading}
        />

        {error && <p className="error">{error}</p>}

        {secret && <SecretReveal secret={secret} />}
      </div>
    </div>
  );
}

export default ViewShare;
