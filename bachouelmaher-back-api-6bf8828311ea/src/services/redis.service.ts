const RedisService = {
  incCreateIfNotExist: async (key: string, val: number) => {
    const value = await ClientRedis.get(key)
    if(value) {
      return await ClientRedis.incrBy(key , val)
    } else {
      await ClientRedis.incrBy(key , val)
      return val
    }
  },
  incKeyByValue: async (key: string, value: number) => {
    return await ClientRedis.incrBy(key , value)
  },
  getValueByKey: async (key: string) => {
    return await ClientRedis.get(key)
  }
}
export default RedisService;
