export const isCommand = (body: string) => {
  const regex = new RegExp(`^\/stock=`, 'i');
  return !!regex.exec(body);
};
