import { User } from '../db/Schemas/User';
import { Roles } from '../enums/roles';
import { IUserModel } from '../types/userTypes';

const userModel: IUserModel = {
  createUser: async ({ username, fullName, telegramId, phoneNumber, role }) => {
    const newOrder = await User.create({ username, fullName, telegramId, phoneNumber, role });

    return newOrder;
  },

  getUserByTelegramId: async ({ telegramId }) => {
    return await User.findOne({ telegramId });
  },

  getUserById: async ({ _id }) => {
    return await User.findOne({ _id });
  },

  getAllAdmins: async () => {
    const allAdmins = await User.find({ role: Roles.ADMIN });

    return allAdmins;
  },
};

export { userModel };
