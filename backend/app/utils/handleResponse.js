export const handleResponse = (res, statusCode, message, data = null) => {
  const success = statusCode >= 200 && statusCode < 300;

  const sanitize = (item) => {
    if (!item) return item;
    const obj = item.toObject?.() || item;
    const { createdAt, updatedAt, __v, ...cleaned } = obj;
    return cleaned;
  };

  let sanitizedData = null;

  if (Array.isArray(data)) {
    sanitizedData = data.map(sanitize);
  } else if (data !== null) {
    sanitizedData = sanitize(data);
  }

  const response = {
    success,
    message,
  };

  if (!success) response.error = true;

  if (sanitizedData !== null) {
    response.data = sanitizedData;
  }

  return res.status(statusCode).json(response);
};
