type IconProps = React.SVGProps<SVGSVGElement>

export default function PausePrimary({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={`fill-current ${className}`}
      {...props}
    >
      <path
        d="M9 18C13.9707 18 18 13.9707 18 9C18 4.0293 13.9707 0 9 0C4.0293 0 0 4.0293 0 9C0 13.9707 4.0293 18 9 18Z"
        fill="#6B00EB"
      />
      <rect x="6" y="5" width="2" height="8" rx="1" fill="white" />
      <rect x="10" y="5" width="2" height="8" rx="1" fill="white" />
    </svg>
  )
}
