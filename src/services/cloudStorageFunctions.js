import storage from '@react-native-firebase/storage';
//Library to Compress Image
import { Image as ImageCompressor } from 'react-native-compressor';


const uploadPhoto = async (uploadFor, prefix, suffix, pathtoFile) => {
    //Upload for Should be either one of These
    // userProfileImages || customerProfileImages || transactionsImages
    try {
        //First Compress the Image
        // Compress the image with manual settings
        const compressedImage = await ImageCompressor.compress(pathtoFile, {
            compressionMethod: 'manual',
            maxWidth: 800,  // Maximum width of the compressed image
            maxHeight: 600,  // Maximum height of the compressed image
            quality: 0.5,  // Image quality (0 to 1)
            type: 'jpg',  // Image format
        });

        //Upload the Photo to Cloud Storage
        const reference = storage().ref(`/${uploadFor}/${prefix}${suffix}.jpg`);
        // uploads file
        const task = await reference.putFile(compressedImage);

        const url = await storage().ref(`/${uploadFor}/${prefix}${suffix}.jpg`).getDownloadURL();

        if (url) {
            var uploadedPhotoURL = url

            return uploadedPhotoURL
        }

        return ''
    } catch (error) {
        console.log(error)
        return ''
    }
}

export {
    uploadPhoto
}