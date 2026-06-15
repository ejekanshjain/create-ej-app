'use client'

import { File, FileText, Loader2, Music, Upload, Video, X } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { generateUploadUrlAction } from '~/actions/uploads'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/cn'
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '~/lib/constants'

type PreviewState =
  | { kind: 'image'; url: string }
  | { kind: 'file'; name: string; mimeType: string }
  | null

function getInitialPreview(currentUrl?: string | null): PreviewState {
  if (!currentUrl) return null
  return { kind: 'image', url: currentUrl }
}

function FileTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('video/'))
    return <Video className="text-muted-foreground h-8 w-8" />
  if (mimeType.startsWith('audio/'))
    return <Music className="text-muted-foreground h-8 w-8" />
  if (mimeType === 'application/pdf' || mimeType.includes('text'))
    return <FileText className="text-muted-foreground h-8 w-8" />
  return <File className="text-muted-foreground h-8 w-8" />
}

type Props = {
  /** MIME type filter passed to the file input, e.g. `"image/*"` or `"image/*,application/pdf"`. */
  accept: string
  /** Scopes the upload to a organization for cleanup tracking. */
  organizationId: string
  /**
   * Called with the R2 object key (prod) or base64 data URL (dev mode) once
   * the upload finishes. Called with `null` when the user clears the value.
   */
  onClientUploadFinish: (key: string | null) => void
  /**
   * Pre-resolved URL for the current value - pass the output of
   * `resolveImageUrl` from the parent server component so the preview renders
   * correctly for existing R2 keys.
   */
  currentUrl?: string | null
  className?: string
  /** Passed to next/image `sizes` - should match the rendered widget width. */
  sizes?: string
}

export function FileUpload({
  accept,
  organizationId,
  onClientUploadFinish,
  currentUrl,
  className,
  sizes = '128px'
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<PreviewState>(
    getInitialPreview(currentUrl)
  )
  const [isUploading, setIsUploading] = useState(false)

  const handleFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File must be under ${MAX_FILE_SIZE_MB}MB`)
      return
    }

    setIsUploading(true)

    if (file.type.startsWith('image/')) {
      setPreview({ kind: 'image', url: URL.createObjectURL(file) })
    } else {
      setPreview({ kind: 'file', name: file.name, mimeType: file.type })
    }

    const result = await generateUploadUrlAction({
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      organizationId
    })

    if (!result?.data) {
      toast.error('Failed to prepare upload. Please try again.')
      setPreview(getInitialPreview(currentUrl))
      setIsUploading(false)
      return
    }

    const { data } = result

    if (data.mode === 'r2') {
      try {
        const res = await fetch(data.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type }
        })
        if (!res.ok) throw new Error(`R2 upload failed: ${res.status}`)
        onClientUploadFinish(data.key)
      } catch {
        toast.error('Upload failed. Please try again.')
        setPreview(getInitialPreview(currentUrl))
      }
    } else {
      const reader = new FileReader()
      reader.onload = e => {
        const base64 = e.target?.result as string
        if (file.type.startsWith('image/')) {
          setPreview({ kind: 'image', url: base64 })
        }
        onClientUploadFinish(base64)
      }
      reader.onerror = () => {
        toast.error('Failed to read file. Please try again.')
        setPreview(getInitialPreview(currentUrl))
      }
      reader.readAsDataURL(file)
    }

    setIsUploading(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    onClientUploadFinish(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      <button
        type="button"
        onClick={() => !isUploading && inputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          'border-border bg-muted/30 hover:bg-muted/50 relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors',
          isUploading && 'cursor-not-allowed'
        )}
      >
        {preview?.kind === 'image' && (
          <Image
            src={preview.url}
            alt="Upload preview"
            fill
            sizes={sizes}
            className="object-contain"
            unoptimized={
              preview.url.startsWith('data:') || preview.url.startsWith('blob:')
            }
          />
        )}

        {preview?.kind === 'file' && (
          <div className="flex flex-col items-center gap-2 px-4">
            <FileTypeIcon mimeType={preview.mimeType} />
            <span className="text-muted-foreground max-w-full truncate text-xs">
              {preview.name}
            </span>
          </div>
        )}

        {!preview && (
          <div className="flex flex-col items-center gap-2">
            <div className="bg-muted rounded-md p-2">
              <Upload className="text-muted-foreground h-5 w-5" />
            </div>
            <span className="text-muted-foreground text-xs font-medium">
              Click to upload
            </span>
            <span className="text-muted-foreground/60 text-[11px]">
              Max {MAX_FILE_SIZE_MB}MB
            </span>
          </div>
        )}

        {isUploading && (
          <div className="bg-background/70 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        )}
      </button>

      {preview && !isUploading && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-sm"
          onClick={handleClear}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
