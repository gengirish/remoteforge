import type { ReactNode } from "react";

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <div className="animate-page-enter motion-reduce:animate-none">
      {children}
    </div>
  );
}
