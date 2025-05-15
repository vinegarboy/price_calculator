class Product {
	amount;
	sold_amount = 0;
	price;
	name;
	sales = 0;
	cost;
	present_amount = 0;

	constructor(name, amount, price, cost) {
		this.name = name;
		this.amount = amount;
		this.price = price;
		this.cost = cost;
	}

	Sold_product(sold_value) {
		if (isNaN(sold_value) || sold_value <= 0) {
			throw new Error("売れた数量は正の数でなければなりません。");
		}
		if (sold_value > this.GetRest()) {
			throw new Error("在庫が足りません。");
		}
		this.sold_amount += sold_value;
	}

    Return_product(Back_value){
        if (isNaN(Back_value) || Back_value <= 0) {
			throw new Error("戻る数量は正の数でなければなりません。");
		}
		if (this.sold_amount-Back_value < 0) {
			throw new Error("在庫を超過しています。");
		}
        this.sold_amount -= Back_value;
    }

	GetSales() {
		return this.sold_amount * this.price - this.amount * this.cost - (this.cost) * this.present_amount;
	}

	GetSimpleSales() {
		return (this.sold_amount - this.present_amount) * this.price;
	}

	GetCost() {
		return this.amount * this.cost;
	}

	SetPresent(amount) {
		if (isNaN(amount) || amount <= 0) {
			throw new Error("プレゼント数は正の数でなければなりません。");
		}
		if (amount > this.GetRest()) {
			throw new Error("在庫が足りないため、プレゼントできません。");
		}
		this.present_amount += amount;
	}

	// プレゼント数量を戻す関数
	ReturnPresent(amount) {
		if (isNaN(amount) || amount <= 0) {
			throw new Error("戻すプレゼント数量は正の数でなければなりません。");
		}
		if (this.present_amount - amount < 0) {
			throw new Error("戻すプレゼント数量が不足しています。");
		}
		this.present_amount -= amount;
	}

	GetRest() {
		return this.amount - this.sold_amount -this.present_amount;
	}
}
