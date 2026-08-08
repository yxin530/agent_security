const User = sequelize.define('User', {
  nric: DataTypes.STRING,
  deletedAt: DataTypes.DATE
}, { paranoid: true });
