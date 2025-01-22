const removeSpaces = (str: string): string => str.split(" ").join("").toLowerCase();
const dateFormat = (timestamp: number) => {
  if (!timestamp) {
    return null;
  }
  const month = new Date(timestamp).toLocaleString("en-CA", { month: "short" });
  const day = new Date(timestamp).getDate();
  let hours: string | number = new Date(timestamp).getHours();
  let minutes: string | number = new Date(timestamp).getMinutes();

  if (hours >= 0 && hours <= 9) {
    hours = "0" + hours;
  }
  if (minutes >= 0 && minutes <= 9) {
    minutes = "0" + minutes;
  }

  return `${hours}:${minutes}, ${month} ${day}`;
};

export { removeSpaces, dateFormat };
