module.exports = {
  async up(db, client) {
    const role = await db.collection('tbroles').findOne({ rolename: 'superadmin' })
    const superadmin = {
      fullName: "admin",
      userName: "system",
      email: "admin@gmail.com",
      password: "1424054bf84031c33f330f6639a12bbd", // Password is :123456
      roleIDFK: role._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedBy: false,
      deletedAt: null,
      __v: 0
    }
    await db.collection('tbusers').insertOne(superadmin)
  },

  async down(db, client) {
    await db.collection('tbusers').deleteOne({ email: 'admin@gmail.com' })
  }
};
