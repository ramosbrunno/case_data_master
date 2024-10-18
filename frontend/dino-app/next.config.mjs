/** @type {import('next').NextConfig} */
const nextConfig = {env: {
    AZURE_STORAGE_ACCOUNT_NAME: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    AZURE_STORAGE_ACCOUNT_KEY : process.env.AZURE_STORAGE_ACCOUNT_KEY,
    AZURE_STORAGE_CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME
  },}

export default nextConfig;
