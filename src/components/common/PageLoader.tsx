import React from 'react'

const PageLoader: React.FC = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/assets/icon/QuangVinhIconApp192.png"
          alt="Quang Vinh Mobile"
          className="h-20 w-20 rounded-xl object-contain shadow-sm ring-1 ring-border/50"
        />
        <span className="text-lg font-bold text-foreground leading-tight">Quang Vinh</span>
      </div>
    </div>
  )
}

export default PageLoader
