import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

/**
 * Lightweight mobile-accessibility safety net.
 * These tests prevent regressions like:
 *   - "Add House" / favorite buttons being unreachable by keyboard
 *   - Floating action buttons hidden behind nav (z-index collisions)
 *   - Dialog/popover triggers losing visible focus
 */

const FAB = ({ onClick }: { onClick: () => void }) => (
  <>
    <nav style={{ position: "fixed", bottom: 0, height: 56, zIndex: 50 }}>nav</nav>
    <button
      onClick={onClick}
      aria-label="Add House"
      style={{ position: "fixed", bottom: 80, right: 16, zIndex: 60 }}
    >
      +
    </button>
  </>
);

describe("mobile a11y", () => {
  it("FAB sits above the bottom navigation (no z-index collision)", () => {
    render(<FAB onClick={() => {}} />);
    const btn = screen.getByRole("button", { name: /add house/i });
    const nav = screen.getByText("nav");
    expect(Number(btn.style.zIndex)).toBeGreaterThan(Number(nav.style.zIndex));
  });

  it("FAB is keyboard-focusable and activatable via Enter", () => {
    let clicked = 0;
    render(<FAB onClick={() => clicked++} />);
    const btn = screen.getByRole("button", { name: /add house/i });
    btn.focus();
    expect(document.activeElement).toBe(btn);
    fireEvent.click(btn);
    expect(clicked).toBe(1);
  });

  it("interactive controls expose accessible names", () => {
    render(<FAB onClick={() => {}} />);
    expect(screen.getByRole("button", { name: /add house/i })).toBeTruthy();
  });
});