import SecretForm from "../components/SecretForm";
import ResultBox from "../components/ResultBox";
import useCreateShare from "../hooks/useCreateShare";

function CreateShare() {
  const { secret, setSecret, shareLink, code, loading, error, createSecret } =
    useCreateShare();

  return (
    <div className="page-container">
      <div className="card">
        <h1 className="title">Create Secure Secret</h1>
        <p className="subtitle">
          Encrypt and share sensitive text securely. The message self-destructs
          after viewing or within 10 minutes.
        </p>

        <SecretForm
          secret={secret}
          setSecret={setSecret}
          createSecret={createSecret}
          loading={loading}
        />

        {error && <p className="error">{error}</p>}

        {shareLink && <ResultBox link={shareLink} code={code} />}
      </div>
    </div>
  );
}

export default CreateShare;
