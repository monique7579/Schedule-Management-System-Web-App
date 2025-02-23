export class HomeModel {
    numberList = [];

    getNumberList() {
        return this.numberList;
    }

    //business logic
    addNumber(number) {
        this.numberList.push(number);
    }

    reset() {
        this.numberList = [];
    }
}