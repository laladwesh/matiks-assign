async function redisRequests(userId , limit , windowseconds){
    const now = Date.now();
    const lastSeconds = now - windowseconds * 1000;
    const key = userId;
    await redis.zadd(key , {
        score: now,
        value: now.toString()
    })

    await redis.zRemRangeByScore(key , 0 , lastSeconds);
    const currReqs = await redis.zCard(key);

    await redis.expire(key , windowseconds)

    if(currReqs > limit){
        return false;
    }
    return true;
}