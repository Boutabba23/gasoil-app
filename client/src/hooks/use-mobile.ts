// client/src/hooks/use-mobile.ts
import { useEffect, useState } from "react"

// Define the type for the hook, indicating it returns a boolean
export function useIsMobile(query: string = "(max-width: 768px)"): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    // Update an unmounted component.
    let isMounted = true

    // Set initial state
    if (isMounted) {
      setIsMobile(mediaQuery.matches)
    }
    
    const handleResize = () => {
      if (isMounted) {
        setIsMobile(mediaQuery.matches)
      }
    }

    // Add listener for screen size changes
    // Deprecated 'addListener' for older browser compatibility if needed, but 'addEventListener' is standard
    try {
        mediaQuery.addEventListener("change", handleResize)
    } catch (e) { // Fallback for older browsers like Safari < 14
        mediaQuery.addListener(handleResize)
    }


    // Clean up listener on unmount
    return () => {
      isMounted = false
      try {
        mediaQuery.removeEventListener("change", handleResize)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {  // Fallback for older browsers
        mediaQuery.removeListener(handleResize)
      }

    }
  }, [query]) // Re-run effect if the query string changes

  return isMobile
}