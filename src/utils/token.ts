import jwt from 'jsonwebtoken'

class JWToken {
    static getAccessToken(data: any) {
        return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET!,{expiresIn:"1h"})
    }

    static getRefreshToken(data: any) {
        return jwt.sign(data, process.env.REFRESH_TOKEN_SECRET!,{expiresIn:"3 day"})
    }

    static verifyToken(token: string, secret: string): any {
        return jwt.verify(token, secret, (err, data)=>{
            if(err){
                return undefined
            }
            return data
        });
    }
}

export default JWToken;