import { useState, useRef, useCallback } from 'react';
import { Camera, Loader2, ImageIcon } from 'lucide-react';

interface PosterUploadProps {
  posterUrl: string;
  title?: string;
  onUpload: (file: File) => Promise<void>;
  className?: string;
}

export default function PosterUpload({
  posterUrl,
  title = 'Movie',
  onUpload,
  className = '',
}: PosterUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    if (!uploading) inputRef.current?.click();
  }, [uploading]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setError(null);

      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be under 10MB');
        return;
      }

      setUploading(true);
      try {
        await onUpload(file);
      } catch {
        setError('Upload failed. Check Firebase Storage rules.');
      } finally {
        setUploading(false);
      }
      e.target.value = '';
    },
    [onUpload]
  );

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative overflow-hidden rounded-xl border border-[#222] bg-[#111] transition-all hover:border-[#E50914]/50"
        style={{ width: 180, aspectRatio: '2/3' }}
      >
        {posterUrl ? (
          <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#666]">
            <ImageIcon size={32} />
            <span className="text-xs">No poster</span>
          </div>
        )}

        {(hovered || uploading) && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
            {uploading ? (
              <Loader2 size={28} className="text-white animate-spin" />
            ) : (
              <>
                <Camera size={28} className="text-white" />
                <span className="text-white text-xs font-medium">Upload poster</span>
              </>
            )}
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      <p className="text-xs text-[#666] mt-2">JPG, PNG, WebP · max 10MB</p>
    </div>
  );
}
