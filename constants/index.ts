import home from "@/assets/icons/home.png"
import list from "@/assets/icons/list.png";
import chat from "@/assets/icons/chat.png";
import profile from "@/assets/icons/profile.png";
import tricycleInfo from "@/assets/images/tricycleInfo.png";
import tricycleOrbit from "@/assets/images/tricycleOrbit.png";
import tricycle from "@/assets/images/tricycle.jpg";
import tricyclefront from "@/assets/images/tricyclefront.png";
import check from "@/assets/images/check.png";
import noResult from "@/assets/images/no-result.png";
import message from "@/assets/images/message.png";
import slideshowFirst from "@/assets/images/tricycleInfo.png";
import slideshowSecond from "@/assets/images/tricycleOrbit.png";
import slideshowThird from "@/assets/images/tricyclefront.png";
import signUpTricycle from "@/assets/images/tricycle.jpg";
import person from "@/assets/icons/person.png";
import email from "@/assets/icons/email.png";
import lock from "@/assets/icons/lock.png";
import track from "@/assets/icons/track.png";
import selectedMarker from "@/assets/icons/selected-marker.png";
import marker from "@/assets/icons/marker.png";
import backArrow from "@/assets/icons/back-arrow.png";
import out from "@/assets/icons/out.png";


export const images = {
    tricycleInfo,
    tricycleOrbit,
    tricycle,
    tricyclefront,
    check,
    noResult,
    message,
    slideshowFirst,
    slideshowSecond,
    slideshowThird,
    signUpTricycle,
   
  };





export const icons = {
home,
list,
chat,
profile,
person,
email,
lock,
track,
selectedMarker,
marker,
backArrow,
out,
};




export const onboarding = [
    {
      id: 1,
      title: "The perfect ride is just a tap away!",
      description:
        "Your journey begins with Ryde. Find your ideal ride effortlessly.",
      image: images.slideshowFirst,
    },
    {
      id: 2,
      title: "Best tricycle in your hands with Ryde",
      description:
        "Discover the convenience of finding your perfect ride with Tricycle",
      image: images.slideshowSecond,
    },
    {
      id: 3,
      title: "Your ride, your way. Let's go!",
      description:
        "Enter your destination, sit back, and let us take care of the rest.",
      image: images.slideshowThird,
    },
  ];
  


  export const data = {
    onboarding,
  }