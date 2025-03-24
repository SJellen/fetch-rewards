
interface SpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
}

export default function Spinner({
  size = "medium",
  color = "#510359",
}: SpinnerProps) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-t-transparent`}
        style={{ borderColor: `${color} transparent transparent transparent` }}
      />
    </div>
  );
}
