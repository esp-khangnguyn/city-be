"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add indexes for commonly queried fields to improve performance
    await queryInterface.addIndex("citizen", ["first", "last"], {
      name: "idx_citizen_name",
      type: "BTREE",
    });

    await queryInterface.addIndex("citizen", ["national_identifier"], {
      name: "idx_citizen_national_id",
      unique: true,
      type: "BTREE",
    });

    await queryInterface.addIndex("citizen", ["birth_city"], {
      name: "idx_citizen_birth_city",
      type: "BTREE",
    });

    await queryInterface.addIndex("citizen", ["address_city"], {
      name: "idx_citizen_address_city",
      type: "BTREE",
    });

    await queryInterface.addIndex("citizen", ["gender"], {
      name: "idx_citizen_gender",
      type: "BTREE",
    });

    await queryInterface.addIndex("citizen", ["date_of_birth"], {
      name: "idx_citizen_date_of_birth",
      type: "BTREE",
    });

    await queryInterface.addIndex("citizen", ["mother_first"], {
      name: "idx_citizen_mother_first",
      type: "BTREE",
    });

    await queryInterface.addIndex("citizen", ["father_first"], {
      name: "idx_citizen_father_first",
      type: "BTREE",
    });

    // Composite index for address fields that are often searched together
    await queryInterface.addIndex(
      "citizen",
      ["address_city", "address_district", "address_neighborhood"],
      {
        name: "idx_citizen_address_composite",
        type: "BTREE",
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all indexes
    await queryInterface.removeIndex("citizen", "idx_citizen_name");
    await queryInterface.removeIndex("citizen", "idx_citizen_national_id");
    await queryInterface.removeIndex("citizen", "idx_citizen_birth_city");
    await queryInterface.removeIndex("citizen", "idx_citizen_address_city");
    await queryInterface.removeIndex("citizen", "idx_citizen_gender");
    await queryInterface.removeIndex("citizen", "idx_citizen_date_of_birth");
    await queryInterface.removeIndex("citizen", "idx_citizen_mother_first");
    await queryInterface.removeIndex("citizen", "idx_citizen_father_first");
    await queryInterface.removeIndex(
      "citizen",
      "idx_citizen_address_composite"
    );
  },
};
