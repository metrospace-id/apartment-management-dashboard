type IconProps = React.SVGProps<SVGSVGElement>

const Minus = ({ className, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={`fill-current ${className}`}
    {...props}
  >
    <rect
      x="1.5"
      y="7.5"
      width="15"
      height="3"
      rx="1"
      fill="white"
      className="fill-inherit"
    />
  </svg>
)

export default Minus
