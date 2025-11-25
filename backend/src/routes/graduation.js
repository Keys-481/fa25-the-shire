const express = require('express');
const router = express.Router();
const pool = require('../db');
const GraduationModel = require('../models/GraduationModel');
const AccessModel = require('../models/AccessModel');
const StudentModel = require('../models/StudentModel');
const { requireUser } = require('../utils/authorize');

/**
 * GET /api/graduation?status=applied|approved|...
 * - admin & accounting: see all
 * - advisor: see their students' applications only
 */
 /**
 * GET /api/graduation?status=applied,approved,rejected
 * Returns graduation applications filtered to requested statuses (comma separated).
 * Default: applied,approved,rejected
 * Admin and accounting see all; advisors see only their students.
 */
router.get('/', requireUser, async (req, res) => {
    try {
        const q = req.query.status;
        const defaultStatuses = ['Applied', 'Approved', 'Rejected'];
        const allowed = new Set(['Not Applied', 'Applied', 'Under Review', 'Approved', 'Rejected']);

        const statuses = q
            ? q.split(',').map(s => s.trim()).filter(Boolean)
            : defaultStatuses;

        if (!statuses.every(s => allowed.has(s))) {
            return res.status(400).json({ message: 'Invalid status filter' });
        }

        // fetch all apps then filter (simple; small dataset in dev)
        let apps = await GraduationModel.getApplications(null);
        apps = apps.filter(a => statuses.includes(a.status));

        // enforce role-based visibility
        const roles = await AccessModel.getUserRoles(req.user.user_id);
        const isAdmin = roles.includes('admin');
        const isAccounting = roles.includes('accounting');
        const isAdvisor = roles.includes('advisor');

        if (isAdvisor && !isAdmin && !isAccounting) {
            const checks = await Promise.all(
                apps.map(a => AccessModel.isAdvisorOfStudent(req.user.user_id, a.student_id))
            );
            apps = apps.filter((_, i) => checks[i]);
        } else if (!isAdmin && !isAccounting && !isAdvisor) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        return res.json({ students: apps });
    } catch (err) {
        console.error('[graduation] GET error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


/**
 * POST /api/graduation
 * Student applies for graduation (uses authenticated user to resolve student)
 * Body: { programId: <optional> }
 */
router.post('/', requireUser, async (req, res) => {
    try {
        // Resolve student row from current user
        const studentRow = await pool.query(
            `SELECT student_id FROM students WHERE user_id = $1 LIMIT 1`,
            [req.user.user_id]
        );

        if (!studentRow || studentRow.rowCount === 0) {
            return res.status(404).json({ message: 'Student record not found for user' });
        }

        const studentId = studentRow.rows[0].student_id;
        const programId = req.body.programId || null;

        const created = await GraduationModel.createApplication(studentId, programId);
        return res.status(201).json(created);
    } catch (err) {
        console.error('[graduation] POST error', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * PUT /api/graduation/:id/status
 * Update application status (advisor/admin/accounting).
 * Body: { status: 'applied'|'approved'|... }
 */
router.put('/:id/status', requireUser, async (req, res) => {
    try {
        const applicationId = Number(req.params.id);
        const { status } = req.body;
        if (!status) return res.status(400).json({ message: 'Missing status' });

        const roles = await AccessModel.getUserRoles(req.user.user_id);
        const isAdmin = roles.includes('admin');
        const isAccounting = roles.includes('accounting');
        const isAdvisor = roles.includes('advisor');

        if (!isAdmin && !isAccounting && !isAdvisor) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const app = await GraduationModel.getApplicationById(applicationId);
        if (!app) return res.status(404).json({ message: 'Application not found' });

        if (isAdvisor && !isAdmin && !isAccounting) {
            const allowed = await AccessModel.isAdvisorOfStudent(req.user.user_id, app.student_id);
            if (!allowed) return res.status(403).json({ message: 'Forbidden' });
        }

        const updated = await GraduationModel.updateApplicationStatus(applicationId, status);
        return res.json(updated);
    } catch (err) {
        console.error('[graduation] PUT status error', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;