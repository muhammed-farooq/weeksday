//// WISHLIST SCRIPT START

function addToWishlist(productId){
    
  fetch(`/wishlist/add?id=${productId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const modalBody = document.querySelector('.modal-body');
          modalBody.textContent = data.message;
          $('#myModal').modal('show');
          setTimeout(function() {
          $('#myModal').modal('hide');
          }, 5000); // 5000 milliseconds (5 seconds)
        }else{
          location.href ='/login'
        }
      })
      .catch(error => {
          console.error(error);
      });
  }


function removeWishlist(productId){
    fetch(`/wishlist/remove?productId=${productId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        const modalBody = document.querySelector('.modal-body');
        modalBody.textContent = data.message;
        const divToRemove = document.getElementById(productId);
        divToRemove.style.display = 'none';
        if(data.qua == 0){
          const divToShow = document.getElementById('noneitems');
          divToShow.style.display = 'block';
        }
        $('#myModal').modal('show');
        setTimeout(function() {
            $('#myModal').modal('hide');
        }, 5000); // 5000 milliseconds (5 seconds)
    })
    .catch(error => {
        console.error(error);
    });
}


//// WISHLIST SCRIPT END  
//// CART SCRIPT START

    // Get all the quantity inputs and buttons
    const quantityInputs = document.querySelectorAll('input[name="quantity"]');
    const minusButtons = document.querySelectorAll('.btn-minus');
    const plusButtons = document.querySelectorAll('.btn-plus');
    if(minusButtons.length  != 0){
      // Loop through each quantity input and attach event listeners
      quantityInputs.forEach((quantityInput, i) => {
        const max = parseInt(quantityInput.getAttribute('max'));
    
        // Attach event listener to the input
        quantityInput.addEventListener('input', () => {
            // Disable the minus button if the quantity is 1
            minusButtons[i].disabled = quantityInput.value <= 1;
            
            // Disable the plus button if the quantity is at the max
            plusButtons[i].disabled = quantityInput.value >= max;
        });
    
        // Attach event listener to the minus button
        minusButtons[i].addEventListener('click', () => {
            if (quantityInput.value > 1) {
            quantityInput.value--;
            minusButtons[i].disabled = quantityInput.value <= 1;
            plusButtons[i].disabled = quantityInput.value >= max;
            }
        });
    
        // Attach event listener to the plus button
        plusButtons[i].addEventListener('click', () => {
            if (quantityInput.value < max) {
            quantityInput.value++;
            minusButtons[i].disabled = quantityInput.value <= 1;
            plusButtons[i].disabled = quantityInput.value >= max;
            }
        });
    
        // Initialize the buttons based on the initial quantity value
        minusButtons[i].disabled = quantityInput.value <= 1;
        plusButtons[i].disabled = quantityInput.value >= max;
        });
      }




    const plusButton = document.querySelectorAll('.btn-plus');
    const minusButton = document.querySelectorAll('.btn-minus');
  
    plusButton.forEach((button) => {
      button.addEventListener('click', () => {
        const productId = button.id;
        fetch(`/cart/increment?productId=${productId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(data => {
            const productPrice = document.querySelector(`#product_${productId}_price`);
            productPrice.textContent = `$${data.total}.00`;
            const grandTotalcheck = document.querySelector('.grandtotalcheck span');
            if(grandTotalcheck){

              grandTotalcheck.textContent = `$${data.grand}.00`;
              const subTotalcheck = document.querySelector('.subtotalcheck span');
              subTotalcheck.textContent = `$${data.grand}.00`;
            }
            const grandTotal = document.querySelector('.grandtotal span');
            grandTotal.textContent = `$${data.grand}.00`;
            const subTotal = document.querySelector('.subtotal span');
            subTotal.textContent = `$${data.grand}.00`;
        })
        .catch(error => console.error(error));
      });
    });
  
    minusButton.forEach((button) => {
      button.addEventListener('click', () => {
        const productId = button.id;
        fetch(`/cart/decrement?productId=${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {

            const productPrice = document.querySelector(`#product_${productId}_price`);
            productPrice.textContent = `$${data.total}.00`;
            const grandTotalcheck = document.querySelector('.grandtotalcheck span');
            if(grandTotalcheck){

              grandTotalcheck.textContent = `$${data.grand}.00`;
              const subTotalcheck = document.querySelector('.subtotalcheck span');
              subTotalcheck.textContent = `$${data.grand}.00`;
            }
            const grandTotal = document.querySelector('.grandtotal span');
            grandTotal.textContent = `$${data.grand}.00`;
            const subTotal = document.querySelector('.subtotal span');
            subTotal.textContent = `$${data.grand}.00`;
        })
        .catch(error => console.error(error));
      });
    });

    function removecart(productId){

              fetch(`/cart/remove?productId=${productId}`, {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json'
                  }
              })
              .then(response => response.json())
              .then(data => {
                  const modalBody = document.querySelector('.modal-body');
                  modalBody.textContent = data.message;
                  const divToRemove = document.getElementById(productId);
                  divToRemove.style.display = 'none';
                  const grandTotalcheck = document.querySelector('.grandtotalcheck span');
                  if(grandTotalcheck){

                    grandTotalcheck.textContent = `$${data.grand}.00`;
                    const subTotalcheck = document.querySelector('.subtotalcheck span');
                    subTotalcheck.textContent = `$${data.grand}.00`;
                  }
                  const grandTotal = document.querySelector('.grandtotal span');
                  grandTotal.textContent = `$${data.grand}.00`;
                  const subTotal = document.querySelector('.subtotal span');
                  subTotal.textContent = `$${data.grand}.00`;
                  
                  
                  if(data.qua == 0){
                    const divToRemove1 = document.getElementById('checkout__order');
                    divToRemove1.style.display = 'none';
                    const divToShow1 = document.getElementById('shopbtn');
                    divToShow1.style.display = 'block';
                    const divToShow = document.getElementById('additemstocart');
                    divToShow.style.display = 'block';
                  }
                  $('#myModal').modal('show');
                  setTimeout(function() {
                      $('#myModal').modal('hide');
                  }, 5000); // 5000 milliseconds (5 seconds)
              })
              .catch(error => {
                  console.error(error);
              });
            }

    /// Cart SCRIPT END
