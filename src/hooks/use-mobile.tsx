import * as React from "react"
import { useHasMounted } from "./use-has-mounted"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const hasMounted = useHasMounted();
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    if (!hasMounted) return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [hasMounted])

  if (!hasMounted) return undefined;

  return !!isMobile
}
