/**
 * File: frontend/tests/e2e/DegreePlan.spec.js
 * E2E tests for the DegreePlan component within the Advising page.
 * Tests advisor's ability to search for a student and view their degree plan.
 */

import { test, expect } from '@playwright/test';

test.describe('Advising - DegreePlan component', () => {

    test('advisor can search student and view degree plan', async ({ page }, testInfo) => {
        if (!testInfo.project?.name?.includes('advisor')) test.skip();
        // Go to advisor/advising page
        await page.goto(`/advisor/advising`);

        // Search for the student by school ID
        const searchInput = page.getByPlaceholder('School ID');
        await searchInput.fill('112299690');
        await searchInput.press('Enter');

        // Wait for search results to show up
        await page.waitForSelector('[data-testid="search-results"], table, .results', { timeout: 10000 });
        await expect(page.getByText('Alice Johnson', { exact: false })).toBeVisible({ timeout: 10000 });

        // Click on the student result
        await page.getByText('Alice Johnson', { exact: false }).click();

        // Wait for the list of programs to appear
        await expect(page.getByText('Master of Science in Organizational Performance and Workplace Learning'))
            .toBeVisible({ timeout: 10000 });

        // Click the desired program
        await page.getByText('Master of Science in Organizational Performance and Workplace Learning').click();

        // Wait for the degree plan API call
        const apiResponse = await page.waitForResponse(
            r =>
                r.url().includes('/api/students/112299690/degree-plan') && 
                r.status() === 200,
            { timeout: 10000 }
        );

        console.log('Degree plan loaded:', apiResponse.url());

        // Verify that the degree plan is displayed
        await expect(page.getByText('Credit Count: 15 / 36')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('OPWL-536').first()).toBeVisible();
    });

});
