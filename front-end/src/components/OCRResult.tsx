 import { useEffect, useState, type ChangeEvent } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, FileText, ImageIcon, Send, CheckCircle } from 'lucide-react'
import { submitResult } from '@/utils/api'
import { computeMbtiScore } from '@/utils/scoring'
import { extractMbti } from '@/utils/extract'

interface OCRResultProps {
  ocrText: string;
  imageDataUrl?: string | null;
}

export default function OCRResult({ ocrText, imageDataUrl }: OCRResultProps) {
  
  const [editedText, setEditedText] = useState(ocrText)
  const [copied, setCopied] = useState(false)
  const [name, setName] = useState('')
  const [mbti, setMbti] = useState('')
  const [score, setScore] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState<string | null>(null)
  const [submitErr, setSubmitErr] = useState<string | null>(null)

  // Compute initial score from OCR text
  useEffect(() => {
    setScore(computeMbtiScore(editedText))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recompute score when user edits the text
  useEffect(() => {
    setScore(computeMbtiScore(editedText))
  }, [editedText])

  // Auto-extract MBTI type from OCR text when available
  useEffect(() => {
    const found = extractMbti(editedText)
    if (found) setMbti(found)
  }, [editedText])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([editedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mbti-ocr-result.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSubmitToSheets = async () => {
    setSubmitMsg(null)
    setSubmitErr(null)
    try {
      if (!name) {
        setSubmitErr('Please enter Name')
        return
      }
      if (!imageDataUrl) {
        setSubmitErr('No image available to submit')
        return
      }

      // Extract base64 part from data URL
      const imageBase64 = imageDataUrl.includes(',') ? imageDataUrl.split(',')[1] : imageDataUrl

      setSubmitting(true)
      const mbtiToSend = mbti || extractMbti(editedText) || 'UNKNOWN'
      const res = await submitResult({ name, mbti: mbtiToSend, score: Number(score) || 0, imageBase64 })

      if (res?.ok) {
        setSubmitMsg('Saved to Google Sheets successfully')
      } else if (res?.duplicate) {
        setSubmitErr('Duplicate submission detected')
      } else {
        setSubmitErr('Unexpected response from server')
      }
    } catch (err: any) {
      if (err?.status === 409) {
        setSubmitErr('Duplicate submission detected')
      } else {
        setSubmitErr(err?.message || 'Failed to submit to Google Sheets')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              OCR Results
            </CardTitle>
            <CardDescription>
              Review and edit the extracted text before submitting
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Processing Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Text Results
            </TabsTrigger>
            <TabsTrigger value="original" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Original Image
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="results" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input
                  className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">MBTI (auto)</label>
                <div className="w-full h-9 rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-sm flex items-center">
                  {mbti || '—'}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Score (auto)</label>
                <div className="w-full h-9 rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-sm flex items-center">
                  {score}%
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Extracted Text (Editable)
              </label>
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                placeholder="OCR results will appear here..."
              />
              <p className="text-xs text-gray-500">
                {editedText.length} characters • You can edit the text above if needed
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleCopy} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                {copied ? 'Copied!' : 'Copy Text'}
              </Button>
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleSubmitToSheets} disabled={submitting} className="bg-green-600 hover:bg-green-700 disabled:opacity-60">
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit to Google Sheets'}
              </Button>
            </div>

            {submitMsg && (
              <p className="text-sm text-green-700">{submitMsg}</p>
            )}
            {submitErr && (
              <p className="text-sm text-red-700">{submitErr}</p>
            )}
          </TabsContent>
          
          <TabsContent value="original">
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border">
                <img
                  src={imageDataUrl || "/placeholder.svg?height=384&width=600&query=original MBTI answer sheet"}
                  alt="Original uploaded image"
                  className="w-full h-auto max-h-96 object-contain bg-gray-50"
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Original uploaded image for reference
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
