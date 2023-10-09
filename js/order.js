let productRowCount = 0; 

// Fungsi untuk menambah row produk
function addProductRow() {
    const productRows = document.querySelector(".product-rows");

    // Membuat row baru
    const newRow = document.createElement("div");
    newRow.classList.add("product-row");

    // menambahkan field untuk mengisi produk lebih dari 1
    newRow.innerHTML = `
    <label class="required" for="produk">Produk</label> 
    <select name="produk" class="produk-dropdown" required>
        <option value="" disabled selected>Pilih Produk</option>
    </select>
    <div class="item-row">
        <div class="col-30">
        <label class="required" for="jumlah">Jumlah</label> 
            <input type="text" name="jumlah" class="form-jumlah" placeholder="100" required>        
        </div>
        <div class="col-30">
        <label class="required" for="satuan">Satuan</label>
            <select name="satuan" id="satuanId" required>
                <option value="" disabled selected>Pilih</option>
                <option value="kg">kg</option>
                <option value="gr">gr</option>
                <option value="pcs">pcs</option>
            </select>
        </div>
    </div><hr>`;

    // Append row baru ke container
    productRows.appendChild(newRow);

    // Mengambil dropdown product untuk di row baru 
    getProductDropdown(newRow.querySelector(".produk-dropdown"));

    // Menambahkan hitungan row
    productRowCount++;

    //Jika row nya lebih dari satu menampilkan remove button
    const removeButton = document.querySelector(".btn-remove");
    if (productRowCount > 0) {
        removeButton.style.display = "inline-block";
    }
}

// fungsi untuk menghapus row produk
function removeLastProductRow() {
    const productRows = document.querySelector(".product-rows");
    const rows = productRows.querySelectorAll(".product-row");

    if (rows.length > 0) {
        const lastRow = rows[rows.length - 1];
        lastRow.remove();

        // Mengurangi hitungan jumlah row
        productRowCount--;

        // kalau tidak ada row produk baru remove button hilang
        const removeButton = document.querySelector(".btn-remove");
        if (productRowCount === 0) {
            removeButton.style.display = "none";
        }
    }
}
// fungsi untuk mengambil data produk untuk dropdown
async function getProductDropdown(dropdown) {
    try {
        const res = await fetch('https://be-semarang-8-production.up.railway.app/api/products'); //fetch data

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const resJSON = await res.json();

        if (resJSON.success) {
            const productList = resJSON.data;

            // Looping produk untuk membuat option untuk masing-masing
            productList.forEach((product) => {
                const option = document.createElement('option');
                option.value = product.name; 
                option.textContent = product.name; 
                dropdown.appendChild(option);
            });

            //memanggil fungsi setProductDropdownValue
            setProductDropdownValue();
        }
    } catch (error) {
        console.error(error);
    }
}

//mendefinisikan function untuk mengambil value dari parameter di URL
function getQueryParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// fungsi untuk menentukan value dropdown dari parameter URL
function setProductDropdownValue() {
    const produkDropdown = document.getElementById('produkDropdown');

    //untuk mengambil value dari parameter produk di URL dan disimpan di const
    const produkValue = getQueryParameter('produk');

    // Jika value query 'produk' ada, set menjadi value dropdown 
    if (produkValue) {
        produkDropdown.value = produkValue;
    }
}

//memanggil fungsi untuk getProductDropdown
document.addEventListener('DOMContentLoaded', function () {
    getProductDropdown(document.querySelector(".produk-dropdown"));
});

// fungsi untuk data produk ketika melakukan order 
function collectProductInfo() {
    const productRows = document.querySelectorAll('.product-rows .product-row');
    const firstProduct = document.querySelector('.first-product');

    //const array untuk menyimpan info produk
    const productInfo = [];

    //mengambil data dari produk pertama (yang bukan di-row tambahan)
    if (firstProduct) {
        const firstProductName = firstProduct.querySelector('.produk-dropdown');
        const firstProductQuantity = firstProduct.querySelector('.form-jumlah');
        const firstProductSatuan = firstProduct.querySelector('select[name="satuan"]');

        //Jika ada value disimpan di const
        if (firstProductName && firstProductQuantity && firstProductSatuan) {
            const productName = firstProductName.value;
            const quantity = firstProductQuantity.value;
            const satuan = firstProductSatuan.value;

            //value disimpan ke array
            productInfo.push({ productName, quantity, satuan });
        }
    }

    // mengambil data dari product rows melakukan loop dari masing-masing row
    productRows.forEach((row) => {
        const productNameElement = row.querySelector('.produk-dropdown');
        const quantityElement = row.querySelector('.form-jumlah');
        const satuanElement = row.querySelector('select[name="satuan"]');
        
        //Jika ada value disimpan di const
        if (productNameElement && quantityElement && satuanElement) {
            const productName = productNameElement.value; 
            const quantity = quantityElement.value;
            const satuan = satuanElement.value;

            //value disimpan ke array
            productInfo.push({ productName, quantity, satuan });
        }
    });

    return productInfo;
}

