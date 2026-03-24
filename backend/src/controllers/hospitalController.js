import { Department, Diagnosis, EmergencySector, Hospital, Ward } from '../models/index.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';

const normalizeName = (value) => String(value || '').trim();
const normalizeLocation = (value) => String(value || '').trim();
const MEDIPORTAL_HOSPITAL_NAME = 'MediPortal';

const getPrimaryHospital = async () => {
  const allHospitals = await Hospital.findAll({ order: [['id', 'ASC']] });
  if (allHospitals.length === 0) {
    return null;
  }

  const mediportal = allHospitals.find(
    (item) => String(item.name || '').trim().toLowerCase() === MEDIPORTAL_HOSPITAL_NAME.toLowerCase()
  );
  return mediportal || allHospitals[0];
};

const buildHospitalHierarchy = (hospitals) => {
  return hospitals.map((hospital) => {
    const plain = hospital.toJSON();
    const departments = Array.isArray(plain.Departments)
      ? plain.Departments.map((dept) => ({
          id: dept.id,
          name: dept.name,
          wardCount: Array.isArray(dept.Wards) ? dept.Wards.length : 0,
          wards: Array.isArray(dept.Wards)
            ? dept.Wards.map((ward) => ({
                id: ward.id,
                capacity: ward.capacity,
                Dept_ID: ward.Dept_ID,
              }))
            : [],
        }))
      : [];

    return {
      id: plain.id,
      name: plain.name,
      location: plain.location,
      departmentCount: departments.length,
      wardCount: departments.reduce((sum, dept) => sum + (dept.wardCount || 0), 0),
      emergencySectorCount: Array.isArray(plain.EmergencySectors) ? plain.EmergencySectors.length : 0,
      departments,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  });
};

export const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'location', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Department,
          attributes: ['id', 'name', 'H_ID'],
          include: [{ model: Ward, attributes: ['id', 'capacity', 'Dept_ID'] }],
        },
        { model: EmergencySector, attributes: ['id'] },
      ],
    });

    const mapped = buildHospitalHierarchy(hospitals);
    const primary = mapped.find(
      (item) => String(item.name || '').trim().toLowerCase() === MEDIPORTAL_HOSPITAL_NAME.toLowerCase()
    ) || mapped[0];

    return res.json(formatResponse(true, 'Hospitals fetched successfully', primary ? [primary] : []));
  } catch (err) {
    return handleError(res, err);
  }
};

export const getHospitalCatalog = async (req, res) => {
  try {
    const [hospitals, tests] = await Promise.all([
      Hospital.findAll({
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'location', 'createdAt', 'updatedAt'],
        include: [
          {
            model: Department,
            attributes: ['id', 'name', 'H_ID'],
            include: [{ model: Ward, attributes: ['id', 'capacity', 'Dept_ID'] }],
          },
        ],
      }),
      Diagnosis.findAll({
        where: { P_ID: null },
        attributes: ['id', 'name', 'price'],
        order: [['name', 'ASC']],
      }),
    ]);

    const mappedHospitals = buildHospitalHierarchy(hospitals);
    const primary = mappedHospitals.find(
      (item) => String(item.name || '').trim().toLowerCase() === MEDIPORTAL_HOSPITAL_NAME.toLowerCase()
    ) || mappedHospitals[0];

    return res.json(
      formatResponse(true, 'Hospital catalog fetched successfully', {
        hospitals: primary ? [primary] : [],
        tests: tests.map((test) => ({
          id: test.id,
          name: test.name,
          price: Number(test.price) || 0,
        })),
      })
    );
  } catch (err) {
    return handleError(res, err);
  }
};

export const createHospital = async (req, res) => {
  try {
    const requestedName = normalizeName(req.body.name);
    const location = normalizeLocation(req.body.location);

    if (!location) {
      return res.status(400).json(formatResponse(false, 'Location is required'));
    }

    if (requestedName && requestedName.toLowerCase() !== MEDIPORTAL_HOSPITAL_NAME.toLowerCase()) {
      return res.status(400).json(formatResponse(false, 'Only MediPortal hospital is allowed in this system'));
    }

    const existingHospitals = await Hospital.count();
    if (existingHospitals > 0) {
      return res.status(400).json(formatResponse(false, 'Hospital already configured as MediPortal'));
    }

    const created = await Hospital.create({ name: MEDIPORTAL_HOSPITAL_NAME, location });

    return res.status(201).json(
      formatResponse(true, 'MediPortal hospital created successfully', {
        id: created.id,
        name: created.name,
        location: created.location,
        departmentCount: 0,
        emergencySectorCount: 0,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      })
    );
  } catch (err) {
    return handleError(res, err);
  }
};

