// services/service.js
import { models } from '../db.js'; // Make sure your db.js exports models

class DoctorService {
  static async getAll() {
    try {
      return await models.Doctor.findAll();
    } catch (error) {
      throw new Error('Error fetching doctors: ' + error.message);
    }
  }

  static async getById(id) {
    try {
      return await models.Doctor.findByPk(id);
    } catch (error) {
      throw new Error('Error fetching doctor: ' + error.message);
    }
  }

  static async create(data) {
    try {
      return await models.Doctor.create(data);
    } catch (error) {
      throw new Error('Error creating doctor: ' + error.message);
    }
  }

  static async update(id, data) {
    try {
      const doctor = await models.Doctor.findByPk(id);
      if (!doctor) throw new Error('Doctor not found');
      return await doctor.update(data);
    } catch (error) {
      throw new Error('Error updating doctor: ' + error.message);
    }
  }

  static async delete(id) {
    try {
      const doctor = await models.Doctor.findByPk(id);
      if (!doctor) throw new Error('Doctor not found');
      await doctor.destroy();
      return true;
    } catch (error) {
      throw new Error('Error deleting doctor: ' + error.message);
    }
  }
}

// -------------------- User Service --------------------

class UserService {
  static async getAll() {
    try {
      return await models.User.findAll();
    } catch (error) {
      throw new Error('Error fetching users: ' + error.message);
    }
  }

  static async getById(id) {
    try {
      return await models.User.findByPk(id);
    } catch (error) {
      throw new Error('Error fetching user: ' + error.message);
    }
  }

  static async create(data) {
    try {
      return await models.User.create(data);
    } catch (error) {
      throw new Error('Error creating user: ' + error.message);
    }
  }

  static async update(id, data) {
    try {
      const user = await models.User.findByPk(id);
      if (!user) throw new Error('User not found');
      return await user.update(data);
    } catch (error) {
      throw new Error('Error updating user: ' + error.message);
    }
  }

  static async delete(id) {
    try {
      const user = await models.User.findByPk(id);
      if (!user) throw new Error('User not found');
      await user.destroy();
      return true;
    } catch (error) {
      throw new Error('Error deleting user: ' + error.message);
    }
  }
}

export { DoctorService, UserService };
