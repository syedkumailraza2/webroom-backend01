import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (buffer, fileType) => {
    try {
        console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
        console.log(`Cloud API: ${process.env.CLOUDINARY_API_KEY}`);
        console.log(`Cloud Secret: ${process.env.CLOUDINARY_API_SECRET}`);

        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { 
                    resource_type: 'image', // Use 'raw' for PDFs
                    folder: 'uploads', // Optional: store files in a folder
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            stream.end(buffer);
        });
    } catch (error) {
        console.log('Error while uploading file on cloudinary:', error);
    }
};

export { uploadOnCloudinary };
