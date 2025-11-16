async function getMe(req, res, next) {
  try {
    const user = req.user;
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const updates = req.body;
    Object.assign(req.user, updates);
    req.user.updated_at = new Date();
    await req.user.save();
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
}

async function addWeight(req, res, next) {
  try {
    const { weight, date } = req.body;
    req.user.weight_log.push({ weight, date: date || new Date() });
    await req.user.save();
    res.status(201).json({ weight_log: req.user.weight_log });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe, addWeight };
