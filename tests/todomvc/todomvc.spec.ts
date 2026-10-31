import { test, expect, type Page, type TestInfo } from "@playwright/test";

test.use({ video: "on", screenshot: "on" });

const TODOS = ["Buy groceries", "Walk the dog", "Write tests"];

async function attachStep(page: Page, testInfo: TestInfo, name: string) {
  await testInfo.attach(name, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
}

test("Manage todos with filters", async ({ page }, testInfo) => {
  const todoItems = page.getByTestId("todo-item");
  const itemsLeft = page.getByTestId("todo-count");

  await test.step("1. Open the app and add three todos", async () => {
    await page.goto("https://demo.playwright.dev/todomvc/");
    const newTodo = page.getByPlaceholder("What needs to be done?");
    for (const todo of TODOS) {
      await newTodo.fill(todo);
      await newTodo.press("Enter");
    }
    await expect(todoItems).toHaveText(TODOS);
    await attachStep(page, testInfo, "1-three-todos-added");
  });

  await test.step("2. Mark the second todo completed", async () => {
    await todoItems.nth(1).getByRole("checkbox").check();
    await expect(todoItems.nth(1)).toHaveClass(/completed/);
    await attachStep(page, testInfo, "2-second-todo-completed");
  });

  await test.step("3. Verify items left counter and filters", async () => {
    await expect(itemsLeft).toHaveText("2 items left");

    await page.getByRole("link", { name: "Active" }).click();
    await expect(todoItems).toHaveText([TODOS[0], TODOS[2]]);
    await attachStep(page, testInfo, "3a-active-filter");

    await page.getByRole("link", { name: "Completed" }).click();
    await expect(todoItems).toHaveText([TODOS[1]]);
    await attachStep(page, testInfo, "3b-completed-filter");
  });

  await test.step("4. Clear completed and verify only active todos remain", async () => {
    await page.getByRole("link", { name: "All" }).click();
    await page.getByRole("button", { name: "Clear completed" }).click();
    await expect(todoItems).toHaveText([TODOS[0], TODOS[2]]);
    await expect(itemsLeft).toHaveText("2 items left");
    await attachStep(page, testInfo, "4-completed-cleared");
  });
});