export const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) {
      return res.status(404).json(formatResponse(false, 'Hospital/clinic not found'));
    }

    const updates = {};
    if (req.body.name !== undefined) {
      const name = normalizeName(req.body.name);
      if (!name) {
        return res.status(400).json(formatResponse(false, 'Name cannot be empty'));
      }
      if (name.toLowerCase() !== MEDIPORTAL_HOSPITAL_NAME.toLowerCase()) {
        return res.status(400).json(formatResponse(false, 'Hospital name must remain MediPortal'));
      }
      updates.name = name;
    }

    if (req.body.location !== undefined) {
      const location = normalizeLocation(req.body.location);
      if (!location) {
        return res.status(400).json(formatResponse(false, 'Location cannot be empty'));
      }
      updates.location = location;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json(formatResponse(false, 'Nothing to update'));
    }

    await hospital.update(updates);

    const [departmentCount, emergencySectorCount] = await Promise.all([
      Department.count({ where: { H_ID: hospital.id } }),
      EmergencySector.count({ where: { H_ID: hospital.id } }),
    ]);

    return res.json(
      formatResponse(true, 'Hospital/clinic updated successfully', {
        id: hospital.id,
        name: hospital.name,
        location: hospital.location,
        departmentCount,
        emergencySectorCount,
        createdAt: hospital.createdAt,
        updatedAt: hospital.updatedAt,
      })
    );
  } catch (err) {
    return handleError(res, err);
  }
};

export const deleteHospital = async (req, res) => {
  try {
    return res.status(400).json(formatResponse(false, 'MediPortal hospital cannot be deleted'));
  } catch (err) {
    return handleError(res, err);
  }
};

export const createDepartment = async (req, res) => {
  try {
    const primaryHospital = await getPrimaryHospital();
    const name = normalizeName(req.body.name);

    if (!name) {
      return res.status(400).json(formatResponse(false, 'Department name is required'));
    }

    if (!primaryHospital) {
      return res.status(400).json(formatResponse(false, 'MediPortal hospital must be created first'));
    }

    const existing = await Department.findOne({ where: { H_ID: primaryHospital.id, name } });
    if (existing) {
      return res.status(400).json(formatResponse(false, 'Department already exists in MediPortal hospital'));
    }

    const department = await Department.create({ H_ID: primaryHospital.id, name });

    return res.status(201).json(
      formatResponse(true, 'Department created successfully', {
        id: department.id,
        name: department.name,
        H_ID: department.H_ID,
      })
    );
  } catch (err) {
    return handleError(res, err);
  }
};

export const createWard = async (req, res) => {
  try {
    const departmentId = Number(req.body.departmentId);
    const capacity = Number(req.body.capacity);

    if (!Number.isInteger(departmentId) || !Number.isInteger(capacity) || capacity <= 0) {
      return res.status(400).json(formatResponse(false, 'Valid department and ward capacity are required'));
    }

    const department = await Department.findByPk(departmentId);
    if (!department) {
      return res.status(404).json(formatResponse(false, 'Department not found'));
    }

    const ward = await Ward.create({ Dept_ID: departmentId, capacity });

    return res.status(201).json(
      formatResponse(true, 'Ward created successfully', {
        id: ward.id,
        Dept_ID: ward.Dept_ID,
        capacity: ward.capacity,
      })
    );
  } catch (err) {
    return handleError(res, err);
  }
};

export const createDiagnosticTest = async (req, res) => {
  try {
    const name = normalizeName(req.body.name);
    const price = Number(req.body.price);

    if (!name || Number.isNaN(price) || price < 0) {
      return res.status(400).json(formatResponse(false, 'Valid test name and non-negative price are required'));
    }

    const existing = await Diagnosis.findOne({ where: { name, P_ID: null } });
    if (existing) {
      return res.status(400).json(formatResponse(false, 'Test already exists'));
    }

    const created = await Diagnosis.create({ name, price, P_ID: null });

    return res.status(201).json(
      formatResponse(true, 'Diagnostic test created successfully', {
        id: created.id,
        name: created.name,
        price: Number(created.price) || 0,
      })
    );
  } catch (err) {
    return handleError(res, err);
  }
};
