import { useState, useRef, useCallback } from 'react';
import { Camera, Loader2 } from 'lucide-react';

interface AvatarUploadProps {
  photoURL?: string;
  displayName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onUpload?: (file: File) => void;
}

const sizeMap = { sm: 32, md: 48, lg: 80, xl: 120 };
const fontMap = { sm: 12, md: 18, lg: 28, xl: 42 };

export default function AvatarUpload({
  photoURL,
  displayName = '?',
  size = 'md',
  editable = false,
  onUpload,
}: AvatarUploadProps) {
  const [hovered, setHovered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const px = sizeMap[size];
  const fontSize = fontMap[size];
  const initial = (displayName || '?')[0].toUpperCase();

  const handleClick = useCallback(() => {
    if (editable && !uploading) inputRef.current?.click();
  }, [editable, uploading]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }
    if (onUpload) {
      setUploading(true);
      onUpload(file);
      setTimeout(() => setUploading(false), 2000);
    }
    e.target.value = '';
  }, [onUpload]);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative rounded-full overflow-hidden flex items-center justify-center"
        style={{
          width: px,
          height: px,
          background: photoURL
            ? 'transparent'
            : 'linear-gradient(135deg, #E50914 0%, #8B0000 100%)',
          cursor: editable ? 'pointer' : 'default',
          border: '2px solid #E50914',
          flexShrink: 0,
        }}
      >
        {photoURL ? (
          <img
            src={photoURL}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white font-bold" style={{ fontSize }}>{initial}</span>
        )}

        {editable && hovered && !uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity">
            <Camera size={px / 3} className="text-white" />
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 size={px / 3} className="text-white animate-spin" />
          </div>
        )}
      </button>

      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
