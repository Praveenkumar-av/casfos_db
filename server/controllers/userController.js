const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const TemporaryUser = require('../model/UserModel');
const RejectedUser = require('../model/RejectedUserModel');
const HeadOfOfficeModel = require('../model/HeadOfOfficeModel');
const PrincipalModel = require('../model/PrincipalModel');
const AssetManagerModel = require('../model/AssetManagerModel');
const storekeeperModel = require('../model/storekeeperModel');
const FacultyEntryStaffModel = require('../model/FacultyEntryStaffModel');
const facultyverifierModel = require('../model/facultyverifierModel');
const ViewerModel = require('../model/ViewerModel');

const loginUser = async (req, res) => {
  const { name, password, role } = req.body;

  if (!name || !password || !role) {
    return res.status(400).json({ message: 'Name, password, and role are required' });
  }

  try {
    let Model;
    switch (role) {
      case 'headofoffice':
        Model = HeadOfOfficeModel;
        break;
      case 'principal':
        Model = PrincipalModel;
        break;
      case 'assetmanager':
        Model = AssetManagerModel;
        break;
      case 'storekeeper':
        Model = storekeeperModel;
        break;
      case 'facultyentrystaff':
        Model = FacultyEntryStaffModel;
        break;
      case 'facultyverifier':
        Model = facultyverifierModel;
        break;
      case 'viewer':
        Model = ViewerModel;
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await Model.findOne({ name });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    res.json("success");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registerUser = async (req, res) => {
  const { name, password, role, dob, designation, phone, organization, ministry } = req.body;

  if (!name || !password || !role) {
    return res.status(400).json({ message: 'Name, password, and role are required' });
  }

  try {
    const existingUser = await TemporaryUser.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ message: "Username already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new TemporaryUser({
      name,
      password: hashedPassword,
      role,
      dob: dob || undefined,
      designation: designation || undefined,
      phone: phone || undefined,
      organization: organization || undefined,
      ministry: ministry || undefined,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((error) => error.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: err.message });
  }
};

const approveUser = async (req, res) => {
  const { id } = req.params;
  const { access, specificRole } = req.body;

  try {
    const user = await TemporaryUser.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let Model;
    let finalRole = specificRole || user.role; // Use specificRole if provided, else user.role

    switch (finalRole) {
      case 'headofoffice':
        Model = HeadOfOfficeModel;
        break;
      case 'principal':
        Model = PrincipalModel;
        break;
      case 'assetmanager':
        Model = AssetManagerModel;
        break;
      case 'storekeeper':
        Model = storekeeperModel;
        break;
      case 'facultyentrystaff':
        Model = FacultyEntryStaffModel;
        break;
      case 'facultyverifier':
        Model = facultyverifierModel;
        break;
      case 'viewer':
        Model = ViewerModel;
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    const approvedUser = new Model({
      name: user.name,
      password: user.password,
      role: finalRole,
      dob: user.dob || undefined,
      designation: user.designation || undefined,
      phone: user.phone || undefined,
      organization: user.organization || undefined,
      ministry: user.ministry || undefined,
      access: finalRole === 'headofoffice' || finalRole === 'principal' ? ['all'] : (access || []),
    });

    await approvedUser.save();
    await TemporaryUser.findByIdAndDelete(id);

    res.status(200).json({ message: 'User approved and moved to role-specific collection' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving user', error: error.message });
  }
};

const rejectUser = async (req, res) => {
  const { id } = req.params;
  const { remark } = req.body;

  if (!remark) {
    return res.status(400).json({ message: 'Remark is required for rejection' });
  }

  try {
    const user = await TemporaryUser.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const rejectedUser = new RejectedUser({
      name: user.name,
      password: user.password,
      role: user.role,
      dob: user.dob || undefined,
      designation: user.designation || undefined,
      phone: user.phone || undefined,
      organization: user.organization || undefined,
      ministry: user.ministry || undefined,
      remark,
    });

    await rejectedUser.save();
    await TemporaryUser.findByIdAndDelete(id);

    res.status(200).json({ message: 'User rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting user', error: error.message });
  }
};

const checkUser = async (req, res) => {
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ message: 'Name and role are required' });
  }

  try {
    let Model;
    switch (role) {
      case 'headofoffice':
        Model = HeadOfOfficeModel;
        break;
      case 'principal':
        Model = PrincipalModel;
        break;
      case 'assetmanager':
        Model = AssetManagerModel;
        break;
      case 'storekeeper':
        Model = storekeeperModel;
        break;
      case 'facultyentrystaff':
        Model = FacultyEntryStaffModel;
        break;
      case 'facultyverifier':
        Model = facultyverifierModel;
        break;
      case 'viewer':
        Model = ViewerModel;
        break;
      default:
        return res.status(400).json({ message: 'Invalid role for checking' });
    }

    const user = await Model.findOne({ name });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTemporaryUsers = async (req, res) => {
  try {
    const users = await TemporaryUser.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching temporary users', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  approveUser,
  rejectUser,
  checkUser,
  getTemporaryUsers,
};