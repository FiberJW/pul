import { NetInfo } from 'react-native';

export default async () => {
  return await NetInfo.isConnected.fetch();
};
