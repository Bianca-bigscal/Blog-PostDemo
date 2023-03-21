module.exports = {
  async up(db, client) {
    const roles = [
      {
        rolename: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      },
      {
        rolename: 'superadmin',
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      },
      {
        rolename: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      }
    ]
    await db.collection('tbroles').insertMany(roles)
  },

  async down(db, client) {
    await db.collection('tbroles').deleteMany([{ name: 'admin' }, { name: 'superadmin' }, { name: 'user' }])
  }
};