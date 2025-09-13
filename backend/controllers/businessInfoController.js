const BusinessInfo = require('../models/BusinessInfo');

const getBusinessInfo = async (req, res) => {
  try {
    const info = await BusinessInfo.findOne();
    res.json(info || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateBusinessInfo = async (req, res) => {
  try {
    const { contact, email, address, website, gcashName, gcashQR } = req.body;
    let info = await BusinessInfo.findOne();
    if (!info) {
      info = new BusinessInfo({ contact, email, address, website, gcashName, gcashQR });
    } else {
      info.contact = contact;
      info.email = email;
      info.address = address;
      info.website = website;
      info.gcashName = gcashName;
      info.gcashQR = gcashQR;
    }
    await info.save();
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getBusinessInfo,
  updateBusinessInfo,
};