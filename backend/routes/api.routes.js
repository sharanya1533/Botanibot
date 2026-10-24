const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const a = require('../controllers/auth.controller');
const p = require('../controllers/plant.controller');
const { requireAuth } = require('../middlewares/auth');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false });

router.post('/auth/register', authLimiter, a.register);
router.post('/auth/login', authLimiter, a.login);
router.get('/auth/me', requireAuth, a.me);

router.use(requireAuth);
router.get('/species', p.species);
router.post('/plants', p.create);
router.get('/plants', p.list);
router.get('/dashboard', p.dashboard);
router.get('/plants/:id', p.getOne);
router.patch('/plants/:id', p.update);
router.delete('/plants/:id', p.remove);
router.post('/plants/:id/events', p.addEvent);
router.post('/plants/:id/journal', p.addJournal);
router.post('/jobs/run-weather', async (req, res, next) => {
  try {
    const { runWeatherScan } = require('../jobs/scheduler');
    const { getForecast } = require('../utils/weather');
    res.json(await runWeatherScan(new Date(), getForecast));
  } catch (err) { next(err); }
});

module.exports = router;
