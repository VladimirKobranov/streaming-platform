import { useState } from 'react';
import { Upload, FileVideo, CheckCircle, Copy, Loader2 } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ id: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 1024 * 1024 * 1024) {
        setError("File size exceeds 1GB limit");
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      const fullUrl = `${window.location.origin}${result.url}`;
      navigator.clipboard.writeText(fullUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="container animate-fade" style={{ marginTop: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>Upload & Stream</h1>
        <p className="text-secondary">Anonymous, high-quality, instant HLS streaming.</p>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {!result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div 
              style={{ 
                border: '2px dashed rgba(255,255,255,0.1)', 
                borderRadius: '1rem', 
                padding: '3rem 2rem', 
                textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <input 
                type="file" 
                id="fileInput" 
                hidden 
                accept=".mp4,.mov,.mkv,.webm" 
                onChange={handleFileChange} 
              />
              {file ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <FileVideo size={48} color="var(--primary-color)" />
                  <div>
                    <p style={{ fontWeight: 600 }}>{file.name}</p>
                    <p className="text-secondary">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <Upload size={48} className="text-secondary" />
                  <div>
                    <p style={{ fontWeight: 600 }}>Click or drag to upload</p>
                    <p className="text-secondary">MP4, MOV, MKV, WEBM (Max 1GB)</p>
                  </div>
                </div>
              )}
            </div>

            {error && <p style={{ color: 'var(--error-color)', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>}

            <button 
              className="btn" 
              disabled={!file || uploading} 
              onClick={handleUpload}
              style={{ padding: '1rem' }}
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Start Processing
                </>
              )}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success-color)', padding: '1rem', borderRadius: '1rem', display: 'inline-flex', alignSelf: 'center' }}>
              <CheckCircle size={48} />
            </div>
            <h2>Successfully Uploaded!</h2>
            <p className="text-secondary">Your video is being processed. You can share the link below:</p>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <code style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {window.location.origin}{result.url}
              </code>
              <button onClick={copyToClipboard} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '0.5rem' }}>
                <Copy size={18} />
              </button>
            </div>

            <a href={result.url} className="btn" style={{ textDecoration: 'none' }}>
              Go to Video Page
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
