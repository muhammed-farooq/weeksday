
const arr = [1,2,3,5,1,2,3,5,5]
const printed = [];

for (let i = 0; i < arr.length; i++) {
    for (let j = i+1; j < arr.length; j++) {
        if (arr[i]==arr[j] && arr[i] != '*') {
            console.log(arr[i]);
            arr[j] = "*";
        }
    }
}
{/* <i class="fa-solid fa-cart-shopping"></i>
                <i class="fa-solid fa-truck-fast"></i> */}