$(document).ready(function() {
    $('#addressform').submit(function(e) {
      e.preventDefault();
  
      var error = false;
  
      // Validate full name
      var name = $('#name').val().trim();
        if (!name) {
          $('#name-error').text('Please enter your full name');
          error = true;
          $('#name')
      } else {
        $('#name-error').text('');
      }
  
      // Validate house name
      var housename = $('#housename').val().trim();
      if (!housename) {
        $('#housename-error').text('Please enter your house name');
        error = true;
      } else {
        $('#housename-error').text('');
      }
  
      // Validate pincode
      var pincode = $('#pincode').val().trim();
      var pincode_regex = /^[0-9]{6}$/;
      if (!pincode || !pincode_regex.test(pincode)) {
        $('#pincode-error').text('Please enter a valid 6-digit pincode');
        error = true;
      } else {
        $('#pincode-error').text('');
      }
  
      // Validate city
      var city = $('#city').val().trim();
      if (!city) {
        $('#city-error').text('Please enter your city');
        error = true;
      } else {
        $('#city-error').text('');
      }
  
      // Validate district
      var district = $('#district').val().trim();
      if (!district) {
        $('#district-error').text('Please enter your district');
        error = true;
      } else {
        $('#district-error').text('');
      }
        // Validate state
        var state = $('#state').val().trim();
        if (!state) {
            $('#state-error').text('Please enter your state');
            error = true;
        } else {
            $('#state-error').text('');
        }
    
      // Validate mobile number
      var mobilenumber = $('#mobilenumber').val().trim();
      var mobilenumber_regex = /^[0-9]{10}$/;
      if (!mobilenumber || !mobilenumber_regex.test(mobilenumber)) {
        $('#mobilenumber-error').text('Please enter a valid 10-digit mobile number');
        error = true;
      } else {
        $('#mobilenumber-error').text('');
      }
  
      // Validate email
      var email = $('#email').val().trim();
      var email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !email_regex.test(email)) {
        $('#email-error').text('Please enter a valid email address');
        error = true;
      } else {
        $('#email-error').text('');
      }
  
      // Submit the form if no errors
      if (!error) {
        this.submit();
      }
    });
  });


  $(document).ready(function() {
    $('#orderform').submit(function(e) {
      e.preventDefault();
  
      var error = false;
  
      // Validate full name
      var name = $('#name').val().trim();
        if (!name) {
          $('#name-error').text('Please enter your full name');
          error = true;
          $('#name')
      } else {
        $('#name-error').text('');
      }
  
      // Validate house name
      var housename = $('#housename').val().trim();
      if (!housename) {
        $('#housename-error').text('Please enter your house name');
        error = true;
      } else {
        $('#housename-error').text('');
      }
  
      // Validate pincode
      var pincode = $('#pincode').val().trim();
      var pincode_regex = /^[0-9]{6}$/;
      if (!pincode || !pincode_regex.test(pincode)) {
        $('#pincode-error').text('Please enter a valid 6-digit pincode');
        error = true;
      } else {
        $('#pincode-error').text('');
      }
  
      // Validate city
      var city = $('#city').val().trim();
      if (!city) {
        $('#city-error').text('Please enter your city');
        error = true;
      } else {
        $('#city-error').text('');
      }
  
      // Validate district
      var district = $('#district').val().trim();
      if (!district) {
        $('#district-error').text('Please enter your district');
        error = true;
      } else {
        $('#district-error').text('');
      }
        // Validate state
        var state = $('#state').val().trim();
        if (!state) {
            $('#state-error').text('Please enter your state');
            error = true;
        } else {
            $('#state-error').text('');
        }
    
      // Validate mobile number
      var mobilenumber = $('#mobilenumber').val().trim();
      var mobilenumber_regex = /^[0-9]{10}$/;
      if (!mobilenumber || !mobilenumber_regex.test(mobilenumber)) {
        $('#mobilenumber-error').text('Please enter a valid 10-digit mobile number');
        error = true;
      } else {
        $('#mobilenumber-error').text('');
      }
  
      // Validate email
      var email = $('#email').val().trim();
      var email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !email_regex.test(email)) {
        $('#email-error').text('Please enter a valid email address');
        error = true;
      } else {
        $('#email-error').text('');
      }
      // Validate payment
      var payment = $('input[name="paymentType"]:checked').val();
      var paypal = $('#paypal:checked').val();
      console.log(paypal);
      if (!payment && !paypal) {
        $('#payment-error').text('Please select a payment type');
        error = true;
      } else {
        $('#payment-error').text('');
      }
      
      // Submit the form if no errors
      if (!error) {
        this.submit();
      }
    });
  });


  $(document).ready(function() {
    $('#editProfileForm').submit(function(e) {
      e.preventDefault();
  
      var error = false;
  
      // Validate full name
      var name = $('#name').val().trim();
        if (!name) {
          $('#name-error').text('Please enter your name');
          error = true;
          $('#name')
      } else {
        $('#name-error').text('');
      }
   
      // Validate email
      var email = $('#email').val().trim();
      var email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !email_regex.test(email)) {
        $('#email-error').text('Please enter a valid email address');
        error = true;
      } else {
        $('#email-error').text('');
      }

      // Validate mobile number
      var mobilenumber = $('#mobilenumber').val().trim();
      var mobilenumber_regex = /^[0-9]{10}$/;
      if (!mobilenumber || !mobilenumber_regex.test(mobilenumber)) {
        $('#mobilenumber-error').text('Please enter a valid 10-digit mobile number');
        error = true;
      } else {
        $('#mobilenumber-error').text('');
      }
   
      // Submit the form if no errors
      if (!error) {
        this.submit();
      }
    });
  });

  



