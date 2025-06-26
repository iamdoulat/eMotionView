import Link from 'next/link';
import { Button } from '@/components/ui/button';

const WireCutAnimation = () => (
  <svg
    width="150"
    height="100"
    viewBox="0 0 150 100"
    className="mx-auto mb-4 text-destructive"
  >
    <style>
      {`
        .spark {
          animation: spark-animation 0.8s infinite ease-in-out;
          transform-origin: center;
        }
        .wire-left {
            animation: wire-left-animation 1.5s ease-in-out infinite alternate;
        }
        .wire-right {
            animation: wire-right-animation 1.5s ease-in-out infinite alternate;
        }
        @keyframes spark-animation {
          0%, 100% { transform: scale(0.9); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes wire-left-animation {
            from { transform: translate(0, 0) rotate(0); }
            to { transform: translate(-2px, 1px) rotate(-1deg); }
        }
        @keyframes wire-right-animation {
            from { transform: translate(0, 0) rotate(0); }
            to { transform: translate(2px, -1px) rotate(1deg); }
        }
      `}
    </style>
    {/* The cut wire */}
    <path
      d="M10 50 Q 40 40, 68 50"
      stroke="hsl(var(--muted-foreground))"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      className="wire-left"
    />
    <path
      d="M82 50 Q 110 60, 140 50"
      stroke="hsl(var(--muted-foreground))"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      className="wire-right"
    />
    
    {/* The spark */}
    <g className="spark" transform="translate(75, 50)">
        <path d="M-5 -7 L 0 0 L -5 7" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M5 -7 L 0 0 L 5 7" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M-7 0 L 7 0" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  </svg>
);


export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] text-center px-4 py-12 bg-background">
      <WireCutAnimation />
      <h1 className="text-6xl md:text-9xl font-extrabold text-primary tracking-tighter">
        404
      </h1>
      <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-foreground">
        Connection Lost
      </h2>
      <p className="mt-4 max-w-md text-muted-foreground">
        The page you are looking for might have been moved, deleted, or the link is broken.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/">
          Return to Homepage
        </Link>
      </Button>
    </div>
  );
}
