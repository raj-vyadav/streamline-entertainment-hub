import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, Image, Film } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  accept: string;
  label: string;
  folder: string;
  icon?: "image" | "video";
}

const FileUpload = ({ value, onChange, accept, label, folder, icon = "image" }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 50MB limit for videos, 5MB for images
    const maxSize = icon === "video" ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Max ${icon === "video" ? "50MB" : "5MB"}.`);
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("content-media")
      .upload(fileName, file, { upsert: true });

    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("content-media")
      .getPublicUrl(fileName);

    onChange(urlData.publicUrl);
    setUploading(false);
    toast.success("File uploaded!");
  };

  const handleClear = () => {
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const Icon = icon === "video" ? Film : Image;

  return (
    <div className="space-y-2">
      <label className="text-sm text-muted-foreground">{label}</label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL or upload a file..."
          className="flex-1"
        />
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="icon" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {value && icon === "image" && (
        <div className="mt-2 rounded-lg overflow-hidden border border-border w-32 h-20">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
      {value && icon === "video" && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Icon className="h-3 w-3" /> Video URL set
        </p>
      )}
    </div>
  );
};

export default FileUpload;
