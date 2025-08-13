/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: '**.cnn.com' },
			{ protocol: 'https', hostname: '**.cbssports.com' },
			{ protocol: 'https', hostname: '**.cbsistatic.com' },
			{ protocol: 'https', hostname: '**.twimg.com' },
			{ protocol: 'https', hostname: '**.akamaihd.net' },
			{ protocol: 'https', hostname: '**.giphy.com' },
			{ protocol: 'https', hostname: '**.cloudfront.net' },
			{ protocol: 'https', hostname: '**.imgur.com' },
			{ protocol: 'https', hostname: '**.staticflickr.com' },
			{ protocol: 'https', hostname: '**.ytimg.com' },
			{ protocol: 'https', hostname: '**.googleusercontent.com' },
		],
	},
};

export default nextConfig;
