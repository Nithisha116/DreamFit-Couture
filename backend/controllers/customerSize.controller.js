// backend/controllers/customerSizeController.js
import CustomerSizeProfile from "../models/CustomerSizeProfile.js";
import Customer from "../models/Customer.js";

// ========== GET ALL PROFILES FOR A CUSTOMER ==========
export const getCustomerProfiles = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const profiles = await CustomerSizeProfile.find({ 
      customer: customerId,
      isActive: true 
    })
    .populate('template', 'name description')
    .populate('measurements.fieldId', 'name displayName unit')
    .sort({ lastUsed: -1, updatedAt: -1 });
    
    res.json({
      success: true,
      count: profiles.length,
      data: profiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== GET SINGLE PROFILE ==========
export const getSingleProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await CustomerSizeProfile.findById(id)
      .populate('customer', 'name phone email')
      .populate('template', 'name description')
      .populate('measurements.fieldId', 'name displayName unit')
      .populate('measurementHistory.changedBy', 'name role');
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== CREATE NEW PROFILE ==========
export const createProfile = async (req, res) => {
  try {
    const { 
      customerId, 
      profileName, 
      templateId, 
      garmentType, 
      measurements,
      notes 
    } = req.body;
    
    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }
    
    // Create measurements object for quick access
    const measurementsObj = {};
    measurements.forEach(m => {
      measurementsObj[m.fieldName] = m.value;
    });
    
    // Create profile
    const profile = new CustomerSizeProfile({
      customer: customerId,
      profileName: profileName || `${garmentType} Profile - ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
      template: templateId,
      garmentType: garmentType || 'general',
      measurements: measurements,
      measurements_object: measurementsObj,
      measurementHistory: [{
        version: 1,
        measurements: measurements.map(m => ({
          fieldName: m.fieldName,
          value: m.value,
          unit: m.unit || 'cm'
        })),
        changedAt: new Date(),
        changedBy: req.user?._id,
        changeReason: 'initial',
        notes: notes || 'Initial measurements'
      }],
      notes: notes
    });
    
    await profile.save();
    
    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: profile
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ========== UPDATE MEASUREMENTS ==========
export const updateMeasurements = async (req, res) => {
  try {
    const { id } = req.params;
    const { profileName, measurements, reason, notes } = req.body;

    const profile = await CustomerSizeProfile.findById(id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    if (profileName !== undefined) {
      profile.profileName = profileName;
    }

    if (notes !== undefined) {
      profile.notes = notes;
    }

    // Update measurements with history tracking
    await profile.updateMeasurements(
      measurements,
      req.user?._id,
      reason || 'update',
      notes || 'Measurements updated'
    );
    
    res.json({
      success: true,
      message: "Measurements updated successfully",
      data: profile
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ========== MARK PROFILE AS USED ==========
export const markProfileAsUsed = async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await CustomerSizeProfile.findById(id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }
    
    await profile.markAsUsed();
    
    res.json({
      success: true,
      message: "Profile usage updated",
      data: {
        lastUsed: profile.lastUsed,
        usageCount: profile.usageCount
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ========== GET MEASUREMENT HISTORY ==========
export const getMeasurementHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await CustomerSizeProfile.findById(id)
      .select('profileName measurementHistory')
      .populate('measurementHistory.changedBy', 'name role');
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }
    
    res.json({
      success: true,
      data: profile.measurementHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== SOFT DELETE PROFILE ==========
export const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await CustomerSizeProfile.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }
    
    res.json({
      success: true,
      message: "Profile deactivated successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ========== GET OLD PROFILES (>3 months) ==========
export const getOldProfiles = async (req, res) => {
  try {
    const oldProfiles = await CustomerSizeProfile.findOldProfiles()
      .populate('customer', 'name phone');
    
    res.json({
      success: true,
      count: oldProfiles.length,
      data: oldProfiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== GET RECENTLY USED PROFILES ==========
export const getRecentProfiles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const profiles = await CustomerSizeProfile.findRecent(limit)
      .populate('customer', 'name phone');
    
    res.json({
      success: true,
      count: profiles.length,
      data: profiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== BULK CREATE PROFILES ==========
export const bulkCreateProfiles = async (req, res) => {
  try {
    const { profiles } = req.body;
    
    const createdProfiles = await CustomerSizeProfile.insertMany(profiles);
    
    res.status(201).json({
      success: true,
      message: `Created ${createdProfiles.length} profiles`,
      data: createdProfiles
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ========== GET PROFILE STATISTICS ==========
export const getProfileStatistics = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const stats = await CustomerSizeProfile.aggregate([
      { $match: { customer: mongoose.Types.ObjectId(customerId), isActive: true } },
      {
        $group: {
          _id: '$garmentType',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' },
          avgAge: { $avg: { $divide: [{ $subtract: [new Date(), '$updatedAt'] }, 1000 * 60 * 60 * 24 * 30] } }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};