// Mendefinisikan function untuk submit form
async function submitForm(event) {
    event.preventDefault();
    // mengumpulkan data order
    const name = document.getElementById("form-nama").value;
    const address = document.getElementById("form-alamat").value;
    const phone = document.getElementById("form-notelp").value;
    const email = document.getElementById("form-email").value;
    const province = document.getElementById("form-prov").value;
    const city = document.getElementById("form-kota").value;
    const district = document.getElementById("form-kecamatan").value;
    const postalcode = document.getElementById("form-kpos").value;
    const productInfo = collectProductInfo();

    // disimpan di order data
    const orderData = {
        name,
        address,
        phone,
        email,
        province,
        city,
        district,
        postalcode,
        products: productInfo,
    };

    try {
        // membuat POST request orderData ke backend API
        const response = await fetch('https://be-semarang-8-production.up.railway.app/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        const responseData = await response.json();

        if (responseData.success) {
            // Jika order berhasil
            alert("Terima kasih telah membeli dari Pasar Segar");
            location.reload(); 
        } else {
            alert("Gagal melakukan pemesanan. Silakan coba lagi.");
            location.reload();
        }
    } catch (error) {
        console.error(error);
        alert("Gagal melakukan pemesanan. Silakan coba lagi.");
        location.reload();
    }

}

function summaryOrder() {
    const name = document.getElementById("form-nama").value;
    const address = document.getElementById("form-alamat").value;
    const phone = document.getElementById("form-notelp").value;
    const email = document.getElementById("form-email").value;
    const province = document.getElementById("form-prov").value;
    const city = document.getElementById("form-kota").value;
    const district = document.getElementById("form-kecamatan").value;
    const postalcode = document.getElementById("form-kpos").value;
    const productInfo = collectProductInfo();

    if (
        name === "" ||
        address.value === "" ||
        phone.trim() === "" ||
        email.trim() === "" ||
        province.trim() === "" ||
        city.trim() === "" ||
        district.trim() === "" ||
        postalcode.trim() === "" ||
        productInfo.some((fill) => {
            return (
                fill.productName.trim() === "" ||
                fill.quantity.trim() === "" ||
                fill.satuan.trim() === ""
            );
        })
    ) {
        alert("Please fill in all required fields.");
        return;
    }    

    // Create a string with the form information
    const formInfo = `
        <h2>Order Summary</h2>
        <p><strong>Nama:</strong> ${name}</p>
        <p><strong>Alamat:</strong> ${address}</p>
        <p><strong>No. Telepon:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Provinsi:</strong> ${province}</p>
        <p><strong>Kota:</strong> ${city}</p>
        <p><strong>Kecamatan:</strong> ${district}</p>
        <p><strong>Kode Pos:</strong> ${postalcode}</p>
        <hr>
    `;    

    // Create a table for product details
    let productTable = '<table><thead><tr><th>Produk</th><th>Jumlah</th></tr></thead><tbody>';

    productInfo.forEach((product) => {
        productTable += `
            <tr>
                <td>${product.productName}</td>
                <td>${product.quantity} ${product.satuan}</td>
            </tr>
        `;
    });

    productTable += '</tbody></table>';

    // Combine form information and product table
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = formInfo + productTable;

    // Add "Confirm" button to the modal content
    modalContent.innerHTML += `
        <br><br>
        <button class="btn-confirm">Konfirmasi</button>
        <button class="btn-cancel">Tutup</button>
    `;

    // Display the modal after populating its content
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'block';
    }
// Close modal when the "Tutup" button is clicked
    const closeModalButton = modalContent.querySelector(".btn-cancel");
    if (closeModalButton) {
        
        closeModalButton.addEventListener('click', function (event) {
            event.preventDefault();
            modal.style.display = "none"; 
        });
    }
}

const buttonModal = document.querySelector(".order-form .btn");
buttonModal.addEventListener("click", function (event) {
    summaryOrder(event);
});

// Attach a click event listener to the document or a suitable parent element
document.addEventListener('click', function (event) {
    const target = event.target;

    if (target.classList.contains('btn-confirm')) {
        // Call the submitForm function when the button is clicked
        submitForm(event);
    }
});
