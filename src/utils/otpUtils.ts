const otpStore: { [key: string]: { otp: string, expiresAt: number } } = {}

export const storeOtp = (email: string) => {
    console.log(otpStore)
    const otp=Math.floor(100000 + Math.random() * 900000).toString()
    otpStore[email]={otp, expiresAt: Date.now() + 5 * 60 * 1000}
    return otp
}

export const verifyOtp=(email:string,otp:string)=>{
    const data= otpStore[email]

    if(!data || Date.now()> data.expiresAt || data.otp !== otp) return false

    return true
}

export const removeOtp=(email:string)=>{
    delete otpStore[email]
}