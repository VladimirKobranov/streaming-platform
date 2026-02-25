import { useState, useRef } from "react";
import { Upload, FileVideo, CheckCircle, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import log from "../etc/utils";

export default function UploadPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ id: string; url: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

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
      setProgress(0);
    }
  };

  const handleUpload = () => {
    if (!file) {
      log.w("Attempted upload without selecting a file");
      return;
    }

    log.i("Preparing to upload:", file.name);
    setUploading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setProgress(percent);
        log.d("Upload progress:", percent + "%");
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        log.i("Upload completed successfully. ID:", data.id);
        setResult(data);
      } else {
        log.e("Upload failed with status:", xhr.status, xhr.statusText);
        setError("Upload failed");
      }
      setUploading(false);
    });

    xhr.addEventListener("error", () => {
      log.e("Upload error encountered");
      setError("Upload failed");
      setUploading(false);
    });

    xhr.addEventListener("abort", () => {
      log.i("Upload cancelled");
      setUploading(false);
    });

    xhr.open("POST", `${import.meta.env.VITE_APP_API_URL}/api/upload`);
    xhr.send(formData);
  };

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
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

            {uploading ? (
              <div className="flex flex-col gap-3">
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-brand-primary h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary">
                    {progress}% uploaded
                  </span>
                  <button
                    onClick={cancelUpload}
                    className="text-sm text-brand-error hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="btn w-full py-4"
                disabled={!file}
                onClick={handleUpload}
              >
                <Upload size={20} />
                {t("upload.btn_start")}
              </button>
            )}
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
