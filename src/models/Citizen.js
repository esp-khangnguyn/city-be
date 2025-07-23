import { Model, DataTypes } from "sequelize";

class Citizen extends Model {
  static init(sequelize) {
    return super.init(
      {
        uid: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        national_identifier: DataTypes.STRING,
        first: DataTypes.STRING,
        last: DataTypes.STRING,
        mother_first: DataTypes.STRING,
        father_first: DataTypes.STRING,
        gender: DataTypes.STRING,
        birth_city: DataTypes.STRING,
        date_of_birth: DataTypes.DATEONLY,
        id_registration_city: DataTypes.STRING,
        id_registration_district: DataTypes.STRING,
        address_city: DataTypes.STRING,
        address_district: DataTypes.STRING,
        address_neighborhood: DataTypes.STRING,
        street_address: DataTypes.STRING,
        door_or_entrance_number: DataTypes.STRING,
        misc: DataTypes.TEXT,
      },
      {
        sequelize,
        modelName: "Citizen",
        tableName: "citizen",
        timestamps: false,
      }
    );
  }

  static associate(models) {
    // nếu có quan hệ thì define ở đây
    // ví dụ: this.belongsTo(models.User, { foreignKey: 'userId' });
  }
}

export default Citizen;
