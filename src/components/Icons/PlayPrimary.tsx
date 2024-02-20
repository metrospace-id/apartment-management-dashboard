type IconProps = React.SVGProps<SVGSVGElement>

export default function PlayPrimary({ className, ...props }: IconProps) {
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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.49999 4.66999C6.80939 4.49135 7.19059 4.49135 7.49999 4.66998L10.5 6.40198L13.5 8.13398C13.8094 8.31261 14 8.64274 14 9.00001C14 9.35728 13.8094 9.68741 13.5 9.86604L7.49999 13.33C7.19059 13.5087 6.80939 13.5087 6.49999 13.33C6.1906 13.1514 6 12.8213 6 12.464V5.53601C6 5.17875 6.1906 4.84862 6.49999 4.66999Z"
        fill="white"
      />
    </svg>
  )
}
