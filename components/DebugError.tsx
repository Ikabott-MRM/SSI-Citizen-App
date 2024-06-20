import { Text } from 'react-native';

const DebugError = ({ error }: { error: Error }) => {
  let formattedError;

  try {
    if (typeof error === 'string') {
      formattedError = JSON.parse(error);
    } else {
      formattedError = error;
    }
  } catch (e) {
    formattedError = error;
  }

  return (
    <Text>
      {typeof formattedError === 'object'
        ? JSON.stringify(formattedError, null, 2)
        : formattedError}
    </Text>
  );
};

export { DebugError };
