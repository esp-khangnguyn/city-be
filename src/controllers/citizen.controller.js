import * as Yup from "yup";
import { Op } from "sequelize";
import Citizen from "../models/Citizen";
import { BadRequestError, ValidationError } from "../utils/ApiError";

let citizenController = {
  // Create a new citizen
  add: async (req, res, next) => {
    try {
      const schema = Yup.object().shape({
        uid: Yup.string().required(),
        national_identifier: Yup.string().required(),
        first: Yup.string().required(),
        last: Yup.string().required(),
        mother_first: Yup.string(),
        father_first: Yup.string(),
        gender: Yup.string().oneOf(["M", "F", "Male", "Female"]),
        birth_city: Yup.string(),
        date_of_birth: Yup.date(),
        id_registration_city: Yup.string(),
        id_registration_district: Yup.string(),
        address_city: Yup.string(),
        address_district: Yup.string(),
        address_neighborhood: Yup.string(),
        street_address: Yup.string(),
        door_or_entrance_number: Yup.string(),
        misc: Yup.string(),
      });

      if (!(await schema.isValid(req.body))) throw new ValidationError();

      const citizenExists = await Citizen.findOne({
        where: { uid: req.body.uid },
      });

      if (citizenExists)
        throw new BadRequestError("Citizen with this UID already exists");

      const citizen = await Citizen.create(req.body);

      return res.status(201).json(citizen);
    } catch (error) {
      next(error);
    }
  },

  // Get all citizens
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      console.log("🚀 ~ filters:", filters);

      const offset = (page - 1) * limit;
      const whereCondition = {};

      // Handle general search across multiple fields
      // if (filters.search) {
      //   whereCondition[Op.or] = [
      //     { national_identifier: { [Op.iLike]: `%${filters.search}%` } },
      //     { birth_city: { [Op.iLike]: `%${filters.search}%` } },
      //     { address_city: { [Op.iLike]: `%${filters.search}%` } },
      //     { address_district: { [Op.iLike]: `%${filters.search}%` } },
      //     { address_neighborhood: { [Op.iLike]: `%${filters.search}%` } },
      //     { street_address: { [Op.iLike]: `%${filters.search}%` } },
      //   ];
      // }

      if (filters.mother_name) {
        whereCondition.mother_first = {
          [Op.iLike]: `%${filters.mother_name}%`,
        };
      }
      if (filters.father_name) {
        whereCondition.father_first = {
          [Op.iLike]: `%${filters.father_name}%`,
        };
      }

      if (filters.first_name) {
        whereCondition.first = { [Op.iLike]: `%${filters.first_name}%` };
      }
      if (filters.last_name) {
        whereCondition.last = { [Op.iLike]: `%${filters.last_name}%` };
      }

      // Add specific filters if provided (these work in combination with general search)
      if (filters.national_identifier) {
        whereCondition.national_identifier = {
          [Op.iLike]: `%${filters.national_identifier.trim()}%`,
        };
      }

      // Location filters
      if (filters.birth_city) {
        whereCondition.birth_city = filters.birth_city;
      }
      if (filters.address_city) {
        whereCondition.address_city = filters.address_city;
      }

      // Gender filter
      if (filters.gender) {
        whereCondition.gender = filters.gender;
      }

      // Date of birth range filters
      if (filters.birth_date_from || filters.birth_date_to) {
        const dateCondition = {};

        if (filters.birth_date_from) {
          dateCondition[Op.gte] = new Date(filters.birth_date_from);
        }
        if (filters.birth_date_to) {
          dateCondition[Op.lte] = new Date(filters.birth_date_to);
        }

        whereCondition.date_of_birth = dateCondition;
      }

      // Additional address filters
      if (filters.address_district) {
        whereCondition.address_district = {
          [Op.iLike]: `%${filters.address_district}%`,
        };
      }
      if (filters.address_neighborhood) {
        whereCondition.address_neighborhood = {
          [Op.iLike]: `%${filters.address_neighborhood}%`,
        };
      }

      let nameFilter = {};
      if (filters.name) {
        nameFilter[Op.or] = [
          { first: { [Op.iLike]: `%${filters.name}%` } },
          { last: { [Op.iLike]: `%${filters.name}%` } },
        ];
      }

      const rows = await Citizen.findAll({
        where: {
          ...whereCondition,
          ...(filters.name
            ? {
                [Op.or]: [
                  { first: { [Op.iLike]: `%${filters.name}%` } },
                  { last: { [Op.iLike]: `%${filters.name}%` } },
                ],
              }
            : {}),
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ["first", "ASC"],
          ["last", "ASC"],
        ],
      });
      console.log("🚀 ~ rows:", rows);

      // const count = await Citizen.count({
      //   where: whereCondition,
      // });

      // const count = await Citizen.count({
      //   where: {
      //     ...whereCondition,
      //     ...(filters.name
      //       ? {
      //           [Op.or]: [
      //             { first: { [Op.iLike]: `%${filters.name}%` } },
      //             { last: { [Op.iLike]: `%${filters.name}%` } },
      //           ],
      //         }
      //       : {}),
      //   },
      // });
      const test = rows.map((citizen) => citizen.get({ plain: true }));
      console.log("🚀 ~ test:", test);

      const data = {
        citizens: test,
        pagination: {
          total: 10,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(10 / limit),
        },
      };
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error in getAll:", error);
    }
  },

  // Get all cities
  getAllCities: async (req, res, next) => {
    try {
      const arrayCities = await Citizen.findAll({
        attributes: [
          [
            Citizen.sequelize.fn(
              "DISTINCT",
              Citizen.sequelize.col("address_city")
            ),
            "address_city",
          ],
        ],
        order: [["address_city", "ASC"]],
      });

      const cities = arrayCities.map((city) => city.address_city);
      return res.status(200).json(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      next(error);
    }
  },

  // Get all cities
  getAllCities: async (req, res, next) => {
    try {
      const cities = await Citizen.findAll({
        attributes: [
          [
            Citizen.sequelize.fn(
              "DISTINCT",
              Citizen.sequelize.col("address_city")
            ),
            "address_city",
          ],
        ],
        order: [["address_city", "ASC"]],
      });

      return res.status(200).json(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      next(error);
    }
  },

  // Get citizen by UID
  getByUid: async (req, res, next) => {
    try {
      const { uid } = req.params;

      const citizen = await Citizen.findByPk(uid);

      if (!citizen) {
        throw new BadRequestError("Citizen not found");
      }

      return res.status(200).json(citizen);
    } catch (error) {
      next(error);
    }
  },

  // Get citizen by national identifier
  getByNationalId: async (req, res, next) => {
    try {
      const { nationalId } = req.params;

      const citizen = await Citizen.findOne({
        where: { national_identifier: nationalId },
      });

      if (!citizen) {
        throw new BadRequestError("Citizen not found");
      }

      return res.status(200).json(citizen);
    } catch (error) {
      next(error);
    }
  },

  // Update citizen
  update: async (req, res, next) => {
    try {
      const { uid } = req.params;

      const schema = Yup.object().shape({
        national_identifier: Yup.string(),
        first: Yup.string(),
        last: Yup.string(),
        mother_first: Yup.string(),
        father_first: Yup.string(),
        gender: Yup.string().oneOf(["M", "F", "Male", "Female"]),
        birth_city: Yup.string(),
        date_of_birth: Yup.date(),
        id_registration_city: Yup.string(),
        id_registration_district: Yup.string(),
        address_city: Yup.string(),
        address_district: Yup.string(),
        address_neighborhood: Yup.string(),
        street_address: Yup.string(),
        door_or_entrance_number: Yup.string(),
        misc: Yup.string(),
      });

      if (!(await schema.isValid(req.body))) throw new ValidationError();

      const citizen = await Citizen.findByPk(uid);

      if (!citizen) {
        throw new BadRequestError("Citizen not found");
      }

      // Check if national_identifier is being updated and if it already exists
      if (
        req.body.national_identifier &&
        req.body.national_identifier !== citizen.national_identifier
      ) {
        const existingCitizen = await Citizen.findOne({
          where: { national_identifier: req.body.national_identifier },
        });

        if (existingCitizen) {
          throw new BadRequestError("National identifier already exists");
        }
      }

      await citizen.update(req.body);

      return res.status(200).json(citizen);
    } catch (error) {
      next(error);
    }
  },

  // Delete citizen
  delete: async (req, res, next) => {
    try {
      const { uid } = req.params;

      const citizen = await Citizen.findByPk(uid);

      if (!citizen) {
        throw new BadRequestError("Citizen not found");
      }

      await citizen.destroy();

      return res.status(200).json({ message: "Citizen deleted successfully" });
    } catch (error) {
      next(error);
    }
  },

  // Search citizens by name or multiple criteria
  searchByName: async (req, res, next) => {
    try {
      const { query, page = 1, limit = 10 } = req.query;

      if (!query) {
        throw new ValidationError("Search query is required");
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Citizen.findAndCountAll({
        where: {
          [Op.or]: [
            { first: { [Op.iLike]: `%${query}%` } },
            { last: { [Op.iLike]: `%${query}%` } },
            { mother_first: { [Op.iLike]: `%${query}%` } },
            { father_first: { [Op.iLike]: `%${query}%` } },
            { national_identifier: { [Op.iLike]: `%${query}%` } },
            { birth_city: { [Op.iLike]: `%${query}%` } },
            { address_city: { [Op.iLike]: `%${query}%` } },
          ],
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ["first", "ASC"],
          ["last", "ASC"],
        ],
      });

      return res.status(200).json({
        citizens: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Advanced search with multiple filters
  advancedSearch: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        name,
        mother_name,
        father_name,
        birth_city,
        birth_date_from,
        birth_date_to,
        gender,
        address_city,
        national_identifier,
        ...otherFilters
      } = req.query;

      const offset = (page - 1) * limit;
      const whereCondition = {};

      // Name search (searches both first and last name)
      if (name) {
        whereCondition[Op.or] = [
          { first: { [Op.iLike]: `%${name}%` } },
          { last: { [Op.iLike]: `%${name}%` } },
        ];
      }

      // Parent name filters
      if (mother_name) {
        whereCondition.mother_first = { [Op.iLike]: `%${mother_name}%` };
      }
      if (father_name) {
        whereCondition.father_first = { [Op.iLike]: `%${father_name}%` };
      }

      // Location filters
      if (birth_city) {
        whereCondition.birth_city = birth_city;
      }
      if (address_city) {
        whereCondition.address_city = address_city;
      }

      // Gender filter
      if (gender) {
        whereCondition.gender = gender;
      }

      // National identifier
      if (national_identifier) {
        whereCondition.national_identifier = {
          [Op.iLike]: `%${national_identifier}%`,
        };
      }

      // Date of birth range
      if (birth_date_from || birth_date_to) {
        const dateCondition = {};

        if (birth_date_from) {
          dateCondition[Op.gte] = new Date(birth_date_from);
        }
        if (birth_date_to) {
          dateCondition[Op.lte] = new Date(birth_date_to);
        }

        whereCondition.date_of_birth = dateCondition;
      }

      const { count, rows } = await Citizen.findAndCountAll({
        where: whereCondition,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ["first", "ASC"],
          ["last", "ASC"],
        ],
      });

      return res.status(200).json({
        citizens: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default citizenController;
