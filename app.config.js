module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  return {
    ...config,
    ios: {
      ...config.ios,
      bundleIdentifier: 'com.btlcomputerstore.mobile',
      ...(googleMapsApiKey
        ? { config: { ...config.ios?.config, googleMapsApiKey } }
        : {}),
    },
    android: {
      ...config.android,
      package: 'com.btlcomputerstore.mobile',
      ...(googleMapsApiKey
        ? {
            config: {
              ...config.android?.config,
              googleMaps: { apiKey: googleMapsApiKey },
            },
          }
        : {}),
    },
    plugins: [
      ...(config.plugins || []),
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Cho phép BTL Computer Store dùng vị trí để chọn địa chỉ giao hàng.',
        },
      ],
    ],
  };
};

