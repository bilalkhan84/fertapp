interface BadgeProps {
  label: string;
  variant?: "teal" | "green" | "yellow" | "red" | "gray" | "blue";
}

const variantClasses = {
  teal: "bg-teal-100 text-teal-800",
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-charcoal-100 text-charcoal-700",
  blue: "bg-blue-100 text-blue-800",
};

export default function Badge({ label, variant = "gray" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
      ].join(" ")}
    >
      {label}
    </span>
  );
}
