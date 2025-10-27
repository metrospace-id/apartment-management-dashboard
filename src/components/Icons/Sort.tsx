type IconProps = React.SVGProps<SVGSVGElement>

const Sort = ({ className, ...props }: IconProps) => (
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
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.8993 14.3696C16.2898 14.7601 16.2898 15.3932 15.8993 15.7838L12.7071 18.976C12.3166 19.3665 11.6834 19.3665 11.2929 18.976L8.10072 15.7838C7.71019 15.3932 7.71019 14.7601 8.10072 14.3696C8.49124 13.979 9.12441 13.979 9.51493 14.3696L12 16.8546L14.4851 14.3696C14.8756 13.979 15.5088 13.979 15.8993 14.3696Z"
      fill="#79777F"
      className="fill-inherit"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.8993 9.6305C15.5088 10.021 14.8756 10.021 14.4851 9.6305L12 7.14541L9.51493 9.6305C9.12441 10.021 8.49124 10.021 8.10072 9.6305C7.71019 9.23997 7.71019 8.60681 8.10072 8.21628L11.2929 5.02409C11.6834 4.63357 12.3166 4.63357 12.7071 5.02409L15.8993 8.21628C16.2898 8.60681 16.2898 9.23997 15.8993 9.6305Z"
      fill="#79777F"
      className="fill-inherit"
    />
  </svg>
)

export default Sort
