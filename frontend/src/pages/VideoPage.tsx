import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Hls from 'hls.js';
import { Loader2, AlertCircle } from 'lucide-react';

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'processing' | 'ready' | 'loading' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let pollInterval: number;

    const checkStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/video/${id}`);
        if (!response.ok) throw new Error('Video not found');
        
        const data = await response.json();
        setStatus(data.status);

        if (data.status === 'ready' || data.status === 'processing') {
            // Keep polling if processing, but we can try to initialize player anyway 
            // since task says "start playing before encoding finishes"
            // Actually, we'll initialize if processing or ready.
            if (data.status === 'processing') {
                // Keep polling to update status text, but start player
            } else {
                clearInterval(pollInterval);
            }
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to load video');
        clearInterval(pollInterval);
      }
    };

    checkStatus();
    pollInterval = window.setInterval(checkStatus, 2000);

    return () => clearInterval(pollInterval);
  }, [id]);

  useEffect(() => {
    if ((status === 'ready' || status === 'processing') && videoRef.current) {
      const hlsUrl = `http://localhost:8080/streams/${id}/master.m3u8`;
      
      if (Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
        });
        hls.loadSource(hlsUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // videoRef.current?.play();
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
                // If it's a 404, maybe it's just not ready yet (processing hasn't written master.m3u8)
                // We'll let it retry or just wait for next poll
            }
        });

        return () => hls.destroy();
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = hlsUrl;
      }
    }
  }, [status, id]);

  return (
    <div className="container animate-fade">
      <div className="card" style={{ padding: '0.75rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {status === 'loading' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
            <p className="text-secondary">Checking video status...</p>
          </div>
        )}

        {status === 'processing' && !error && (
            <div style={{ position: 'relative', flex: 1 }}>
                <video 
                    ref={videoRef} 
                    controls 
                    style={{ width: '100%', borderRadius: '0.5rem', background: '#000', maxHeight: '65vh' }}
                />
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', padding: '0.5rem 1rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Streaming while processing...</span>
                </div>
            </div>
        )}

        {status === 'ready' && (
            <video 
                ref={videoRef} 
                controls 
                style={{ width: '100%', borderRadius: '0.5rem', background: '#000', maxHeight: '65vh' }}
            />
        )}

        {status === 'error' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <AlertCircle size={48} color="var(--error-color)" />
            <p>{error}</p>
            <button className="btn-secondary" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <h2 style={{ marginBottom: '0.25rem' }}>Video ID: {id}</h2>
            <p className="text-secondary">
                {status === 'processing' ? 'Processing in progress... This may affect historical seeking.' : 'Ready for playback.'}
            </p>
        </div>
      </div>
    </div>
  );
}
