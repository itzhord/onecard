'use client'

import { useState, useEffect, useRef } from 'react'
import { Download, Share2, Copy, Check, X } from 'lucide-react'

// QR Code Generator Component
export default function QRCodeGenerator({ 
  profileUrl, 
  username, 
  size = 256, 
  includeText = true,
  style = 'modern' // 'modern', 'classic', 'minimal'
}) {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    generateQRCode()
  }, [profileUrl, size, style])

  const generateQRCode = async () => {
    try {
      setLoading(true)
      
      // Import QR code library dynamically
      const QRCode = (await import('qrcode')).default
      
      const qrOptions = {
        width: size,
        margin: 2,
        color: getQRColors(),
        errorCorrectionLevel: 'M'
      }
      
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(profileUrl, qrOptions)
      
      // Create enhanced QR code with branding
      if (style !== 'minimal') {
        const enhancedQR = await createEnhancedQRCode(qrDataUrl)
        setQrCodeUrl(enhancedQR)
      } else {
        setQrCodeUrl(qrDataUrl)
      }
      
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  const getQRColors = () => {
    const colorSchemes = {
      modern: {
        dark: '#1E90FF', // Accent blue
        light: '#FFFFFF'
      },
      classic: {
        dark: '#0A0E27', // Primary dark
        light: '#FFFFFF'
      },
      minimal: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }
    
    return colorSchemes[style] || colorSchemes.modern
  }

  const createEnhancedQRCode = async (qrDataUrl) => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      // Set canvas size
      canvas.width = size + 80 // Add space for branding
      canvas.height = size + (includeText ? 140 : 80)
      
      // Background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Load and draw QR code
      const img = new Image()
      img.onload = () => {
        // Draw QR code centered
        const qrX = (canvas.width - size) / 2
        const qrY = 40
        ctx.drawImage(img, qrX, qrY, size, size)
        
        // Add 1necard branding
        ctx.fillStyle = getQRColors().dark
        ctx.font = 'bold 16px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Onecard', canvas.width / 2, 25)
        
        if (includeText && username) {
          // Add username/text below QR
          ctx.font = '14px Inter, sans-serif'
          ctx.fillStyle = '#666666'
          ctx.fillText(`Scan to connect with ${username}`, canvas.width / 2, size + 70)
          
          // Add instructions
          ctx.font = '12px Inter, sans-serif'
          ctx.fillStyle = '#999999'
          ctx.fillText('Point your camera at this code', canvas.width / 2, size + 95)
        }
        
        // Add decorative elements for modern style
        if (style === 'modern') {
          // Add corner accents
          ctx.fillStyle = getQRColors().dark
          const cornerSize = 20
          // Top left
          ctx.fillRect(qrX - 10, qrY - 10, cornerSize, 4)
          ctx.fillRect(qrX - 10, qrY - 10, 4, cornerSize)
          // Top right
          ctx.fillRect(qrX + size - 10, qrY - 10, cornerSize, 4)
          ctx.fillRect(qrX + size + 6, qrY - 10, 4, cornerSize)
          // Bottom left
          ctx.fillRect(qrX - 10, qrY + size + 6, cornerSize, 4)
          ctx.fillRect(qrX - 10, qrY + size - 10, 4, cornerSize)
          // Bottom right
          ctx.fillRect(qrX + size - 10, qrY + size + 6, cornerSize, 4)
          ctx.fillRect(qrX + size + 6, qrY + size - 10, 4, cornerSize)
        }
        
        resolve(canvas.toDataURL('image/png'))
      }
      img.src = qrDataUrl
    })
  }

  const downloadQRCode = () => {
    const link = document.createElement('a')
    link.download = `${username || 'profile'}_qr_code.png`
    link.href = qrCodeUrl
    link.click()
  }

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        // Convert data URL to blob for sharing
        const response = await fetch(qrCodeUrl)
        const blob = await response.blob()
        const file = new File([blob], `${username}_qr_code.png`, { type: 'image/png' })
        
        await navigator.share({
          title: `${username}'s Onecard QR Code`,
          text: 'Scan this QR code to connect with me!',
          files: [file]
        })
      } catch (error) {
        console.error('Error sharing QR code:', error)
        // Fallback to copying URL
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-8">
        <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 text-center max-w-sm mx-auto">
      {/* QR Code Display */}
      <div className="mb-4 sm:mb-6">
        {qrCodeUrl ? (
          <div className="relative inline-block">
            <img 
              src={qrCodeUrl} 
              alt="QR Code"
              className="mx-auto rounded-lg shadow-md max-w-full h-auto"
              style={{ maxWidth: '100%' }}
            />
          </div>
        ) : (
          <div 
            className="bg-gray-100 rounded-lg flex items-center justify-center mx-auto"
            style={{ width: Math.min(size, 280), height: Math.min(size, 280) }}
          >
            <span className="text-gray-500 text-sm">QR Code</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-3">
        <button
          onClick={downloadQRCode}
          className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium"
          disabled={!qrCodeUrl}
        >
          <Download className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Download</span>
          <span className="sm:hidden">Download QR</span>
        </button>
        
        <button
          onClick={shareQRCode}
          className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm font-medium"
          disabled={!qrCodeUrl}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </button>
        
        <button
          onClick={copyToClipboard}
          className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm font-medium"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Copy URL</span>
              <span className="sm:hidden">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Hidden canvas for enhanced QR generation */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={size + 80}
        height={size + 140}
      />
    </div>
  )
}

// QR Code Modal Component
export function QRCodeModal({ isOpen, onClose, profileUrl, username }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-sm sm:max-w-md w-full mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your QR Code</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <QRCodeGenerator 
          profileUrl={profileUrl}
          username={username}
          size={Math.min(280, window.innerWidth - 120)} // Responsive size
          includeText={true}
          style="modern"
        />
        
        <div className="mt-4 sm:mt-6 text-center px-2">
          <p className="text-sm text-gray-600 mb-2">
            Anyone can scan this code to view your profile
          </p>
          <p className="text-xs text-gray-500">
            No app required • Works with any camera
          </p>
        </div>
      </div>
    </div>
  )
}

