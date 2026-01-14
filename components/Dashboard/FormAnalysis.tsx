
import React, { useState, useRef, useEffect } from 'react';
import { analyzeFormVideo } from '../../services/geminiService';
import MarkdownText from '../MarkdownText';

interface FormAnalysisProps {
  onBack: () => void;
}

const FormAnalysis: React.FC<FormAnalysisProps> = ({ onBack }) => {
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'result'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mode, setMode] = useState<'record' | 'upload' | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'record' && status === 'idle') {
      startCamera();
    }
    return () => stopCamera();
  }, [mode, status]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      setMode(null);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please upload a valid video file.');
      return;
    }

    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setStatus('processing');

    try {
      const base64 = await blobToBase64(file);
      const feedback = await analyzeFormVideo(base64, file.type);
      setAnalysis(feedback);
      setStatus('result');
    } catch (err) {
      console.error(err);
      setStatus('idle');
      setMode(null);
    }
  };

  const startRecording = () => {
    chunksRef.current = [];
    const stream = videoRef.current?.srcObject as MediaStream;
    if (!stream) return;

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = processRecording;
    
    mediaRecorderRef.current = recorder;
    recorder.start();
    
    setStatus('recording');
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.readAsDataURL(blob);
    });
  };

  const processRecording = async () => {
    const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
    const url = URL.createObjectURL(videoBlob);
    setVideoUrl(url);
    setStatus('processing');

    try {
      const base64 = await blobToBase64(videoBlob);
      const feedback = await analyzeFormVideo(base64, 'video/webm');
      setAnalysis(feedback);
      setStatus('result');
    } catch (err) {
      console.error(err);
      setStatus('idle');
      setMode(null);
    }
  };

  const reset = () => {
    setStatus('idle');
    setMode(null);
    setAnalysis(null);
    setVideoUrl(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-off-white dark:bg-dark-bg overflow-hidden transition-colors">
      <header className="px-6 py-4 flex items-center gap-4 bg-white dark:bg-dark-surface border-b border-soft-gray dark:border-dark-border flex-shrink-0 z-20">
        <button 
          onClick={mode ? reset : onBack}
          className="w-9 h-9 rounded-full bg-white dark:bg-dark-bg border border-soft-gray dark:border-dark-border flex items-center justify-center text-muted-text dark:text-dark-text-muted hover:text-deep-charcoal dark:hover:text-white transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">{mode ? 'close' : 'arrow_back'}</span>
        </button>
        <h1 className="text-lg font-extrabold text-deep-charcoal dark:text-white tracking-tight">Form Analysis</h1>
      </header>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {status === 'idle' && !mode && (
          <div className="flex-1 flex flex-col p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 no-scrollbar overflow-y-auto">
            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-600/20 mb-2">
              <span className="material-symbols-outlined text-4xl mb-4">analytics</span>
              <h2 className="text-2xl font-black mb-2">Analyze Your Stroke</h2>
              <p className="text-sm opacity-90 leading-relaxed font-medium">Capture your form or upload a clip for a professional AI technical critique.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => setMode('record')}
                className="group bg-white dark:bg-dark-surface p-6 rounded-[2rem] border border-soft-gray dark:border-dark-border flex items-center gap-5 hover:border-indigo-500 transition-all text-left shadow-sm"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl">videocam</span>
                </div>
                <div>
                  <div className="font-bold text-deep-charcoal dark:text-white">Record Live</div>
                  <div className="text-[10px] text-muted-text dark:text-dark-text-muted uppercase tracking-wider font-bold">From Camera</div>
                </div>
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="group bg-white dark:bg-dark-surface p-6 rounded-[2rem] border border-soft-gray dark:border-dark-border flex items-center gap-5 hover:border-indigo-500 transition-all text-left shadow-sm"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl">upload_file</span>
                </div>
                <div>
                  <div className="font-bold text-deep-charcoal dark:text-white">Upload Video</div>
                  <div className="text-[10px] text-muted-text dark:text-dark-text-muted uppercase tracking-wider font-bold">From Gallery</div>
                </div>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="video/*" 
                onChange={handleFileUpload}
              />
            </div>

            <div className="bg-white/50 dark:bg-dark-surface/50 p-6 rounded-[2rem] border border-dashed border-soft-gray dark:border-dark-border">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-text dark:text-dark-text-muted mb-3">Coach's Tips</h3>
              <ul className="space-y-2">
                {['Use a tripod if possible', 'Film from table-level', 'Ensure good lighting'].map((tip, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-medium text-muted-text dark:text-dark-text-muted">
                    <span className="material-symbols-outlined text-indigo-400 text-sm">check_circle</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {mode === 'record' && (status === 'idle' || status === 'recording') && (
          <div className="flex-1 relative overflow-hidden bg-black animate-in fade-in">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover opacity-80"
            />
            
            <div className="absolute inset-0 border-[24px] border-black/10 pointer-events-none flex items-center justify-center">
               <div className="w-full h-1/2 border border-white/20 rounded-lg flex items-center justify-center">
                  <div className="w-1/2 h-px bg-white/20"></div>
               </div>
            </div>

            <div className="absolute top-8 left-0 right-0 text-center pointer-events-none">
              <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full inline-flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest border border-white/10">
                <span className={`w-2 h-2 rounded-full ${status === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                {status === 'recording' ? `Recording: ${recordingTime}s` : 'Coach Viewfinder'}
              </div>
            </div>

            <div className="absolute bottom-12 left-0 right-0 flex justify-center px-8">
              {status === 'idle' ? (
                <button 
                  onClick={startRecording}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform group"
                >
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500 flex items-center justify-center">
                    <div className="w-12 h-12 bg-indigo-500 rounded-full group-hover:scale-110 transition-transform"></div>
                  </div>
                </button>
              ) : (
                <button 
                  onClick={stopRecording}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform group"
                >
                  <div className="w-16 h-16 rounded-full border-4 border-red-500 flex items-center justify-center">
                    <div className="w-8 h-8 bg-red-500 rounded-md"></div>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {status === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center bg-indigo-900 p-10 text-center space-y-8 animate-in fade-in duration-500">
             <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white/10 border-t-indigo-400 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="material-symbols-outlined text-4xl text-white animate-pulse">psychology</span>
                </div>
             </div>
             <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Analyzing Your Stroke</h2>
                <p className="text-indigo-200 text-sm font-medium opacity-80 max-w-xs mx-auto">Gemini is processing your video frames to detect stance deviations and stroke consistency...</p>
             </div>
             <div className="w-full bg-white/5 h-2 rounded-full max-w-xs overflow-hidden">
                <div className="h-full bg-indigo-400 animate-progress"></div>
             </div>
          </div>
        )}

        {status === 'result' && analysis && (
          <div className="flex-1 flex flex-col bg-off-white dark:bg-dark-bg overflow-y-auto animate-in slide-in-from-bottom-8 duration-700 no-scrollbar">
             <div className="aspect-video w-full bg-black flex-shrink-0">
                <video src={videoUrl!} controls className="w-full h-full object-contain" />
             </div>
             
             <div className="p-6 pb-20 space-y-8">
                <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-600/20">
                   <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-sm">auto_awesome</span>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">AI Performance Report</span>
                   </div>
                   <h2 className="text-2xl font-black mb-2">Coach's Feedback</h2>
                   <p className="text-indigo-100 text-xs font-medium opacity-90 leading-relaxed">Based on your recent technique analysis.</p>
                </div>

                <div className="bg-white dark:bg-dark-surface p-8 rounded-[2.5rem] border border-soft-gray dark:border-dark-border shadow-sm">
                   <MarkdownText content={analysis} />
                </div>

                <button 
                  onClick={reset}
                  className="btn-primary !bg-indigo-600 !rounded-[2rem] flex items-center justify-center gap-2 !text-white"
                >
                  <span className="material-symbols-outlined">refresh</span>
                  Analyze New Clip
                </button>
             </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default FormAnalysis;
