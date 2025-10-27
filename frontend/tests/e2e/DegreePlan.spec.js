/**
 * File: frontend/tests/e2e/DegreePlan.spec.js
 * E2E tests for the DegreePlan component within the Advising page.
 * Tests:
 *   - advisor's ability to search for a student and view their degree plan.
 *   - advisor's ability to toggle between semester and requirements view.
 *   - advisor's ability to edit course status in the degree plan.
 */

import { test, expect } from '@playwright/test';

/**
 * Tests for searching a student and viewing their degree plan.
 */
test.describe('Advising - DegreePlan component', () => {

    test('advisor can search student and view degree plan', async ({ page, baseURL }) => {
        // Go to advisor/advising page
        await page.goto(`${baseURL}/advisor/advising`);

        // Search for the student by school ID
        const searchInput = page.getByPlaceholder('School ID');
        await searchInput.fill('112299690');
        await searchInput.press('Enter');

        // Wait for search results to show up
        await expect(page.getByText('Alice Johnson')).toBeVisible({ timeout: 10000 });

        // Click on the student result
        await page.getByText('Alice Johnson').click();

        // Wait for the list of programs to appear
        await expect(page.getByText('Master of Science in Organizational Performance and Workplace Learning'))
            .toBeVisible({ timeout: 10000 });

        // Click the desired program
        await page.getByText('Master of Science in Organizational Performance and Workplace Learning').click();

        // Wait for the degree plan API call
        const apiResponse = await page.waitForResponse(r =>
            r.url().includes('/students/112299690/degree-plan') && r.status() === 200,
            { timeout: 20000 }
        );

        console.log('Degree plan loaded:', apiResponse.url());

        // Verify that the degree plan is displayed
        await expect(page.getByText('Credit Count: 15 / 36')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('OPWL-536').first()).toBeVisible();
    });

});

/**
 * Tests for DegreePlan component view toggle functionality.
 */
test.describe('DegreePlan component view toggle', () => {

    test('advisor can toggle between semester and requirements view', async ({ page, baseURL }) => {
        // Go to advisor/advising page
        await page.goto(`${baseURL}/advisor/advising`);

        // Search for the student by school ID
        const searchInput = page.getByPlaceholder('School ID');
        await searchInput.fill('112299690');
        await searchInput.press('Enter');

        // Wait for search results to show up
        await expect(page.getByText('Alice Johnson')).toBeVisible({ timeout: 10000 });

        // Click on the student result
        await page.getByText('Alice Johnson').click();

        // Wait for the list of programs to appear
        await expect(page.getByText('Master of Science in Organizational Performance and Workplace Learning'))
            .toBeVisible({ timeout: 10000 });

        // Click the desired program
        await page.getByText('Master of Science in Organizational Performance and Workplace Learning').click();

        // Wait for degree plan to load
        await page.waitForResponse(r =>
            r.url().includes('/students/112299690/degree-plan') && r.status() === 200,
            { timeout: 20000 }
        );

        // Verify initial view is requirements view
        await expect(page.getByText('Credit Count: 15 / 36')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Core Courses for OPWL MS')).toBeVisible();

        // Click to toggle to semester view
        await page.getByRole('button', { name: 'Semester View' }).click();

        // Verify semester view is displayed
        await expect(page.getByText('Fall 2024')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('OPWL-536').first()).toBeVisible();
    });

});

/**
 * Tests for editing course status in DegreePlan component.
 */
test.describe('DegreePlan edit course status', () => {
    test('advisor can edit course status in degree plan', async ({ page, baseURL }) => {
        // Go to advisor/advising page
        await page.goto(`${baseURL}/advisor/advising`);

        // Search for the student by school ID
        const searchInput = page.getByPlaceholder('School ID');
        await searchInput.fill('112299690');
        await searchInput.press('Enter');

        // Wait for search results to show up
        await expect(page.getByText('Alice Johnson')).toBeVisible({ timeout: 10000 });

        // Click on the student result
        await page.getByText('Alice Johnson').click();

        // Wait for the list of programs to appear
        await expect(page.getByText('Master of Science in Organizational Performance and Workplace Learning'))
            .toBeVisible({ timeout: 10000 });

        // Click the desired program
        await page.getByText('Master of Science in Organizational Performance and Workplace Learning').click();

        // Wait for degree plan to load
        await page.waitForResponse(
        (r) => r.url().includes('/students/112299690/degree-plan') && r.status() === 200,
        { timeout: 20000 }
        );

        // Wait for known course to be visible
        const courseRowElement = page.locator('tr', { hasText: 'OPWL-507' }).first();
        await expect(courseRowElement).toBeVisible({ timeout: 10000 });

        // Click edit button for that row
        const editButton = courseRowElement.locator('.course-status-edit-btn');
        await editButton.click();

        // Wait for status dropdown to appear
        const statusSelect = page.locator('select').first();
        await expect(statusSelect).toBeVisible();

        // Change status to Planned
        await statusSelect.selectOption('Planned');

        // Select a semester
        const semesterSelect = page.getByLabel('Semester:');
        if (await semesterSelect.isVisible()) {
        await semesterSelect.selectOption({ label: 'Spring 2025' });
        }

        const editRow = courseRowElement.locator(
            'xpath=following-sibling::tr[contains(@class, "course-edit-row")]'
        ).first();

        // Wait for Save button to become visible and enabled
        const saveButton = editRow.getByRole('button', { name: 'Save' });
        await expect(saveButton).toBeVisible();
        await expect(saveButton).toBeEnabled();

        // Give React time to settle before clicking
        await page.waitForTimeout(500);

        // Click Save to trigger PATCH
        await saveButton.click();

        // Wait for the PATCH API call to complete
        await page.waitForTimeout(1500); // wait for UI to update

        // re-locate the course row element after the update and verify the status changed
        await expect(
            page.locator('tr', { hasText: 'OPWL-507' }).first()
        ).toHaveClass(/course-status-planned/, { timeout: 15000 });
    });
});
