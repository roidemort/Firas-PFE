const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const randomString = function (l: number) {
  const domain = 'abcdefghijklmnopqrstuvwxyz1234567890';
  let result = '';
  for (let i = 0; i < l; i++) {
    const index = Math.floor(Math.random() * domain.length);
    result += domain[index];
  }
  return result;
};


export const generateToken = function (length: number) {
  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const getPercentage = (value: number, percent: number)=> {
  return value * (percent / 100);
}