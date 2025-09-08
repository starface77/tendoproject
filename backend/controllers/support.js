const Support = require('../models/Support');
const User = require('../models/User');

/**
 * 🎫 SUPPORT CONTROLLER
 * Support ticket management for admin panel
 */

// @desc    Get all support tickets
// @route   GET /api/v1/support/tickets
// @access  Private (Admin)
const getSupportTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || 'all';

    // Build query
    const query = {};

    // Add search filter
    if (search) {
      query.$or = [
        { ticketNumber: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const tickets = await Support.find(query)
      .populate('customer', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await Support.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: tickets.map(ticket => ({
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        customer: {
          id: ticket.customer._id,
          name: `${ticket.customer.firstName} ${ticket.customer.lastName}`,
          email: ticket.customer.email
        },
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        assignedTo: ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : null,
        messageCount: ticket.messages.length,
        unreadCount: ticket.unreadCount,
        lastMessage: ticket.messages.length > 0 ? ticket.messages[ticket.messages.length - 1].message : null,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      })),
      pagination: {
        page,
        limit,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get Support Tickets Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch support tickets'
    });
  }
};

// @desc    Get single support ticket
// @route   GET /api/v1/support/tickets/:id
// @access  Private (Admin)
const getSupportTicket = async (req, res) => {
  try {
    const ticket = await Support.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName')
      .populate('messages.sender', 'firstName lastName');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Support ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        customer: {
          id: ticket.customer._id,
          name: `${ticket.customer.firstName} ${ticket.customer.lastName}`,
          email: ticket.customer.email,
          phone: ticket.customer.phone
        },
        subject: ticket.subject,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        assignedTo: ticket.assignedTo ? {
          id: ticket.assignedTo._id,
          name: `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
        } : null,
        tags: ticket.tags,
        resolution: ticket.resolution,
        satisfaction: ticket.satisfaction,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      }
    });

  } catch (error) {
    console.error('Get Support Ticket Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch support ticket'
    });
  }
};

// @desc    Update ticket status
// @route   PATCH /api/v1/support/tickets/:id/status
// @access  Private (Admin)
const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const ticket = await Support.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('customer', 'firstName lastName email')
     .populate('assignedTo', 'firstName lastName');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Support ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });

  } catch (error) {
    console.error('Update Ticket Status Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update ticket status'
    });
  }
};

// @desc    Assign ticket
// @route   PATCH /api/v1/support/tickets/:id/assign
// @access  Private (Admin)
const assignTicket = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const ticket = await Support.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true }
    ).populate('customer', 'firstName lastName email')
     .populate('assignedTo', 'firstName lastName');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Support ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });

  } catch (error) {
    console.error('Assign Ticket Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign ticket'
    });
  }
};

// @desc    Send ticket message
// @route   POST /api/v1/support/tickets/:id/messages
// @access  Private (Admin)
const sendTicketMessage = async (req, res) => {
  try {
    const { message } = req.body;

    const ticket = await Support.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Support ticket not found'
      });
    }

    // Add message
    await ticket.addMessage(req.user.id, 'admin', message);

    // Populate the updated ticket
    await ticket.populate('customer', 'firstName lastName email');
    await ticket.populate('assignedTo', 'firstName lastName');
    await ticket.populate('messages.sender', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: {
        message: 'Message sent successfully',
        ticket: ticket
      }
    });

  } catch (error) {
    console.error('Send Ticket Message Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
};

// @desc    Get ticket messages
// @route   GET /api/v1/support/tickets/:id/messages
// @access  Private (Admin)
const getTicketMessages = async (req, res) => {
  try {
    const ticket = await Support.findById(req.params.id)
      .populate('messages.sender', 'firstName lastName');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Support ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket.messages.map(msg => ({
        id: msg._id,
        sender: {
          id: msg.sender._id,
          name: `${msg.sender.firstName} ${msg.sender.lastName}`,
          type: msg.senderType
        },
        message: msg.message,
        attachments: msg.attachments,
        isRead: msg.isRead,
        createdAt: msg.createdAt
      }))
    });

  } catch (error) {
    console.error('Get Ticket Messages Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ticket messages'
    });
  }
};

module.exports = {
  getSupportTickets,
  getSupportTicket,
  updateTicketStatus,
  sendTicketMessage,
  getTicketMessages,
  assignTicket
};




