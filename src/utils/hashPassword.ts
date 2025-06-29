const myCrypto = require("crypto");

class PasswordTools {
    static generateSalt() {
        return myCrypto.randomBytes(16).toString("base64");
    }

    static encryptPassword(password: string, salt: string) {
        return myCrypto
        .createHash("RSA-SHA256")
        .update(password)
        .update(salt)
        .digest("hex");
    }

    static validatePassword(targetPassword: string, salt: string, hashedPassword: string) {
        return PasswordTools.encryptPassword(targetPassword, salt) === hashedPassword;
    };
}

export default PasswordTools;