//Firestore
import firestore from '@react-native-firebase/firestore';
const profilesCollection = firestore().collection('profiles')

const getProfilebyMobileNumber = async (mobile) => {
    var profiles = []
    var response = await profilesCollection.where("mobile", '==', mobile).get()

    if (response.empty) {
        return profiles
    }

    profiles = response.docs.map((doc) => doc.data())

    return profiles
}

const getAllProfiles = async () => {
    var allProfiles = []
    var response = await profilesCollection.get();
    if (!response.empty) {
        response.docs.forEach((object) => {
            allProfiles.push(object.data())
        })
        return allProfiles
    } else {
        return []
    }
}

const getProfileDetails = async (idx) => {
    var profileDetails = {}
    //Theres only single profile
    var response = await profilesCollection.get();
    if (!response.empty) {
        profileDetails = { ...response.docs[idx].data(), documentId: response.docs[idx].ref.id }
        return profileDetails
    } else {
        return profileDetails
    }
}

const createProfile = async (data) => {
    try {
        const totalProfiles = await profilesCollection.get()
        if (totalProfiles.size == 3) {
            return 0
        }

        var profileData = {
            mobile: parseInt(data.mobile),
            companyName: data.companyName,
            photo: null,
            email: "",
            about: "",
            personalName: "",
        }

        const lastProfile = await profilesCollection.orderBy("pId", "asc").limitToLast(1).get()

        if (lastProfile.empty) {
            const profileCreateResponse = await profilesCollection.add({
                ...profileData,
                pId: 'P01'
            });

            return 1
        }

        const lastProfileData = lastProfile.docs[0].data()
        var lastProfileId = lastProfileData.pId
        var newProfileId = String(parseInt(lastProfileId.substring(1)) + 1).length < 2 ? "P" + String(parseInt(lastProfileId.substring(1)) + 1).padStart(2, 0) : "P" + String(parseInt(lastProfileId.substring(1)) + 1)

        const profileCreateResponse = await profilesCollection.add({
            ...profileData,
            pId: newProfileId
        });

        return 1
    } catch (error) {
        console.log(error)
    }
}

const updateProfileDetails = async (data) => {
    //first Get the Data and Update
    await profilesCollection.doc(data.documentId).update({ about: data.about, personalName: data.personalName, photo: data.photo, email: data.email });

    return 1
}

export {
    getProfilebyMobileNumber,
    getAllProfiles,
    getProfileDetails,
    createProfile,
    updateProfileDetails,
}