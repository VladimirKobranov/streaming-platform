import { useState } from "react";
import { Upload, FileVideo, CheckCircle, Copy, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import log from "../etc/utils";

export default function UploadPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ id: string; url: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      log.d("File selected:", selected.name, "Size:", selected.size, "bytes");

      if (selected.size > 1024 * 1024 * 1024) {
        log.w("File selection rejected: Size exceeds 1GB limit", selected.size);
        setError(t("upload.error_size"));
        return;
      }

      setFile(selected);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      log.w("Attempted upload without selecting a file");
      return;
    }

    log.i("Preparing to upload:", file.name);
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      log.d("Sending POST request to /api/upload...");
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/api/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        log.e(
          "Upload failed with status:",
          response.status,
          response.statusText,
        );
        throw new Error("Upload failed");
      }

      const data = await response.json();
      log.i("Upload completed successfully. ID:", data.id);
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      log.e("Upload error encountered:", msg);
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      const fullUrl = `${window.location.origin}${result.url}`;
      log.d("Copying link to clipboard:", fullUrl);
      navigator.clipboard.writeText(fullUrl);
      alert(t("common.copy_success"));
    }
  };

  return (
    <div className="container animate-fade mt-6">
      <div className="text-center mb-12">
        <h1>{t("upload.title")}</h1>
        <p className="text-secondary">{t("upload.subtitle")}</p>
      </div>

      <div className="card max-w-xl mx-auto">
        {!result ? (
          <div className="flex flex-col gap-8">
            <div
              className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center bg-white/[0.02] cursor-pointer transition-all hover:border-brand-primary"
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <input
                type="file"
                id="fileInput"
                hidden
                accept=".mp4,.mov,.mkv,.webm"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="flex flex-col items-center gap-4">
                  <FileVideo size={48} className="text-brand-primary" />
                  <div>
                    <p className="font-semibold">{file.name}</p>
                    <p className="text-secondary">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Upload size={48} className="text-brand-text-secondary" />
                  <div>
                    <p className="font-semibold">
                      {t("upload.dropzone_prompt")}
                    </p>
                    <p className="text-secondary">
                      {t("upload.dropzone_help")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="text-brand-error text-sm text-center">{error}</p>
            )}

            <button
              className="btn w-full py-4"
              disabled={!file || uploading}
              onClick={handleUpload}
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" />
                  {t("upload.btn_uploading")}
                </>
              ) : (
                <>
                  <Upload size={20} />
                  {t("upload.btn_start")}
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center flex flex-col gap-6 py-4">
            <div className="bg-brand-success/10 text-brand-success p-4 rounded-2xl inline-flex self-center">
              <CheckCircle size={48} />
            </div>
            <h2>{t("upload.success_title")}</h2>
            <p className="text-secondary">{t("upload.success_subtitle")}</p>

            <div className="bg-black/20 p-4 rounded-lg flex items-center gap-4 border border-white/10">
              <code className="flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap">
                {window.location.origin}
                {result.url}
              </code>
              <button
                onClick={copyToClipboard}
                className="btn-secondary p-2 rounded-lg"
              >
                <Copy size={18} />
              </button>
            </div>

            <a href={result.url} className="btn no-underline">
              {t("upload.btn_go_to_video")}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
