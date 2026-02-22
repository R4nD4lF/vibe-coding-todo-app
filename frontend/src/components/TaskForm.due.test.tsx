import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import TaskForm from "./TaskForm";
import { createMockTag } from "../test/mock-data";

describe("TaskForm due_date handling", () => {
  it("converts datetime-local to UTC ISO and calls onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(() => Promise.resolve());
    const onCancel = vi.fn();
    const onCreateTag = vi.fn(() => Promise.resolve(createMockTag()));

    render(
      <TaskForm
        availableTags={[]}
        onSubmit={onSubmit}
        onCancel={onCancel}
        onCreateTag={onCreateTag}
      />,
    );

    const nameInput = screen.getByTestId("task-name-input");
    const dueInput = screen.getByTestId("task-due-date-input");
    const createButton = screen.getByTestId("create-task-button");

    await user.type(nameInput, "Test due");

    // Set local datetime value (datetime-local expects 'YYYY-MM-DDTHH:MM')
    const local = new Date(Date.UTC(2026, 1, 25, 15, 0, 0));
    const localValue = new Date(local.getTime() - local.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    await user.type(dueInput, localValue);
    await user.click(createButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const arg = onSubmit.mock.calls[0][0];
    expect(arg.name).toBe("Test due");
    // due_date should be an ISO string in UTC
    expect(typeof arg.due_date).toBe("string");
    expect(arg.due_date.endsWith("Z")).toBe(true);
  });
});
