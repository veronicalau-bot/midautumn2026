import { useEffect, useRef, useState } from 'react'
import { Download, RotateCcw, Share2 } from 'lucide-react'

type ECardSectionProps = {
  language: 'zh' | 'en'
}

const eCardCopy = {
  zh: {
    kicker: '06 / SHARE THE MOON',
    title: '送上一張中秋電子賀卡',
    intro: '寫下祝福和署名，即時製作你的電子賀卡。',
    presets: '選擇祝福',
    greeting: '自訂祝福語',
    greetingPlaceholder: '寫下你的中秋祝福…',
    sender: '署名',
    senderPlaceholder: '你的名字或部門',
    preview: '電子賀卡預覽',
    reset: '重新填寫',
    download: '下載賀卡',
    share: '分享賀卡',
    shareUnavailable: '此瀏覽器不支援直接分享圖片，請先下載賀卡。',
    imageError: '賀卡圖片未能載入，請重新整理後再試。',
    downloadReady: '賀卡已下載。',
    shareReady: '分享視窗已開啟。',
    shareCancelled: '已取消分享。',
    exportError: '未能製作賀卡，請稍後再試。',
    from: '送上祝福',
    presetsList: [
      '月圓人團圓，祝你中秋快樂、身心安康。',
      '願這輪明月，照亮每一段同行的路。',
      '共賞月色，共享團圓時光。',
    ],
  },
  en: {
    kicker: '06 / SHARE THE MOON',
    title: 'Send a Mid-Autumn e-card',
    intro: 'Add a greeting and signature to create your own e-card.',
    presets: 'Choose a greeting',
    greeting: 'Custom greeting',
    greetingPlaceholder: 'Write your Mid-Autumn greeting…',
    sender: 'Signature',
    senderPlaceholder: 'Your name or department',
    preview: 'E-card preview',
    reset: 'Start again',
    download: 'Download card',
    share: 'Share card',
    shareUnavailable: 'This browser cannot share image files directly. Download the card instead.',
    imageError: 'The card artwork could not be loaded. Refresh and try again.',
    downloadReady: 'Your e-card has been downloaded.',
    shareReady: 'The share menu is open.',
    shareCancelled: 'Sharing was cancelled.',
    exportError: 'The e-card could not be created. Please try again.',
    from: 'Warm wishes from',
    presetsList: [
      'May the full moon bring you together in health and happiness.',
      'May this moonlight brighten every journey we share.',
      'Wishing you a joyful Mid-Autumn under the moonlight.',
    ],
  },
} as const

function wrapCanvasText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = []
  for (const paragraph of text.split('\n')) {
    const units = /[\u3400-\u9fff]/.test(paragraph) ? Array.from(paragraph) : paragraph.split(/(\s+)/).filter(Boolean)
    let line = ''
    for (const unit of units) {
      const candidate = `${line}${unit}`
      if (line && context.measureText(candidate).width > maxWidth) {
        lines.push(line.trim())
        line = unit.trimStart()
      } else {
        line = candidate
      }
    }
    lines.push(line.trim())
  }
  return lines.filter((line) => line.length > 0)
}

function canvasPng(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Canvas export failed')), 'image/png')
  })
}

function supportsFileSharing() {
  try {
    const probe = new File([''], 'moonlit-card.png', { type: 'image/png' })
    return typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [probe] })
  } catch {
    return false
  }
}

