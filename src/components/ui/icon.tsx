import { ICONS, type IconKey } from "@/lib/icons";

export function Icon({
  name,
  className,
}: {
  name: IconKey;
  className?: string;
}) {
  const Component = ICONS[name];
  return <Component className={className} />;
}
