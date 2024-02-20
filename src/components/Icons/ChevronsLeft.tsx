type IconProps = React.SVGProps<SVGSVGElement>

export default function ChevronsLeft({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={`fill-current ${className}`}
      {...props}
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M7.80474 4.19526C8.06509 4.45561 8.06509 4.87772 7.80474 5.13807L4.94281 8L7.80474 10.8619C8.06509 11.1223 8.06509 11.5444 7.80474 11.8047C7.54439 12.0651 7.12228 12.0651 6.86193 11.8047L3.5286 8.4714C3.26825 8.21106 3.26825 7.78894 3.5286 7.5286L6.86193 4.19526C7.12228 3.93491 7.54439 3.93491 7.80474 4.19526Z" fill="#79777F" className="fill-inherit" />
      <path fillRule="evenodd" clipRule="evenodd" d="M12.4714 4.19526C12.7318 4.45561 12.7318 4.87772 12.4714 5.13807L9.60948 8L12.4714 10.8619C12.7318 11.1223 12.7318 11.5444 12.4714 11.8047C12.2111 12.0651 11.7889 12.0651 11.5286 11.8047L8.19526 8.4714C7.93491 8.21106 7.93491 7.78894 8.19526 7.5286L11.5286 4.19526C11.7889 3.93491 12.2111 3.93491 12.4714 4.19526Z" fill="#79777F" className="fill-inherit" />
    </svg>
  )
}
