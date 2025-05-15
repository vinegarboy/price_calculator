let all_product = [];
const CHECK_SVG = './svg/check_circle_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg';
const WARNING_SVG = './svg/warning_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg';

//以下イベント類の定義
document.getElementById('save').addEventListener('click',function (){
	const serialized = JSON.stringify(all_product.map(product => ({
		name: product.name,
		amount: product.amount,
		sold_amount: product.sold_amount,
		price: product.price,
		sales: product.sales,
		cost: product.cost,
		present_amount: product.present_amount
	})));

	setCookie("all_product", serialized, 365);
	showCustomToast(CHECK_SVG,'保存完了','Cookieにデータを保存しました!!<br>1年以上使用しないと消えますのでご注意ください。');
});

document.getElementById('load').addEventListener('click',function(){
	if(all_product.length != 0){
		var result = confirm('既に存在しているデータを上書きしてしまいますが、よろしいですか？');
		if(!result) {
			return;
		}
	}
	const data = getCookie("all_product");
	if (!data) return;
	const parsed = JSON.parse(data);
	all_product = parsed.map(p => {
		const prod = new Product(p.name, p.amount, p.price, p.cost);
		prod.sold_amount = p.sold_amount;
		prod.sales = p.sales;
		prod.present_amount = p.present_amount;
		return prod;
	});
	showCustomToast(CHECK_SVG,'読み込み完了','Cookieからデータを呼び出しました!!');
	load_render();
});

document.getElementById("form_save").addEventListener("click", function () {
	const name = document.getElementById("form_name").value.trim();
	const cost = parseFloat(document.getElementById("form_cost").value);
	const price = parseFloat(document.getElementById("form_price").value);
	const amount = parseInt(document.getElementById("form_amount").value);

	// バリデーションチェック
	if (!name) {
		showCustomToast(WARNING_SVG, 'Error', "商品名を入力してください。",'danger');
		return;
	}
	if (isNaN(cost) || cost < 0) {
		showCustomToast(WARNING_SVG, 'Error', "単品のコストには0以上の数値を入力してください。",'danger');
		return;
	}
	if (isNaN(price) || price < 0) {
		showCustomToast(WARNING_SVG, 'Error', "値段には0以上の数値を入力してください。",'danger');
		return;
	}
	if (isNaN(amount) || amount <= 0) {
		showCustomToast(WARNING_SVG, 'Error', "在庫数には1以上の整数を入力してください。",'danger');
		return;
	}

	// Productインスタンス作成して追加
	const product = new Product(name, amount, price, cost);
	all_product.push(product);
	showCustomToast(CHECK_SVG,'追加完了','商品をリストに追加しました！<br>※保存はされてないので気を付けてください。');
	// フォームを空にする
	resetFormInputs();
	load_render();
});

document.getElementById("sold_submit").addEventListener("click", function () {
	// 選択された商品を取得
	const select = document.getElementById("product");
	const selectedProductName = select.value;

	// 売れた数量を取得
	const soldAmount = parseInt(document.getElementById("sold_amount").value);

	// バリデーション：売れた数量が有効かどうか
	if (isNaN(soldAmount)|| soldAmount <= 0) {
		showCustomToast(WARNING_SVG, 'Error', "正の数値を入力してください",'danger');
		return;
	}

	// 選ばれた商品が存在するかを確認
	const product = all_product.find(p => p.name === selectedProductName);
	if (!product) {
		showCustomToast(WARNING_SVG, 'Error', "選ばれた商品が存在しません。",'danger');
		return;
	}

	// 売れた数量が在庫より多くないか確認
	if (soldAmount > product.GetRest()) {
		showCustomToast(WARNING_SVG, 'Error', "在庫が足りません。",'danger');
		return;
	}

	product.Sold_product(soldAmount);
	// 商品の Sold_product メソッドを使って数量を更新

	// 成功メッセージ
	showCustomToast(CHECK_SVG, 'Complete',`商品「${product.name}」が ${soldAmount} 個売れました。`);

	// 必要に応じてフォームをリセットする
	document.getElementById("sold_amount").value = "";

	// 更新後の商品リストを再描画する
	load_render(); // 商品のリストを再描画
});

