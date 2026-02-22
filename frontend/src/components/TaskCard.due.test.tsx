import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TaskCard from "./TaskCard";
import { createMockItem } from "../test/mock-data";

describe("TaskCard due indicator", () => {
  it("shows neutral indicator when no due_date", () => {
    const item = createMockItem({ due_date: undefined });
    render(
      <TaskCard item={item} onDelete={() => {}} onEdit={() => {}} onDragStart={() => {}} />,
    );

    // no dot should be present
    const dot = screen.queryByTitle(/Due|Overdue/);
    expect(dot).toBeNull();
  });

  it("shows overdue (red) indicator when past due_date", () => {
    const past = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const item = createMockItem({ due_date: past });
    render(
      <TaskCard item={item} onDelete={() => {}} onEdit={() => {}} onDragStart={() => {}} />,
    );

    const dot = screen.getByTitle(/Overdue/);
    expect(dot).toBeInTheDocument();
    // dot is a span with class including bg-rose-500
    const dotSpan = dot as HTMLElement;
    expect(dotSpan.className).toContain("bg-rose-500");
  });

  it("shows due soon (amber) indicator when within 48h", () => {
    const soon = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const item = createMockItem({ due_date: soon });
    render(
      <TaskCard item={item} onDelete={() => {}} onEdit={() => {}} onDragStart={() => {}} />,
    );

    const dot = screen.getByTitle(/Due soon/);
    expect(dot).toBeInTheDocument();
    expect((dot as HTMLElement).className).toContain("bg-amber-500");
  });
});
