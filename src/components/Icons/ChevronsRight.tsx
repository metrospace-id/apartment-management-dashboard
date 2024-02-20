type IconProps = React.SVGProps<SVGSVGElement>

export default function ChevronsRight({ className, ...props }: IconProps) {
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
      <path fillRule="evenodd" clipRule="evenodd" d="M8.19526 4.19526C8.45561 3.93491 8.87772 3.93491 9.13807 4.19526L12.4714 7.5286C12.7318 7.78894 12.7318 8.21106 12.4714 8.4714L9.13807 11.8047C8.87772 12.0651 8.45561 12.0651 8.19526 11.8047C7.93491 11.5444 7.93491 11.1223 8.19526 10.8619L11.0572 8L8.19526 5.13807C7.93491 4.87772 7.93491 4.45561 8.19526 4.19526Z" fill="#79777F" className="fill-inherit" />
      <path fillRule="evenodd" clipRule="evenodd" d="M3.52859 4.19526C3.78894 3.93491 4.21105 3.93491 4.4714 4.19526L7.80473 7.5286C8.06508 7.78894 8.06508 8.21106 7.80473 8.4714L4.4714 11.8047C4.21105 12.0651 3.78894 12.0651 3.52859 11.8047C3.26824 11.5444 3.26824 11.1223 3.52859 10.8619L6.39052 8L3.52859 5.13807C3.26824 4.87772 3.26824 4.45561 3.52859 4.19526Z" fill="#79777F" className="fill-inherit" />
    </svg>
  )
}
