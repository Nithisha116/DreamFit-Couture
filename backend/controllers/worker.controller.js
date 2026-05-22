import Worker from '../models/Worker.js';

// @desc    Get all workers with optional role filtering
// @route   GET /api/workers
// @access  Private (Admin, Manager)
export const getWorkers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    
    let query = {};
    if (role) {
      if (role === 'cutting') {
        query.role = 'cutting_master';
      } else {
        query.role = role;
      }
    }
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const workers = await Worker.find(query).sort({ name: 1 });
    
    res.json({
      success: true,
      count: workers.length,
      data: workers
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
