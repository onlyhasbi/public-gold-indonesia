type Props = {
  badge: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export default function SectionHeader({ badge, title, subtitle, children }: Props) {
  return (
    <div className="text-center mb-10">
      <span className="inline-block px-4 py-2 rounded-full bg-red-100 text-red-700 text-sm font-medium mb-4">
        {badge}
      </span>
      {children ?? (
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-slate-500 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
