export function LoadingSpinner({ size = 24, color = '#D4A853' }: { size?: number; color?: string }) {
  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate"
            from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
        </path>
      </svg>
    </div>
  );
}
