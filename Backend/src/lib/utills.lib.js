import jwt from 'jsonwebtoken'

const generateToken = (userId) =>{
  const token =  jwt.sign({userId}, process.env.JWT_SECRETE_KEY)
  return token
}


export {generateToken}