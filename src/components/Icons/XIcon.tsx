type IconProps = React.SVGProps<SVGSVGElement>

export default function XIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={`fill-current ${className}`}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.5893 4.41009C15.9147 4.73553 15.9147 5.26317 15.5893 5.5886L5.58925 15.5886C5.26382 15.914 4.73618 15.914 4.41074 15.5886C4.0853 15.2632 4.0853 14.7355 4.41074 14.4101L14.4107 4.41009C14.7362 4.08466 15.2638 4.08466 15.5893 4.41009Z"
        fill="#79777F"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.41074 4.41009C4.73618 4.08466 5.26382 4.08466 5.58925 4.41009L15.5893 14.4101C15.9147 14.7355 15.9147 15.2632 15.5893 15.5886C15.2638 15.914 14.7362 15.914 14.4107 15.5886L4.41074 5.5886C4.0853 5.26317 4.0853 4.73553 4.41074 4.41009Z"
        fill="#79777F"
      />
    </svg>
  )
}
