export class HomeModel {
    months = ["January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",];

    today = new Date();
    month = this.months[this.today.getMonth()];

    
}