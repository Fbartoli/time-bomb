export const truncateAddress = (address: string) => {
    if (!address) return "";
    console.log(address)
    return `${address.slice(0, 14)}...${address.slice(-12)}`;
  };