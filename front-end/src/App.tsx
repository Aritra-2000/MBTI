import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Brain, FileText, Upload, Zap } from 'lucide-react'
import ImageUpload from './components/Image-Upload.tsx'
import OCRResult from './components/OCRResult.tsx'
import { ocrImageFromFile } from './utils/ocrProcessor.js'

export default function App() {
  const [ocrText, setOcrText] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handleImageSelected = async ({ file, dataUrl }: { file: File; dataUrl: string | null }) => {
    setError(null)
    setOcrText('')
    setImageDataUrl(dataUrl)
    setProcessing(true)
    
    try {
      const text = await ocrImageFromFile(file)
      setOcrText(text)
    } catch (e: any) {
      setError(e.message || 'OCR processing failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MBTI Test OCR
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your MBTI answer sheets into digital data instantly. Upload a photo and let our AI-powered OCR technology do the rest.
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Fast Processing
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              High Accuracy
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Upload className="h-3 w-3" />
              Easy Upload
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Upload Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                Upload Answer Sheet
              </CardTitle>
              <CardDescription>
                Select a clear photo of your MBTI test answer sheet for processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload onImageSelected={handleImageSelected} />
            </CardContent>
          </Card>

          {/* Processing State */}
          {processing && (
            <Card className="shadow-lg border-0 bg-blue-50/80 backdrop-blur-sm border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-blue-700 font-medium">Processing your image with OCR technology...</span>
                </div>
                <div className="mt-4 bg-blue-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full animate-pulse w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm">
              <AlertDescription className="text-red-700">
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Results Section */}
          {imageDataUrl && !processing && (
            <>
              <Separator className="my-6" />
              <OCRResult ocrText={ocrText} imageDataUrl={imageDataUrl} />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Powered by advanced OCR technology • Secure and private processing</p>
        </div>
      </div>
    </div>
  )
}
