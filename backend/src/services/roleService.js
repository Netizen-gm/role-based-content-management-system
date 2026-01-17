const Role = require('../models/Role');

// Get all roles
const getAllRoles = async () => {
  return await Role.find().sort({ createdAt: -1 });
};

// Get role by ID
const getRoleById = async (roleId) => {
  return await Role.findById(roleId);
};

// Get role by name
const getRoleByName = async (roleName) => {
  return await Role.findOne({ name: roleName.toUpperCase() });
};

// Create new role
const createRole = async (roleData) => {
  const role = new Role({
    ...roleData,
    name: roleData.name.toUpperCase(),
  });
  return await role.save();
};

// Update role
const updateRole = async (roleId, updateData) => {
  if (updateData.name) {
    updateData.name = updateData.name.toUpperCase();
  }
  return await Role.findByIdAndUpdate(
    roleId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

// Delete role (only if not default)
const deleteRole = async (roleId) => {
  const role = await Role.findById(roleId);
  if (!role) {
    throw new Error('Role not found');
  }
  if (role.isDefault) {
    throw new Error('Cannot delete default role');
  }
  return await Role.findByIdAndDelete(roleId);
};

module.exports = {
  getAllRoles,
  getRoleById,
  getRoleByName,
  createRole,
  updateRole,
  deleteRole,
};
