'use client'

export function TrackClick({
  eventName,
  props,
  children,
}: {
  eventName: string
  props?: Record<string, string>
  children: React.ReactNode
}) {
  function handleClick() {
    if (typeof window !== 'undefined' && (window as { plausible?: (e: string, o: { props?: Record<string, string> }) => void }).plausible) {
      (window as { plausible?: (e: string, o: { props?: Record<string, string> }) => void }).plausible!(eventName, { props })
    }
  }
  return <span onClick={handleClick}>{children}</span>
}