document.getElementById("return_submit").addEventListener("click", function () {
	// 選択された商品を取得
	const select = document.getElementById("product");
	const selectedProductName = select.value;

	// 戻す数量を取得
	const returnAmount = parseInt(document.getElementById("sold_amount").value);

	// バリデーション：戻す数量が有効かどうか
	if (isNaN(returnAmount) || returnAmount <= 0) {
		showCustomToast(WARNING_SVG, 'Error', "正の数値を入力してください",'danger');
		return;
	}

	// 選ばれた商品が存在するかを確認
	const product = all_product.find(p => p.name === selectedProductName);
	if (!product) {
		showCustomToast(WARNING_SVG, 'Error', "選ばれた商品が存在しません。",'danger');
		return;
	}

	// 戻す数量が売れた数量を超えていないか確認
	if (returnAmount > product.sold_amount) {
		showCustomToast(WARNING_SVG, 'Error', "返品する数量が売れた数量を超過しています。",'danger');
		return;
	}

	// 返品処理
	product.Return_product(returnAmount);

	// 成功メッセージ
	showCustomToast(CHECK_SVG, 'Complete',`商品「${product.name}」が ${returnAmount} 個返品されました。`);

	// 必要に応じてフォームをリセットする
	document.getElementById("sold_amount").value = "";

	// 更新後の商品リストを再描画する
	load_render(); // 商品のリストを再描画
});

document.getElementById("present_submit").addEventListener("click", function () {
	// 選択された商品を取得
	const select = document.getElementById("product");
	const selectedProductName = select.value;

	// プレゼント数量を取得
	const presentAmount = parseInt(document.getElementById("sold_amount").value);

	// バリデーション：プレゼント数量が有効かどうか
	if (isNaN(presentAmount) || presentAmount <= 0) {
		showCustomToast(WARNING_SVG, 'Error', "正の数値を入力してください",'danger');
		return;
	}

	// 選ばれた商品が存在するかを確認
	const product = all_product.find(p => p.name === selectedProductName);
	if (!product) {
		showCustomToast(WARNING_SVG, 'Error', "選ばれた商品が存在しません。",'danger');
		return;
	}

	// プレゼント数量が在庫より多くないか確認
	if (presentAmount > product.GetRest()) {
		showCustomToast(WARNING_SVG, 'Error', "在庫が足りません。",'danger');
		return;
	}

	// プレゼント贈与処理
	product.SetPresent(presentAmount);

	// 成功メッセージ
	showCustomToast(CHECK_SVG, 'Complete',`商品「${product.name}」が ${presentAmount} 個プレゼントされました。`);

	// 必要に応じてフォームをリセットする
	document.getElementById("sold_amount").value = "";

	// 更新後の商品リストを再描画する
	load_render(); // 商品のリストを再描画
});

document.getElementById("present_back_submit").addEventListener("click", function () {
	// 選択された商品を取得
	const select = document.getElementById("product");
	const selectedProductName = select.value;

	// プレゼント返却数量を取得
	const returnPresentAmount = parseInt(document.getElementById("sold_amount").value);

	// バリデーション：返却数量が有効かどうか
	if (isNaN(returnPresentAmount) || returnPresentAmount <= 0) {
		showCustomToast(WARNING_SVG, 'Error', "正の数値を入力してください",'danger');
		return;
	}

	// 選ばれた商品が存在するかを確認
	const product = all_product.find(p => p.name === selectedProductName);
	if (!product) {
		showCustomToast(WARNING_SVG, 'Error',"選ばれた商品が存在しません。" ,'danger');
		return;
	}

	// 返却する数量がプレゼント数量を超えていないか確認
	if (returnPresentAmount > product.present_amount) {
		showCustomToast(WARNING_SVG, 'Error',"返却するプレゼント数量が足りません。",'danger' );
		return;
	}

	// プレゼント返却処理
	product.ReturnPresent(returnPresentAmount);

	// 成功メッセージ
	showCustomToast(CHECK_SVG, 'Complete',`商品「${product.name}」のプレゼントが ${returnPresentAmount} 個返却されました。`);

	// 必要に応じてフォームをリセットする
	document.getElementById("sold_amount").value = "";

	// 更新後の商品リストを再描画する
	load_render(); // 商品のリストを再描画
});

//以下レンダーに関する関数群
function resetFormInputs() {
	document.getElementById("form_name").value = "";
	document.getElementById("form_cost").value = "";
	document.getElementById("form_price").value = "";
	document.getElementById("form_amount").value = "";
}

function load_render(){
	renderProductOptions();
	renderProductTable();
	renderViewSales();
}

