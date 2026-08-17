/** The domain pages' signature element: what stays with the qualified
 * professional. Gold rule, sentence case, no mono label. */
export function RetainsRule({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-gold-400 pl-3">
      <p className="text-sm font-medium text-gold-300">The actuary retains</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}
