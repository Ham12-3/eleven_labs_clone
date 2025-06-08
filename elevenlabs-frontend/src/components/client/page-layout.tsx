import type { ReactNode } from "react";

export function PageLayout({children}: {children: ReactNode}) {
    return (
      <div>
        <h1>Hello</h1> {children}
      </div>
    )
}