export function ECardSection({ language }: ECardSectionProps) {
  const t = eCardCopy[language]
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const logoRef = useRef<HTMLImageElement | null>(null)
  const [greeting, setGreeting] = useState<string>(t.presetsList[0])
  const [sender, setSender] = useState('')
  const [imageReady, setImageReady] = useState(false)
  const [canShareFiles] = useState(supportsFileSharing)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const image = new Image()
    const logo = new Image()
    const markReady = async () => {
      if (!image.complete || !image.naturalWidth || !logo.complete || !logo.naturalWidth) return
      imageRef.current = image
      logoRef.current = logo
      await document.fonts?.ready
      setImageReady(true)
    }
    image.onload = markReady
    logo.onload = markReady
    image.onerror = () => setStatus(t.imageError)
    logo.onerror = () => setStatus(t.imageError)
    image.src = '/05_15_53.png'
    logo.src = '/logo.png'
    return () => {
      image.onload = null
      image.onerror = null
      logo.onload = null
      logo.onerror = null
    }
  }, [t.imageError])

  useEffect(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    const logo = logoRef.current
    if (!canvas || !imageReady || !image || !logo) return

    const panelHeight = Math.round(image.naturalWidth * 0.27)
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight + panelHeight
    const context = canvas.getContext('2d')
    if (!context) return

    context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight)
    context.fillStyle = '#f5eddc'
    context.fillRect(0, image.naturalHeight, canvas.width, panelHeight)
    context.fillStyle = '#c84f3d'
    context.fillRect(0, image.naturalHeight, canvas.width, 10)

    const centerX = canvas.width / 2
    const maxTextWidth = canvas.width * 0.78
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = '#202b28'
    context.font = `600 48px "Noto Serif HK", serif`
    const lines = wrapCanvasText(context, greeting || t.presetsList[0], maxTextWidth).slice(0, 4)
    const lineHeight = 68
    const greetingCenter = image.naturalHeight + panelHeight * 0.42
    const firstLineY = greetingCenter - ((lines.length - 1) * lineHeight) / 2
    lines.forEach((line, index) => context.fillText(line, centerX, firstLineY + index * lineHeight))

    const logoWidth = Math.round(canvas.width * 0.22)
    const logoHeight = Math.round(logoWidth * logo.naturalHeight / logo.naturalWidth)
    const logoX = canvas.width - logoWidth - 58
    const logoY = canvas.height - logoHeight - 38
    context.drawImage(logo, logoX, logoY, logoWidth, logoHeight)

    if (sender.trim()) {
      context.fillStyle = '#2f716b'
      context.font = `500 38px "Noto Sans HK", sans-serif`
      context.textAlign = 'left'
      context.fillText(`${t.from} · ${sender.trim()}`, 64, image.naturalHeight + panelHeight * 0.82, logoX - 104)
    }
  }, [greeting, imageReady, sender, t.from, t.presetsList])

  const resetCard = () => {
    setGreeting(t.presetsList[0])
    setSender('')
    setStatus('')
  }

  const downloadCard = async () => {
    const canvas = canvasRef.current
    if (!canvas || !imageReady) return
    try {
      const blob = await canvasPng(canvas)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'moonlit-mid-autumn-card.png'
      link.click()
      URL.revokeObjectURL(url)
      setStatus(t.downloadReady)
    } catch {
      setStatus(t.exportError)
    }
  }

  const shareCard = async () => {
    const canvas = canvasRef.current
    if (!canvas || !imageReady || !canShareFiles) return
    try {
      const blob = await canvasPng(canvas)
      const file = new File([blob], 'moonlit-mid-autumn-card.png', { type: 'image/png' })
      await navigator.share({ title: t.title, text: greeting, files: [file] })
      setStatus(t.shareReady)
    } catch (error) {
      setStatus(error instanceof DOMException && error.name === 'AbortError' ? t.shareCancelled : t.exportError)
    }
  }

  return (
    <section className="section ecard-section" id="e-card">
      <div className="section-heading light">
        <p className="section-number">{t.kicker}</p>
        <h2>{t.title}</h2>
        <p>{t.intro}</p>
      </div>
      <div className="ecard-workspace">
        <div className="ecard-editor">
          <fieldset>
            <legend>{t.presets}</legend>
            <div className="ecard-presets">
              {t.presetsList.map((preset, index) => <button type="button" key={preset} aria-pressed={greeting === preset} onClick={() => { setGreeting(preset); setStatus('') }}><span>0{index + 1}</span>{preset}</button>)}
            </div>
          </fieldset>
          <label className="ecard-field" htmlFor="ecard-greeting">
            <span>{t.greeting}<small>{greeting.length} / 80</small></span>
            <textarea id="ecard-greeting" value={greeting} maxLength={80} rows={4} placeholder={t.greetingPlaceholder} onChange={(event) => { setGreeting(event.target.value); setStatus('') }} />
          </label>
          <label className="ecard-field" htmlFor="ecard-sender">
            <span>{t.sender}<small>{sender.length} / 30</small></span>
            <input id="ecard-sender" value={sender} maxLength={30} placeholder={t.senderPlaceholder} onChange={(event) => { setSender(event.target.value); setStatus('') }} />
          </label>
          <div className="ecard-actions">
            <button type="button" className="ecard-action secondary" onClick={resetCard}><RotateCcw size={17} />{t.reset}</button>
            <button type="button" className="ecard-action primary" disabled={!imageReady} onClick={downloadCard}><Download size={17} />{t.download}</button>
            <button type="button" className="ecard-action secondary" disabled={!imageReady || !canShareFiles} aria-describedby={!canShareFiles ? 'ecard-share-help' : undefined} onClick={shareCard}><Share2 size={17} />{t.share}</button>
          </div>
          {!canShareFiles && <p className="ecard-share-help" id="ecard-share-help">{t.shareUnavailable}</p>}
          <p className="ecard-status" aria-live="polite">{status}</p>
        </div>
        <div className="ecard-preview">
          <p>{t.preview}</p>
          <canvas ref={canvasRef} aria-label={t.preview}>{t.preview}</canvas>
        </div>
      </div>
    </section>
  )
}