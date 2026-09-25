'use client'

import { File, FileText, Loader2, Music, Upload, Video, X } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { generateUploadUrlAction } from '~/app/actions/uploads'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/cn'
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  R2_UPLOAD_EXTENSION_BY_MIME_TYPE,
  type R2UploadMimeType
} from '~/lib/constants'
import { toastErrorMessage, toastIfActionFailed } from '~/lib/toast-message'

function isAllowedMimeType(type: string): type is R2UploadMimeType {
  return type in R2_UPLOAD_EXTENSION_BY_MIME_TYPE
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }
      reject(new Error('Failed to read file'))
    }
    reader.onerror = () => {
      reject(reader.error ?? new Error('Failed to read file'))
    }
    reader.readAsDataURL(file)
  })
}

// Discriminated union so the preview renderer knows exactly what to show
// without guessing from a raw URL string.
type PreviewState =
  | { kind: 'image'; url: string }
  | { kind: 'file'; name: string; mimeType: string }
  | null

function getInitialPreview(currentUrl?: string | null): PreviewState {
  if (!currentUrl) return null
  // base64 data URLs and image paths/URLs both render as images
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
  /** Organization that owns the upload; the server checks you manage it. */
  organizationId: string
  /**
   * Called with the R2 object key (prod) or base64 data URL (dev mode) once
   * the upload finishes. Called with `null` when the user clears the value.
   */
  onClientUploadFinish: (key: string | null) => void
  /**
   * Pre-resolved URL for the current value. Pass the output of
   * `resolveImageUrl` from the parent server component so the preview renders
   * correctly for existing R2 keys.
   */
  currentUrl?: string | null
  className?: string
  /** Passed to next/image `sizes`. It should match the rendered widget width. */
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
      toastErrorMessage(`Choose a file under ${MAX_FILE_SIZE_MB} MB.`)
      return
    }

    if (!isAllowedMimeType(file.type)) {
      toastErrorMessage('Choose a JPEG, PNG, WebP, or GIF image.')
      return
    }

    setIsUploading(true)

    // Set the preview from the file type without a network round trip.
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

    if (toastIfActionFailed(result)) {
      setPreview(getInitialPreview(currentUrl))
      setIsUploading(false)
      return
    }
    if (!result?.data) {
      toastErrorMessage('The upload could not start. Try again.')
      setPreview(getInitialPreview(currentUrl))
      setIsUploading(false)
      return
    }

    const { data } = result

    try {
      if (data.mode === 'r2') {
        const res = await fetch(data.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type }
        })
        if (!res.ok) throw new Error(`R2 upload failed: ${res.status}`)
        onClientUploadFinish(data.key)
      } else {
        // Development mode has no R2 credentials, so store base64 data directly.
        // Await the read so isUploading stays true until onClientUploadFinish runs.
        const base64 = await readFileAsDataUrl(file)
        if (file.type.startsWith('image/')) {
          setPreview({ kind: 'image', url: base64 })
        }
        onClientUploadFinish(base64)
      }
    } catch {
      toastErrorMessage(
        data.mode === 'r2'
          ? 'The upload failed. Check your connection and try again.'
          : 'The file could not be read. Choose it again.'
      )
      setPreview(getInitialPreview(currentUrl))
    } finally {
      setIsUploading(false)
    }
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
              Max {MAX_FILE_SIZE_MB} MB
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
          aria-label="Remove file"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
