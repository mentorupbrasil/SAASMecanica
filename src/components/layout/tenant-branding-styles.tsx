type Props = { brandColor: string };

export function TenantBrandingStyles({ brandColor }: Props) {
  const color = brandColor || "#ea580c";

  return (
    <style>{`
      :root {
        --accent: ${color};
        --sidebar-active: ${color}1f;
      }
    `}</style>
  );
}
