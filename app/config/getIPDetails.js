const { IPinfoWrapper } = require("node-ipinfo");

const ipinfo = new IPinfoWrapper("d248976576a4e2");


async function getPublicIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        console.log('Your Public IP Address:', data.ip);
        return data.ip;
    } catch (error) {
        console.error('Error fetching public IP:', error);
        return null;
    }
  }
exports.lookupIp = async () => {
    const ip = await getPublicIP();
    // Reference Website: https://ipinfo.io/account/home?service=google&loginState=create
    return ipinfo.lookupIp(ip);
}
