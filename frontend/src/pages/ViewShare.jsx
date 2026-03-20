import { useParams } from "react-router-dom";
import CodeInput from "../components/CodeInput";
import SecretDisplay from "../components/SecretDisplay";
import useDecryptShare from "../hooks/useDecryptShare";

function ViewShare() {
  const { id } = useParams();

  const { code, setCode, secret, error, loading, decryptSecret } =
    useDecryptShare(id);

  return (
    <div className="page-container">
      <div className="card">
        <h1 className="title">View Secret</h1>
        <p className="subtitle">
          Enter the 6-digit code to decrypt the secret. It will be destroyed
          after viewing.
        </p>

        <CodeInput
          code={code}
          setCode={setCode}
          decryptSecret={decryptSecret}
          loading={loading}
        />

        {error && <p className="error">{error}</p>}

        {secret && <SecretDisplay secret={secret} />}
      </div>
    </div>
  );
}

export default ViewShare;
