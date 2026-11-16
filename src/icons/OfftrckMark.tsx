type IconProps = React.SVGProps<SVGSVGElement>;

/** Geometric mark: hex shield + signal that leaves the main track */
export const OfftrckMark = ({ className, ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
    {...props}
  >
    <path
      d="M12 2.5 20 7v10l-8 4.5L4 17V7l8-4.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.35" opacity="0.55" />
    <path
      d="M12 7.8a4.2 4.2 0 0 1 4.2 4.2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M16.2 12c1.1 0 2.2.35 3.1 1.05L21 14.2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="1.55" fill="currentColor" />
    <circle cx="21" cy="14.2" r="1.15" fill="currentColor" />
  </svg>
);

type BrandProps = {
  className?: string;
  markClassName?: string;
  label?: string;
};

export const OfftrckBrand = ({
  className = "",
  markClassName = "h-4 w-4",
  label = "offtrck",
}: BrandProps) => (
  <span className={`inline-flex items-center gap-1.5 font-semibold text-neon ${className}`}>
    <OfftrckMark className={`shrink-0 ${markClassName}`} />
    <span>{label}</span>
  </span>
);