function renderProductTable() {
    const tableBody = document.querySelector("#view_table tbody");
    tableBody.innerHTML = "";  // 既存の内容をクリア

    all_product.forEach((product, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index+1}</td>  <!-- ID: 配列のインデックス -->
            <td>${product.name}</td>
            <td>¥${product.price}</td>
            <td>${product.GetRest()}</td>  <!-- 残り在庫 -->
            <td>¥${product.GetSales()}</td>  <!-- 売上 -->
            <td>${product.sold_amount}</td>
			<td>${product.present_amount}</td>  <!-- プレゼント数 -->
            <td>¥${product.cost}</td>  <!-- 生産コスト -->
            <td>${product.amount}</td>  <!-- 総生産量 -->
			<td><button class="btn btn-success" onclick='submit_increase_sales(all_product[${index}]);'>1個販売</button></td>
			<td><button class="btn btn-success" onclick='submit_increase_present(all_product[${index}]);'>1個プレゼント</button></td>
			<td><button class="btn btn-danger" onclick='submit_decrease_sales(all_product[${index}]);'>1個返品</button></td>
			<td><button class="btn btn-danger" onclick='submit_decrease_present(all_product[${index}]);'>1個プレゼント返却</button></td>
			<td><button class="btn btn-danger" onclick='submit_delete_product(all_product[${index}]);'>削除</button></td>
			`;
        tableBody.appendChild(row);
    });
}

function renderViewSales(){
	const sales_tag = document.getElementById('view_sales');
	let all_sales = 0;
	all_product.forEach(product => {
		all_sales = all_sales + product.GetSales();
	});
	if(all_sales == 0){
		sales_tag.innerHTML = '情報が登録されていません。';
	}else{
		sales_tag.innerHTML = '現在の総売り上げは'+all_sales+'円です。';
	}
}

function renderProductOptions() {
	const select = document.getElementById("product");
	select.innerHTML = ""; // 既存のoptionをクリア

	all_product.forEach(product => {
		const option = document.createElement("option");
		option.textContent = `${product.name}(残在庫:${product.GetRest()})`;
		option.value = product.name;
		select.appendChild(option);
	});
}

function showCustomToast(svgUrl, title, message, headerType = 'success') {
    const toastId = 'toast_' + Date.now();

    // トースト全体を作成
    const toast = document.createElement('div');
    toast.className = 'toast border-0 shadow-sm mb-2 fade';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.id = toastId;

    // .bg-success か .bg-danger を動的に設定
    const bgClass = headerType === 'danger' ? 'bg-danger text-white' : 'bg-success text-white';

    toast.innerHTML = `
        <div class="toast-header ${bgClass}">
            <img src="${svgUrl}" class="rounded me-2" alt="icon" style="width: 20px; height: 20px; object-fit: contain;">
            <strong class="me-auto">${title}</strong>
            <small class="text-body-secondary">just now</small>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;

    const container = document.getElementById('toastContainer');
    container.appendChild(toast);

    // Bootstrap Toast インスタンス
    const bsToast = new bootstrap.Toast(toast, {
        delay: 1500,
        autohide: true
    });

    bsToast.show();
}

//こっからボタン用疑似イベント関数
function submit_increase_sales(product){
	try{
		product.Sold_product(1);
		load_render();
		showCustomToast(CHECK_SVG,'Complete',`${product.name}を1個販売しました。`);
	}catch(e){
		showCustomToast(WARNING_SVG,'Error',`エラーが発生しました。<br>${e}`,'danger')
	}
}

function submit_decrease_sales(product){
	try{
		product.Return_product(1);
		load_render();
		showCustomToast(CHECK_SVG,'Complete',`${product.name}を1個返却しました。`);
	}catch(e){
		showCustomToast(WARNING_SVG,'Error',`エラーが発生しました。<br>${e}`,'danger')
	}
}

function submit_increase_present(product){
	try{
		product.SetPresent(1);
		load_render();
		showCustomToast(CHECK_SVG,'Complete',`${product.name}を1個プレゼントしました。`);
	}catch(e){
		showCustomToast(WARNING_SVG,'Error',`エラーが発生しました。<br>${e}`,'danger')
	}
}

function submit_decrease_present(product){
	try{
		product.ReturnPresent(1);
		load_render();
		showCustomToast(CHECK_SVG,'Complete',`${product.name}を1個返却されました。`);
	}catch(e){
		showCustomToast(WARNING_SVG,'Error',`エラーが発生しました。<br>${e}`,'danger')
	}
}

function submit_delete_product(product){
	var result = confirm('本当に削除してもよろしいでしょうか？');
	if(!result) {
		return;
	}
	const name = product.name;
	all_product = all_product.filter((item)=>{
		return item !== product;
	});
	load_render();
	showCustomToast(CHECK_SVG,'削除完了',`商品${name}を削除しました。`);
}