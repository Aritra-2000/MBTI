import { useCallback, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, ImageIcon, X } from 'lucide-react'

interface ImageUploadProps {
  onImageSelected: (data: { file: File; dataUrl: string | null }) => void;
}

export default function ImageUpload({ onImageSelected }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | ArrayBuffer | null>(null)


  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file: File = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const dataUrl: string | null = e.target && 'result' in e.target ? (e.target.result as string | null) : null;
      setPreview(dataUrl);
      onImageSelected({ file, dataUrl });
    };
    reader.readAsDataURL(file);
  }, [onImageSelected]);

  interface DragEventWithFiles extends React.DragEvent<HTMLDivElement> {
    dataTransfer: DataTransfer;
  }

  const handleDrag = useCallback((e: DragEventWithFiles) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  interface DropEvent extends React.DragEvent<HTMLDivElement> {
    dataTransfer: DataTransfer;
  }

  const handleDrop = useCallback((e: DropEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  interface ChangeEventWithFiles extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & { files: FileList | null };
  }

  const handleChange = useCallback((e: ChangeEventWithFiles) => {
    handleFiles(e.target.files)
  }, [handleFiles])

  const clearPreview = () => {
    setPreview(null)
  }

  return (
    <div className="space-y-4">
      {!preview ? (
        <Card
          className={`border-2 border-dashed transition-all duration-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="p-4 bg-blue-100 rounded-full mb-4">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Upload your answer sheet
            </h3>
            <p className="text-gray-500 text-center mb-4 max-w-sm">
              Drag and drop your image here, or click to browse files
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Choose Image
                </span>
              </Button>
            </label>
            <p className="text-xs text-gray-400 mt-2">
              Supports JPG, PNG, GIF up to 10MB
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={typeof preview === 'string' ? preview : "/placeholder.svg?height=256&width=400&query=uploaded image preview"}
                alt="Preview"
                className="w-full h-64 object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={clearPreview}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 bg-green-50 border-t border-green-200">
              <p className="text-green-700 text-sm font-medium">
                ✓ Image uploaded successfully
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
