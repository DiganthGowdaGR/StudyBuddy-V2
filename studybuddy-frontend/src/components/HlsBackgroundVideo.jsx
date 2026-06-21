import React, { useEffect, useRef } from 'react'
import Hls from 'hls.js'

export default function HlsBackgroundVideo({
  src,
  className,
  poster,
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
  preload = 'metadata',
  ...rest
}) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return undefined

    let hls

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      })
      hls.loadSource(src)
      hls.attachMedia(video)
    } else {
      video.src = src
    }

    return () => {
      if (hls) {
        hls.destroy()
      }
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload={preload}
      poster={poster}
      {...rest}
    />
  )
}
