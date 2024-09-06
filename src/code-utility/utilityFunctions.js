export function UTCDateToDateTimeString(UTCDate){
   
    const year= UTCDate.getFullYear();
    const month=UTCDate.getMonth() + 1;
    const day= UTCDate.getDate();
    let hours= UTCDate.getHours();
    let minutes=UTCDate.getMinutes();  
    minutes=(minutes<10?`0${minutes}`:minutes); //format minutes with leading zeros
    const meridian= (hours <= 11 ? "AM":"PM") ;   
    hours=(hours <=12 ? hours: hours-12); //convert hours to local date
   return `${day}/${month}/${year}, ${hours}:${minutes} ${meridian}`;
  }