// Bulk QR Code Generator for printing
export function BulkQRGenerator({ profiles, onComplete }) {
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  const generateBulkQRCodes = async () => {
    setGenerating(true)
    setProgress(0)

    try {
      const QRCode = (await import('qrcode')).default
      const JSZip = (await import('jszip')).default
      
      const zip = new JSZip()
      
      for (let i = 0; i < profiles.length; i++) {
        const profile = profiles[i]
        const qrDataUrl = await QRCode.toDataURL(profile.url, {
          width: 512,
          margin: 2,
          color: {
            dark: '#0A0E27',
            light: '#FFFFFF'
          }
        })
        
        // Convert data URL to blob
        const response = await fetch(qrDataUrl)
        const blob = await response.blob()
        
        zip.file(`${profile.username}_qr_code.png`, blob)
        setProgress(((i + 1) / profiles.length) * 100)
      }
      
      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      
      // Download zip file
      const link = document.createElement('a')
      link.href = URL.createObjectURL(zipBlob)
      link.download = 'qr_codes_bulk.zip'
      link.click()
      
      onComplete?.()
    } catch (error) {
      console.error('Error generating bulk QR codes:', error)
    } finally {
      setGenerating(false)
      setProgress(0)
    }
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Bulk QR Code Generator</h3>
      
      {generating ? (
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
          <p className="text-gray-600 mb-2 text-sm sm:text-base">Generating QR codes...</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">{Math.round(progress)}% complete</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
            Generate QR codes for {profiles.length} profile{profiles.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={generateBulkQRCodes}
            className="bg-blue-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
          >
            Generate & Download All
          </button>
        </div>
      )}
    </div>
  )
}