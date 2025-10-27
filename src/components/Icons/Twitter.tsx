type IconProps = React.SVGProps<SVGSVGElement>

export default function Twitter({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={`fill-current ${className}`}
      {...props}
    >
      <path
        d="M18.3259 2H21.6992L14.3293 10.4728L23 22H16.2112L10.8945 15.0079L4.80967 22H1.4345L9.31783 12.9372L1 2.00092H7.96117L12.7673 8.39192L18.3259 2ZM17.1425 19.9699H19.0116L6.9455 3.92412H4.93983L17.1425 19.9699Z"
        fill="#79777F"
        className="fill-inherit"
      />
    </svg>
  )
}
