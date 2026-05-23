import Worker from '../models/Worker.js';
import Tailor from '../models/Tailor.js';
import CuttingMaster from '../models/CuttingMaster.js';
import StoreKeeper from '../models/StoreKeeper.js';
import User from '../models/User.js';

// @desc    Get all workers with optional role filtering
// @route   GET /api/workers
// @access  Private (Admin, Manager)
export const getWorkers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let workersList = [];

    // Normalize search query if any
    const searchFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    // Map status filter
    const getIsActiveFilter = () => {
      if (!status) return {};
      if (status === 'active') return { isActive: true };
      if (status === 'inactive') return { isActive: false };
      return {};
    };

    const normalizedRole = role ? role.toLowerCase() : '';

    if (normalizedRole === 'tailor') {
      const query = { ...getIsActiveFilter(), ...searchFilter };
      const tailors = await Tailor.find(query).sort({ name: 1 }).lean();
      workersList = tailors.map(t => ({
        _id: t._id,
        name: t.name,
        fullName: t.name,
        role: 'tailor',
        phone: t.phone || '',
        status: t.isActive ? 'active' : 'inactive'
      }));
    } else if (normalizedRole === 'cutting' || normalizedRole === 'cutting_master') {
      const query = { ...getIsActiveFilter(), ...searchFilter };
      const cuttingMasters = await CuttingMaster.find(query).sort({ name: 1 }).lean();
      workersList = cuttingMasters.map(c => ({
        _id: c._id,
        name: c.name,
        fullName: c.name,
        role: 'cutting_master',
        phone: c.phone || '',
        status: c.isActive ? 'active' : 'inactive'
      }));
    } else if (normalizedRole === 'store_keeper') {
      const query = { ...getIsActiveFilter(), ...searchFilter };
      const storeKeepers = await StoreKeeper.find(query).sort({ name: 1 }).lean();
      workersList = storeKeepers.map(s => ({
        _id: s._id,
        name: s.name,
        fullName: s.name,
        role: 'store_keeper',
        phone: s.phone || '',
        status: s.isActive ? 'active' : 'inactive'
      }));
    } else if (normalizedRole === 'staff') {
      const query = { role: 'STAFF', ...getIsActiveFilter(), ...searchFilter };
      const staffList = await User.find(query).sort({ name: 1 }).lean();
      workersList = staffList.map(s => ({
        _id: s._id,
        name: s.name,
        fullName: s.name,
        role: 'staff',
        phone: s.phone || '',
        status: s.isActive ? 'active' : 'inactive'
      }));
    } else {
      // General search or other roles: query standard/legacy Worker collection
      let query = {};
      if (role) {
        query.role = role === 'cutting' ? 'cutting_master' : role;
      }
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }
      const workers = await Worker.find(query).sort({ name: 1 }).lean();
      workersList = workers.map(w => ({
        _id: w._id,
        name: w.name,
        fullName: w.name,
        role: w.role,
        phone: w.phone || '',
        status: w.status
      }));
    }

    res.json({
      success: true,
      count: workersList.length,
      workers: workersList,
      data: workersList
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error fetching workers',
      error: error.message
    });
  }
};

// @desc    Get worker by ID
// @route   GET /api/workers/:id
// @access  Private
export const getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    res.json({ success: true, data: worker });
  } catch (error) {
    console.error('Error fetching worker:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create new worker
// @route   POST /api/workers
// @access  Private (Admin)
export const createWorker = async (req, res) => {
  try {
    const { name, phone, role, status, skills } = req.body;
    
    const worker = await Worker.create({
      name,
      phone,
      role,
      status: status || 'active',
      skills: skills || [],
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      data: worker
    });
  } catch (error) {
    console.error('Error creating worker:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create worker',
      error: error.message
    });
  }
};

// @desc    Update worker
// @route   PUT /api/workers/:id
// @access  Private (Admin)
export const updateWorker = async (req, res) => {
  try {
    let worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    
    worker = await Worker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.json({ success: true, data: worker });
  } catch (error) {
    console.error('Error updating worker:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
