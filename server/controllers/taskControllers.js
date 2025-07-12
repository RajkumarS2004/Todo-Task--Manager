const Task = require('../models/Task');
const User = require('../models/User');

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;
    
    console.log('Creating task with data:', { title, description, priority, status, dueDate });
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const newTask = new Task({ 
      title, 
      description, 
      priority, 
      status,
      dueDate,
      createdBy: req.userId 
    });
    
    console.log('New task object:', newTask);
    const savedTask = await newTask.save();
    console.log('Saved task:', savedTask);
    
    // Populate the createdBy field
    const populatedTask = await Task.findById(savedTask._id)
      .populate('createdBy', 'name email avatar')
      .populate('sharedWith', 'name email avatar');
    
    res.status(201).json({
      data: {
        task: populatedTask
      }
    });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// Get tasks with pagination and sorting
const getTasks = async (req, res) => {
  try {
    console.log('GetTasks: Request received for user:', req.userId);
    console.log('GetTasks: Query params:', req.query);
    
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', status, priority } = req.query;
    const sortOrder = order === 'desc' ? -1 : 1;
    
    // Build filter object
    const filter = {
      $or: [
        { createdBy: req.userId },
        { sharedWith: req.userId }
      ]
    };

    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('createdBy', 'name email avatar')
      .populate('sharedWith', 'name email avatar')
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Task.countDocuments(filter);

    console.log('GetTasks: Found', tasks.length, 'tasks for user', req.userId);
    console.log('GetTasks: Total tasks:', total);

    res.json({
      data: {
        tasks,
        totalPages: Math.ceil(total / limit),
        totalTasks: total
      }
    });
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// Get a single task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ createdBy: req.userId }, { sharedWith: req.userId }]
    }).populate('createdBy', 'name email avatar')
      .populate('sharedWith', 'name email avatar');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      data: {
        task: task
      }
    });
  } catch (err) {
    console.error('Get task by ID error:', err);
    res.status(500).json({ message: 'Failed to fetch task' });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, $or: [{ createdBy: req.userId }, { sharedWith: req.userId }] },
      { title, description, status, priority, dueDate },
      { new: true }
    ).populate('createdBy', 'name email avatar')
     .populate('sharedWith', 'name email avatar');

    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    res.json({
      data: {
        task: task
      }
    });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

// Share a task with another user
const shareTask = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if task exists and user owns it
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    // Check if already shared
    if (task.sharedWith.includes(userToShare._id)) {
      return res.status(400).json({ message: 'Task already shared with this user' });
    }

    // Add user to shared list
    task.sharedWith.push(userToShare._id);
    await task.save();

    const updatedTask = await Task.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('sharedWith', 'name email avatar');

    res.json({
      data: {
        task: updatedTask
      }
    });
  } catch (err) {
    console.error('Share task error:', err);
    res.status(500).json({ message: 'Failed to share task' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    // Example: count total tasks and completed tasks
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ completed: true });
    res.json({ totalTasks, completedTasks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load analytics data' });
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask, shareTask };